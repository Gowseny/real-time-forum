package tools

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"rtforum/sqldb"
	"time"

	uuid "github.com/satori/go.uuid"
	"golang.org/x/crypto/bcrypt"
)


//function for login
//Populate the LoginData struct, validate user password,
//generate cookie data and upload these into database 'Sessions' table

func Login(w http.ResponseWriter, r *http.Request) {


	if r.Method == "GET" {
		w.Write([]byte("No."))
		return
	}

	var loginData LoginData

	loginD, err := io.ReadAll(r.Body)
	if err != nil {
		log.Fatal(err)
	}

	json.Unmarshal(loginD, &loginData)
	LogUserName := loginData.UserName
	LogPassword := loginData.Password

	// retrieve password from db to compare (hash) with user supplied password's hash
	var hash string

	stmt := "SELECT passwordhash FROM Users WHERE nickName = ? OR email = ?"
	row := sqldb.DB.QueryRow(stmt, LogUserName, LogUserName)
	err2 := row.Scan(&hash)

	fmt.Println(err2)

	if err2 != nil {
		fmt.Println("err2 selecting passwordhash in db by nickName or email:", err2)
		if err2.Error() == "sql: no rows in result set" {
			fmt.Println("on track1")
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("ERROR: This username/email doesnt exist, please register to enter this forum"))
			return
		}
	}

	// func CompareHashAndPassword(hashed password, password []byte) error
	comparePass := bcrypt.CompareHashAndPassword([]byte(hash), []byte(LogPassword))

	fmt.Println("compare 'passwordhash' with user's pw: ", comparePass)
	fmt.Println("'passwordhash' and 'hash': ", []byte(LogPassword), []byte(hash))

	//returns nil on success
	if comparePass != nil {
		if (comparePass.Error()) == "crypto/bcrypt: hashedPassword is not the hash of the given password" {
			w.WriteHeader(http.StatusBadRequest)
			fmt.Println("on track2")
			w.Write([]byte("ERROR: please enter correct password"))
			return
		}
		// convey status to browser
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("ERROR: please check password"))
		fmt.Println("Error from comparing 'passwordhash' with user's pw: ", comparePass)
		return
	}

	if comparePass == nil {
		fmt.Println("user logged in : ", loginData.UserName)
		stmtCurrentUer := "SELECT * FROM Users WHERE nickName = ? OR email = ?"
		rowCurrentUser := sqldb.DB.QueryRow(stmtCurrentUer, LogUserName, LogUserName)

		err3 := rowCurrentUser.Scan(&CurrentUser.UserID, &CurrentUser.FirstName, &CurrentUser.LastName, &CurrentUser.NickName, &CurrentUser.Age, &CurrentUser.Gender, &CurrentUser.Email, &CurrentUser.Password)
		if err3 != nil {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("ERROR"))
			fmt.Println("error with currentUser", err3)
			// fmt.Println("error accessing DB")
			return
		}

		fmt.Println("CurrentUser", CurrentUser)
		err3 = IsUserAuthenticated(w, &CurrentUser)
		fmt.Println("IsUserAuthenticated err3: ", err3)

		// ERROR: 3. returns error if user already logged in elsewhere
		if err3 != nil {
			// StatusBadRequest = 400
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("ERROR"))
			// fmt.Println("You are already logged in 🧐")
			fmt.Println("already logged in: ", err3)
			return
		}

		sessionToken := uuid.NewV4().String()
		expiresAt := time.Now().Add(120 * time.Minute)
		cookieNm := "user_session"

		// Finally, we set the client cookie for "session_token = 'user_session' " as the session token we just generated
		// we also set an expiry time of 120 minutes
		http.SetCookie(w, &http.Cookie{
			Name:    cookieNm,
			Value:   sessionToken,
			MaxAge:  7200,
			Expires: expiresAt,
			// SameSite: true,
			// HttpOnly: true, //removed in order to allow Javascript to access cookie
		})

		// storing the cookie values in struct
		user_session := Cookie{cookieNm, sessionToken, expiresAt}
		fmt.Println("++++++++++===========================Values in 'Cookie' struct :", user_session)
		
		insertsessStmt, err4 := sqldb.DB.Prepare(`INSERT INTO Sessions (userID, cookieName, cookieValue) VALUES (?, ?, ?)`)
		if err4 != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Println("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!err4 with inserting session:", err4)
			return
		}

		defer insertsessStmt.Close()
		insertsessStmt.Exec(CurrentUser.UserID, cookieNm, sessionToken)
		fmt.Println("PASSWORD IS CORRECT")
		fmt.Println("User successfully logged in")
	}

	marshalledUser, err := json.Marshal(CurrentUser)
	if err != nil {
		log.Fatal(err)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(marshalledUser))
	// GetAllUsers()

}

func GetAllUsers() []byte {
	//space at start of websocket message signals that this is the list of users
	var allUsers []string

	rows, errUsr := sqldb.DB.Query("SELECT DISTINCT nickName FROM Users ORDER BY email ASC;")
	if errUsr != nil {
		fmt.Println("Error retrieving users from database:  line 147\n", errUsr)
		return nil
	}

	for rows.Next() {
		var tempUser string
		err := rows.Scan(&tempUser)
		if err != nil {
			fmt.Println("err: ", err)
		}
		allUsers = append(allUsers, tempUser)
	}

	rows.Close()

	sortedUsers:= GetRecentChatUsers() 
	registeredUsers:= GetRecentChatUsers() 
	for i:= 0 ; i < len(allUsers); i++{
		 check:= false
		for k:= 0 ; k < len(registeredUsers); k++{
			if registeredUsers[k] == allUsers[i]{
		check = true
			}
		}
		if check == false {
			sortedUsers = append(sortedUsers, allUsers[i])
						}
	 }
	
	returnValue := ""
	for _, user := range sortedUsers {
		returnValue +=  "\n" + user 
	}
	
	return []byte(returnValue)
}

func GetAllOnlineUsers()[]string{
	var AllOnlineUsers []string
	rows, errUsr := sqldb.DB.Query("SELECT userID FROM Sessions;")
	if errUsr != nil {
		fmt.Println("Error retrieving users from database: \n", errUsr)
		return nil
	}
	for rows.Next() {
		var tempUser int
		var tempUserNickname string
		err := rows.Scan(&tempUser)
		if err != nil {
			fmt.Println("err: ", err)
		}
		rows2 ,err2 := sqldb.DB.Query("SELECT nickName FROM Users WHERE userID=?;", tempUser)
		if err2 != nil {
			log.Fatal(err)
		}
		defer rows2.Close()
		for rows2.Next(){
			rows2.Scan(&tempUserNickname)
			AllOnlineUsers = append(AllOnlineUsers, tempUserNickname)
		}
		}
	rows.Close()
	return AllOnlineUsers
}

//Retrieve from db all posts that will be shown on R-T-F front page
func AllPosts() []byte {
	var postData post
	var postItem string
	stmt := "SELECT author, category, title, content FROM Posts WHERE author = ?"
	row := sqldb.DB.QueryRow(stmt, '*')
	err := row.Scan(&postData.Author, &postData.Category, &postData.Title, &postData.Content)
	if err != nil {
		fmt.Println("err selecting postData in db", err)
	}
	fmt.Println("postData: ", postData)
	postItem = postData.Author + " " + postData.Category + " " + postData.Title + " " + postData.Content + "\n"
	fmt.Println("postItem: ", postItem)
	onePost := []byte(postItem)
	return onePost
}

func GetRecentChatUsers()[]string{
	fmt.Println("-------------",CurrentUser.NickName, "--------------------------------")
	
	// var AllRecentChatUsers []string
	rows,errUsr := sqldb.DB.Query(`SELECT * 
	FROM Chats 
	WHERE user1 = ? OR user2 = ?
	ORDER BY creationDate DESC;`, CurrentUser.NickName, CurrentUser.NickName)
	
	if errUsr != nil {
		fmt.Println("GetRecentChatUser err: ", errUsr)
	}

	// defer rows.Close()
	var Chats []Chat
	
	for rows.Next() {
		var tempChat Chat
		rows.Scan(&tempChat.ChatID,&tempChat.User1,&tempChat.User2,&tempChat.Date )
		Chats = append(Chats, tempChat)
	}
	var returnValue []string
	tempusername:=""
	
	for i:=0; i< len(Chats); i++{
		tempusername= ""
		if Chats[i].User1 != CurrentUser.NickName {
			tempusername = Chats[i].User1 
		}else {
			tempusername = Chats[i].User2
		}
		returnValue = append(returnValue, tempusername)
	}

	return returnValue
}