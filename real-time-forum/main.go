package main

import (
	"fmt"
	"log"
	"net/http"
	"os/exec"
	"rtforum/chat"
	"rtforum/database"
	"rtforum/sqldb"
	"rtforum/tools"

	_ "github.com/mattn/go-sqlite3"
)

func main() {

	DB := sqldb.ConnectDB()
	database.CreateDB()
	hub := chat.NewHub(DB)
	// go hub.LogConns()
	go hub.Run()

	cssFolder := http.FileServer(http.Dir("css/"))
	http.Handle("/css/",
		http.StripPrefix("/css/", cssFolder))

	jsFolder := http.FileServer(http.Dir("js/"))
	http.Handle("/js/",
		http.StripPrefix("/js/", jsFolder))

	http.HandleFunc("/", tools.HomePage)
	http.HandleFunc("/login", tools.Login)
	http.HandleFunc("/register", tools.Register)
	http.HandleFunc("/post", tools.Posts)
	http.HandleFunc("/comment", tools.Comments)
	http.HandleFunc("/getPosts", tools.SendLatestPosts)
	http.HandleFunc("/getComments", tools.SendLatestComments)
	http.HandleFunc("/logout", func(w http.ResponseWriter, r *http.Request) {
		chat.Logout(w, r, hub)
	})
	http.HandleFunc("/messagesAPI", tools.GetMessages)

	//serveWs function is a HTTP handler that upgrades the HTTP connection
	//to the WebSocket protocol, creates a Client type, registers the Client
	//with the hub and schedules the Client to be unregistered
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		chat.ServeWs(hub, w, r)
	})

	exec.Command("xdg-open", "http://localhost:8080/").Start()

	fmt.Println("Starting server at port 8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal(err)
	}
}
