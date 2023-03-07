package tools

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"rtforum/sqldb"

	"golang.org/x/crypto/bcrypt"
)

//instance of the User Struct
var CurrentUser User

//Upload data into User's Table by populating the user Struct
func Register(w http.ResponseWriter, r *http.Request) {

	bytes, err := io.ReadAll(r.Body)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Json from Regsister: ", string(bytes))

	json.Unmarshal(bytes, &CurrentUser)

	var hash []byte
	password := CurrentUser.Password
	// func GenerateFromPassword(password []byte, cost int) ([]byte, error)
	hash, err4 := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	if err4 != nil {
		// StatusNotAcceptable = 406
		w.WriteHeader(http.StatusNotAcceptable)
		fmt.Println("bcrypt err4:", err4)
		return
	}

	_, err = sqldb.DB.Exec(`INSERT INTO Users ( 
		firstName,
		lastName,
		nickName,
		age,
		gender,
		email,
		passwordhash
		) VALUES(?,?,?,?,?,?,?)`, CurrentUser.FirstName, CurrentUser.LastName, CurrentUser.NickName, CurrentUser.Age, CurrentUser.Gender, CurrentUser.Email, hash)

	if err != nil {
		// Convey StatusBadRequest = 400 to browser
		w.WriteHeader(http.StatusBadRequest)
		
		fmt.Println("Error inserting into 'Users' table: ", err)
		// convey exact error message to be displayed at browser end
		if(err.Error() =="UNIQUE constraint failed: Users.email"){
			w.Write([]byte("ERROR: This email already exists, please log in instead"))
		} else if (err.Error() == "UNIQUE constraint failed: Users.nickName"){
			w.Write([]byte("ERROR: This username already exists, please log in instead"))
		}
		// w.Write([]byte(err.Error()))
		return
	}
	// StatusCreated = 201
	w.WriteHeader(http.StatusCreated)
}
