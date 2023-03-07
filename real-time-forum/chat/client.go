package chat

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"rtforum/tools"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 1 * time.Second
	// Time allowed to read the next pong message from the peer.
	pongWait = 4 * time.Second
	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10
	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// Client is a middleman between the websocket connection and the hub.
type Client struct {
	Hub *Hub
	// username is the ID of the user who is connected to the websocket
	Username string
	// The websocket connection.
	Conn *websocket.Conn
	// Buffered channel of outbound messages.
	Send chan []byte
}

// sends the registeredUsers to the ws client as a byte slice.
func (c *Client) SendRegisteredUsers(conn *websocket.Conn) {
	//put database query result in registeredUsers
	registeredUsers := tools.GetAllUsers()

	err := c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
	if err != nil {
		// The hub closed the channel.
		c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
		return
	}
	w, err := c.Conn.NextWriter(websocket.TextMessage)
	if err != nil {
		return
	}
	x := strings.Split(string(registeredUsers), "\n")

	// matching online users from sessions table and adding online flag to segregate later in JS
	onlineUserNames := tools.GetAllOnlineUsers()
	for i := 1; i < len(x); i++ {
		for k := 0; k < len(onlineUserNames); k++ {
			if x[i] == onlineUserNames[k] {
				x[i] += "-online"
			}
		}
		registeredUsers = []byte(strings.Join(x, "\n"))
	}
	// fmt.Println("\n","reguseres",string(registeredUsers),+ len(registeredUsers))
	w.Write(registeredUsers)
	// Add queued chat messages to the current websocket message.
	n := len(c.Send)
	for i := 0; i < n; i++ {
		if string(registeredUsers[i]) == string(newline) {
			w.Write(newline)
		}
		w.Write(<-c.Send)
	}
	if err := w.Close(); err != nil {
		return
	}
}

// msgToHub go routine reads messages from the webSocket connection and sends them to the hub
// The application runs msgToHub in a per-connection goroutine. The application ensures that there is at most one reader on a connection by executing all reads from this goroutine.
// msgToHub == readPump
func (c *Client) msgToHub() {
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()
	c.Conn.SetReadLimit(maxMessageSize)
	c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error { c.Conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
		message = bytes.TrimSpace(bytes.Replace(message, newline, space, -1))
		c.Hub.Broadcast <- message
	}
}

// A goroutine running msgFromHub is started for each connection.
// msgFromHub go routine reads messages from client's 'send' channel and writes them to the websocket connection.
// msgFromHub == writePump
func (c *Client) msgFromHub() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)
			// Add queued chat messages to the current websocket message.
			n := len(c.Send)
			for i := 0; i < n; i++ {
				w.Write(newline)
				w.Write(<-c.Send)
			}
			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// serveWs handles websocket requests from the peer.
func ServeWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	cookie, err := r.Cookie("user_session")
	fmt.Println("cookie.name: ", &cookie.Name)
	if err != nil {
		fmt.Println("cookie err : ", err)
		return
	}
	// return user data via cookie
	fmt.Println("cookie: ", cookie.Value)
	usr := tools.GetUserByCookie(cookie.Value)
	userName := usr.NickName
	fmt.Println("userName: ", userName)
	client := &Client{Hub: hub, Username: userName, Conn: conn, Send: make(chan []byte, 256)}
	client.Hub.Register <- client
	// Allow collection of memory referenced by the caller by doing all work in new goroutines.
	go client.msgFromHub()
	go client.msgToHub()
	//send json of registered users to client
	go client.SendRegisteredUsers(conn)

}

// logout handle
func Logout(w http.ResponseWriter, r *http.Request, hub *Hub) {
	var cooky tools.Cookie

	if r.URL.Path == "/logout" {

		cookieVal, err := io.ReadAll(r.Body)
		fmt.Println("cookieVal before unmarshalled", cookieVal)
		if err != nil {
			log.Fatal(err)
		}
		cookieStringBefore := string(cookieVal[:])
		//separate cookie name from cookie value
		cValue := strings.Split(cookieStringBefore, ":")
		//get cookie value
		cookieStringAfter := (cValue[1])
		//count the number of runes in coookieStringAfter
		//so that you drop the final '}'
		numRunes := utf8.RuneCountInString(cookieStringAfter)
		fmt.Println("the number of runes in cookie: ", numRunes)
		cookieStringByte := []byte(cookieStringAfter)
		//to remove the curly bracket at end of cookie value
		cookieStringAfter = string(cookieStringByte[0 : numRunes-1])
		fmt.Println("the correct cookie: --->", cookieStringAfter)
		//populate the Cookie struct field 'Value' with cookie value
		json.Unmarshal([]byte(cookieStringAfter), &cooky.Value)

		fmt.Println("cookie value before unmarshal: ", cookieStringBefore)
		fmt.Println("cookie value after unmarshal: ", string(cookieStringAfter))
		//delete corresponding row in 'Sessions' table
		//and delete cookie in browser
		userName := tools.GetUserByCookie(string(cooky.Value))
		tools.DeleteSession(w, string(cooky.Value))

		fmt.Println("user logged out")
		//http.Redirect(w, r, "/", http.StatusFound)

		fmt.Println("user to delete from Clients: " + userName.NickName)
		var offline Offline
		offline.Name = userName.NickName
		delete(hub.Clients, userName.NickName)
		// update offline users here
		fmt.Println(hub.Clients)

		offline.Label = "offline"
		for _, cl := range hub.Clients {
			w, err := cl.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			off, _ := json.Marshal(offline)
			w.Write(off)
		}

	}
}
