package chat

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"rtforum/tools"
	"time"

	"github.com/gorilla/websocket"
)

// Hub maintains the set of active clients and broadcasts messages to the clients.
type Hub struct {
	// Registered clients.
	Clients map[string]*Client
	// Inbound messages from the clients.
	Broadcast chan []byte
	// Register requests from the clients.
	Register chan *Client
	// Unregister requests from clients.
	Unregister chan *Client
	// database connection
	Database *sql.DB
}

func NewHub(DB *sql.DB) *Hub {
	return &Hub{
		Broadcast:  make(chan []byte),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Clients:    make(map[string]*Client),
		Database:   DB,
	}
}

type Offline struct {
	Label string
	Name  string
}

type Online struct {
	Label string
	Name  string
}

func (h *Hub) Run() {
	for {
		select {
		// you can access the username here
		case client := <-h.Register:
			h.Clients[client.Username] = client
			// update online users here
			fmt.Println(h.Clients)
			if _, ok := h.Clients[client.Username]; ok {
				var online1 Online
				online1.Name = client.Username
				online1.Label = "online"
				for _, cl := range h.Clients {
					w, err := cl.Conn.NextWriter(websocket.TextMessage)
					if err != nil {
						return
					}
					on, _ := json.Marshal(online1)
					w.Write(on)
				}
			}
		case client := <-h.Unregister:
			h.Clients[client.Username] = client
			if _, ok := h.Clients[client.Username]; ok {
				// var offline Offline
				// offline.Name = client.Username
				delete(h.Clients, client.Username)
				close(client.Send)
				// update offline users here
				// fmt.Println(h.Clients)

				// offline.Label = "offline"
				// for _, cl := range h.Clients {
				// 	w, err := cl.Conn.NextWriter(websocket.TextMessage)
				// 	if err != nil {
				// 		return
				// 	}
				// 	off, _ := json.Marshal(offline)
				// 	w.Write(off)
				// }
			}
		case message := <-h.Broadcast:
			var directmsg tools.Message
			json.Unmarshal(message, &directmsg)
			if directmsg.Content == "" {
				var notifseen tools.Notification
				json.Unmarshal(message, &notifseen)
				tools.RemoveNotification(notifseen)

			} else {

				//stores a new chat
				chatHistoryVal := tools.CheckForChatHistory(directmsg)
				if !chatHistoryVal.ChatExists {
					tools.StoreChat(directmsg)
				} else {
					tools.UpdateChatTable(directmsg)
				}

				//stores new messages

				msgHistroryVal := tools.CheckForChatHistory(directmsg)
				if msgHistroryVal.ChatExists {
					directmsg.ChatID = msgHistroryVal.ChatID
					tools.StoreMessage(directmsg)
				}

				// inserting notification into DB, by checking for existing notifications if any
				newNotif := tools.CheckNotificationExists(directmsg)
				fmt.Println(newNotif)
				fmt.Println(newNotif == nil)
				if (newNotif == nil) || (!newNotif.NotifExists) {
					fmt.Println("if condition working")
					tools.AddNotification(directmsg)
				}

				for client := range h.Clients {

					if (client == directmsg.Recipient) || (client == directmsg.Sender) {
						select {
						case h.Clients[client].Send <- message:
						default:
							close(h.Clients[client].Send)
							delete(h.Clients, client)
						}
					}
				}
			}
		}
	}
}

func (h *Hub) LogConns() {
	for {
		fmt.Println(len(h.Clients), "clients connected")
		for userId := range h.Clients {
			fmt.Printf("client %v have %v connections\n", userId, len(h.Clients))
		}
		time.Sleep(1 * time.Second)
	}
}
