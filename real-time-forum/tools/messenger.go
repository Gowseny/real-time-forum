package tools

import (
	"encoding/json"
	"fmt"
	"net/http"
	"rtforum/sqldb"
	"time"
	"log"
)

// var dm Message
var newChat Chat
var Date = time.Now()

// checking if a prior chat exists between the two users
func CheckForChatHistory(dm Message) *ChatHistoryCheck {
	rows, err := sqldb.DB.Query(`SELECT user1, user2, chatID FROM Chats WHERE user1 = ? AND user2 =? OR user2 = ? AND user1 = ?;`, dm.Sender, dm.Recipient, dm.Sender, dm.Recipient)
	if err != nil {
		fmt.Println("Error from Chats", err)
	}
	var chatExists ChatHistoryCheck
	var chatScan Message
	defer rows.Close()
	for rows.Next() {
		err := rows.Scan(&chatScan.Sender, &chatScan.Recipient, &chatScan.ChatID)
		if err != nil {
			fmt.Println("ChatHistory check", err)
			return nil
		}
	}

	chatExists.ChatID = chatScan.ChatID
	chatExists.ChatExists = true
	if chatScan.ChatID == 0 {
		chatExists.ChatExists = false
	}

	fmt.Println("chatID: ", chatExists.ChatID)
	fmt.Println("chatExists: ", chatExists.ChatExists)

	return &chatExists
}

//storing messages to DB
func StoreMessage(dm Message) {
	stmt, err := sqldb.DB.Prepare(`INSERT INTO MessageHistory (chatID, chatMessage, sender, recipient, creationDate ) VALUES (?,?,?,?,? )`)
	if err != nil {
		fmt.Println("error adding message to DB", err)
		return
	}

	result, _ := stmt.Exec(dm.ChatID, dm.Content, dm.Sender, dm.Recipient, Date)
	rowsAff, _ := result.RowsAffected()
	LastIns, _ := result.LastInsertId()

	fmt.Println("messageHistory rows affected: ", rowsAff)
	fmt.Println("messageHistory last inserted: ", LastIns)
}

// storing chat to DB
func StoreChat(dm Message) {
	stmt, err := sqldb.DB.Prepare("INSERT INTO Chats (user1, user2, creationDate) VALUES (?, ?, ?)")
	if err != nil {
		fmt.Println("error adding chat to DB")
		return
	}

	result, _ := stmt.Exec(dm.Sender, dm.Recipient, Date)
	rowsAff, _ := result.RowsAffected()
	LastIns, _ := result.LastInsertId()

	fmt.Println("chat rows affected: ", rowsAff)
	fmt.Println("chat last inserted: ", LastIns)
}

func GetMessages(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		w.Write([]byte("No."))
		return
	}

	jsn := ExecuteSQL("SELECT * FROM MessageHistory")
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsn)
}

// https://stackoverflow.com/questions/43367505/function-in-go-to-execute-select-query-on-database-and-return-json-output
func ExecuteSQL(queryStr string) []byte {
	rows, err := sqldb.DB.Query(queryStr)
	if err != nil {
		fmt.Print(err.Error())
	}

	defer rows.Close()

	columns, _ := rows.Columns()
	count := len(columns)

	var v struct {
		Data []interface{} // json:"data"
	}

	for rows.Next() {
		values := make([]interface{}, count)
		valuePtrs := make([]interface{}, count)
		for i := range columns {
			valuePtrs[i] = &values[i]
		}

		if err := rows.Scan(valuePtrs...); err != nil {
			fmt.Println(err)
		}

		//Created a map to handle the issue
		var m map[string]interface{}
		m = make(map[string]interface{})
		
		for i := range columns {
			m[columns[i]] = values[i]
		}
		
		v.Data = append(v.Data, m)
	}
	// Put into list.
	data := v.Data
	jsonMsg, err := json.Marshal(data)
	return jsonMsg
}

func UpdateChatTable(dm Message){
	fmt.Println("updating",dm)
	rows, err := sqldb.DB.Prepare("UPDATE Chats SET creationDate =?  WHERE (user1 = ? AND user2 = ?) OR (user1 = ? AND user2 = ?);"); if err != nil {log.Fatal(err)}
	defer rows.Close()
	rows.Exec(Date,dm.Recipient,dm.Sender,dm.Sender,dm.Recipient)
}