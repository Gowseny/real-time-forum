package tools
import (
	"fmt"
	"rtforum/sqldb"
)
func CheckNotificationExists (dm Message) *NotificationCheck {
	rows, err := sqldb.DB.Query("SELECT * FROM Notifications WHERE (sender, recipient) VALUES (?,?) ;", dm.Sender, dm.Recipient )
	if err != nil {
		fmt.Println("Error getting notification for currentUser")
		return nil
	}
	var notification NotificationCheck
	defer rows.Close()
	for rows.Next(){
		err := rows.Scan(&notification.NotificationID, )
		if err != nil {
			fmt.Println("GetNotificationForCurrentUser error", err)
			return nil
		}
	}
	return &notification
}
func AddNotification(dm Message) {
	fmt.Println("adddnotification")
	stmt, err := sqldb.DB.Prepare("INSERT INTO Notifications (sender, recipient, count) VALUES (?, ?, ?)")
	if err != nil {
		fmt.Println("Error adding notification to DB")
		return
	}
fmt.Println(dm)
	result, _ := stmt.Exec(dm.Sender, dm.Recipient, 1)
	rowsAff, _ := result.RowsAffected()
	LastIns, _ := result.LastInsertId()
	fmt.Println("Notifications rows affected: ", rowsAff)
	fmt.Println("Notifications last inserted: ", LastIns)
}
func RemoveNotification(n Notification) {
	stmt, err := sqldb.DB.Prepare("DELETE FROM Notifications WHERE sender = ? AND recipient = ?")
	if err != nil {
		fmt.Println("Error removing notification from DB")
	}
	defer stmt.Close()
	stmt.Exec(n.NotificationSender,n.NotificationRecipient)
	if err != nil {
		fmt.Println("Error deleting notification: ", err)
	}
}
func GetAllNotificationForCurrentUser(currentUser string) []Notification {
	rows, err := sqldb.DB.Query("SELECT * FROM Notifications WHERE recipient = ? ;", currentUser)
	if err != nil {
		fmt.Println("Error getting notification for currentUser")
		return nil
	}
	defer rows.Close()
	var notificationData []Notification
	for rows.Next(){
		var notification  Notification
		err2 := rows.Scan(&notification.NotificationID, &notification.NotificationSender, &notification.NotificationRecipient, &notification.NotificationCount)
		notificationData = append(notificationData, notification)
		if err2 != nil {
			fmt.Println("GetNotificationForCurrentUser error", err2)		
			return nil
		}
	}
	return notificationData
}