package tools

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"rtforum/sqldb"
	"time"
)

var thePost post

func Posts(w http.ResponseWriter, r *http.Request) {

	var postTime = time.Now()

	bytes, err := io.ReadAll(r.Body)
	if err != nil {
		log.Fatal(err, "error with reading file Posts line 17")
	}

	json.Unmarshal(bytes, &thePost)
	fmt.Println(thePost, "WERE ARE GETTING HERE-=-=-=-=-=-=-=-=")
	CookieID := thePost.Cookie

	var usr = GetUserByCookie(CookieID)

	var usrID = usr.UserID

	_, err = sqldb.DB.Exec(`INSERT INTO Posts ( 
		authorID,
		author,
		title,
		content,
		category,
		creationDate,
		cookieID
		) VALUES(?,?,?,?,?,?,?)`, usrID, usr.NickName, thePost.Title, thePost.Content, thePost.Category, postTime, thePost.Cookie)
	if err != nil {
		fmt.Println("Error inserting into 'Posts' table: ", err)
		return
	}
}

func GetPosts() []post {
	var posts []post
	var myPost post
	
	rows, errPost := sqldb.DB.Query("SELECT postID, author, category, title, content, creationDate FROM Posts;")
	if errPost != nil {
		fmt.Println("Error retrieving posts from database: \n", errPost)
		return nil
	}

	for rows.Next() {
		//copy row columns into corresponding variables
		err := rows.Scan(&myPost.PostID, &myPost.Author, &myPost.Category, &myPost.Title, &myPost.Content, &myPost.PostTime)
		if err != nil {
			fmt.Println("error copying post data: ", err)
		}

		//aggregate all posts separated by '\n'
		posts = append(posts, myPost)
	}
	rows.Close()

	return posts
}

//To send all posts to front-end via http handle: "/getPosts"
func SendLatestPosts(w http.ResponseWriter, r *http.Request) {
	//Send user information back to client using JSON format
	posts := GetPosts()
	js, err := json.Marshal(posts)
	if err != nil {
		log.Fatal(err)
	}
	w.WriteHeader(http.StatusOK) //Ceck in authentication.js, alerts user
	w.Write([]byte(js))
}

func (p *post) Modify(ck string) {
	p.Cookie = ck
}
