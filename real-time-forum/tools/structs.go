package tools

import (
	"time"
)

type comment struct {
	CommentID      int
	Cookie         string    `json:"CommCookie"`
	Author         string    `json:"Author"`
	PostID         int       `json:"PstID"`
	Content        string    `json:"CommContent"`
	CommentTime    time.Time `json:"CommentTime"`
	CommentTimeStr string
}

type post struct {
	PostID      int       `json:"PostID"`
	Author      string    // author
	Cookie      string    `json:"PostCokID"`
	Title       string    `json:"PostTitl"`
	Content     string    `json:"PostCont"`
	Category    string    `json:"PostCat"`
	PostTime    time.Time `json:"PostTime"`
	PostTimeStr string
	Comments    []comment
	IPs         string
}

type User struct {
	UserID    int
	FirstName string `json:"FirstName"`
	LastName  string `json:"LastName"`
	NickName  string `json:"NickName"`
	Age       string `json:"Age"`
	Gender    string `json:"Gender"`
	Email     string `json:"Email"`
	Access    int    // 0 means no access, not logged in
	LoggedIn  bool
	Posts     []post
	Comments  []comment
	Password  string `json:"PassWord"`
}

type LoginData struct {
	UserName string `json:"LUserName"`
	Password string `json:"LPassW"`
}

// each session contains the username of the user and the time at which it expires
type Session struct {
	UserID      int
	sessionName string
	sessionUUID string
}

type Cookie struct {
	Name    string
	Value   string
	Expires time.Time
}

type Message struct {
	MessageID int
	ChatID int
	Sender string `json:"sender"`
	Recipient string `json:"recipient"`
	Content string `json:"content"`
	Type string
	Date time.Time `json:"date"`
}

type Chat struct {
	ChatID int
	User1  string
	User2  string
	Date   string
}

type ChatHistoryCheck struct {
	ChatID     int
	ChatExists bool
	// ChatHistory []Message
}

type Notification struct {
	NotificationID int
	NotificationSender string `json:"notificationsender"`
	NotificationRecipient string `json:"notificationrecipient"`
	NotificationCount int `json:"notificationcount"`
	NotificationSeen string `json:"notificationseen"`
}
type NotificationCheck struct {
	NotificationID int
	NotifExists bool
}
