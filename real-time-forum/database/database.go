package database

import (
	"rtforum/sqldb"
)

func CreateDB() {
	
	// user table
	sqldb.DB.Exec(`CREATE TABLE IF NOT EXISTS "Users" (
				"userID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
				"firstName" TEXT NOT NULL,
				"lastName" TEXT NOT NULL,				
				"nickName" TEXT NOT NULL,
				"age" INTEGER NOT NULL,
				"gender" TEXT NOT NULL,
				"email" TEXT NOT NULL UNIQUE, 
				"passwordhash" BLOB NOT NULL
				);`)

	// post table
	sqldb.DB.Exec(`CREATE TABLE IF NOT EXISTS "Posts" ( 
				"postID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
				"authorID" INTEGER NOT NULL,
				"author" TEXT NOT NULL,
				"title" TEXT NOT NULL, 
				"content" TEXT NOT NULL, 
				"category" TEXT NOT NULL,
				"creationDate" TIMESTAMP,
				"cookieID" TEXT NOT NULL,
				FOREIGN KEY(authorID)REFERENCES users(userID)
				);`)

	// category table
	sqldb.DB.Exec(`CREATE TABLE IF NOT EXISTS "Category" (
				"postID" INTEGER REFERENCES post(postID), 
				"category" TEXT NOT NULL
				);`)

	// comments table
	sqldb.DB.Exec(`CREATE TABLE IF NOT EXISTS "Comments" ( 
				"commentID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
				"postID" INTEGER NOT NULL,
				"authorID" INTEGER NOT NULL,
				"author" TEXT NOT NULL,
				"content" TEXT NOT NULL, 
				"creationDate" TIMESTAMP,
				FOREIGN KEY(postID)REFERENCES posts(postID),
				FOREIGN KEY(authorID)REFERENCES users(userID)
				);`)

	// sessions table
	sqldb.DB.Exec(`CREATE TABLE IF NOT EXISTS "Sessions" ( 
				"userID" INTEGER NOT NULL,
				"cookieName" TEXT NOT NULL,
				"cookieValue" STRING NOT NULL PRIMARY KEY, 
				FOREIGN KEY(userID)REFERENCES Users(userID)
				);`)

// Chats table
	sqldb.DB.Exec(`CREATE TABLE IF NOT EXISTS "Chats" ( 
				"chatID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
				"user1" TEXT,
				"user2" TEXT,
				"creationDate" TIMESTAMP, 
				FOREIGN KEY(user1)REFERENCES Users(nickName),
				FOREIGN KEY(user2)REFERENCES Users(nickName)
				);`)

	// MessageHistory table
	sqldb.DB.Exec(`CREATE TABLE IF NOT EXISTS "MessageHistory" ( 
				"messageID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
				"chatID" INTEGER,
				"chatMessage" STRING NOT NULL,
				"sender" TEXT,
				"recipient" TEXT,
				"creationDate" TIMESTAMP, 
				FOREIGN KEY(chatID)REFERENCES Chats(chatID),
				FOREIGN KEY(sender)REFERENCES Users(nickName),
				FOREIGN KEY(recipient)REFERENCES Users(nickName)
				);`)

				// Notifications table
	sqldb.DB.Exec(`CREATE TABLE IF NOT EXISTS "Notifications" ( 
		"notificationID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		"sender" TEXT,
		"recipient" TEXT,
		"count" INTEGER,
		FOREIGN KEY(sender)REFERENCES MessageHistory(sender),
		FOREIGN KEY(recipient)REFERENCES MessageHistory(recipient)
		);`)  
}
