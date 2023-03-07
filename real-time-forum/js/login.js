let LoginData;
let user;
let CurrentUser;
let CurUserNoti;
let today = Date.now();
let date = new Date(today);
let receiver;
let chatScroll;
let timerId = undefined


const logform = document.querySelector("#loginform");
let userName = logform.querySelector("#LUserName");
let Lpassword = logform.querySelector("#LPassW");

const setLoginErrorFor = (input, message) => {
  const loginFormControl = input.parentElement; // .reg-form-control
  const small = loginFormControl.querySelector("small");
  // add the error class
  loginFormControl.className = "login-form-control error";
  // all the error message inside the small tag
  small.innerHTML = message;
  // small.style.visibilty = "visible";
};

//send user input in the 'Login' form to the 'LoginData' struct in go
// via the 'LoginHandler' handler function in go
const LoginBtn = document.querySelector("#loginBtn");

//console.log("loginBtn id:", LoginBtn.getAttribute("style"))
LoginBtn.onclick = (e) => {
  //stop browser refreshing
  e.preventDefault();
  let UserName = document.querySelector("#LUserName").value;
  let LoginPw = document.querySelector("#LPassW").value;

  //make JS object to store login data
  LoginData = {
    LUserName: UserName,
    LPassW: LoginPw,
  };

  console.log({ LoginData });
  //Sending Login form's data with the Fetch API
  //to the 'LoginData' struct in go

  let configLogin = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(LoginData),
  };

  fetch("/login", configLogin)
    .then(function (response) {
      console.log(response);
      if (response.status == 200) {
        console.log("successful login");
        successfulLogin();
        refreshPostsAfterLogin();
        chatEventHandler();

        return response.text();
      } else {
        return response.text();
      }
    })
    .then((rsp) => {
      if (
        rsp ==
        "ERROR: This username/email doesnt exist, please register to enter this forum"
      ) {
        console.log("on track 1");
        setLoginErrorFor(
          userName,
          "Username/Email doesn't exist!"
        );
      } else if (rsp == "ERROR: please enter correct password") {
        console.log("on track 2");
        setLoginErrorFor(Lpassword, "Please enter correct password");
      } else {

        let userData = JSON.parse(rsp);
        CurrentUser = userData.NickName;
        CurUserNoti = userData.Notifications;
        showProfile(userData)

        var successlogin = document.getElementById("current-user");
        successlogin.innerHTML =
          CurrentUser + " &#128512";
        // if (user) {
        //   var successlogin = document.getElementById("current-user");
        //   successlogin.innerHTML = " Welcome " + CurrentUser;
        // }
      }
      return;
    });
};

// print profile data in the left side navigation
const showProfile = (user) => {
  console.log("showProfile called", user)
  WelMsg = document.getElementById('WelMsg');
  FName = document.getElementById('firstName');
  LName = document.getElementById('lastName');
  NName = document.getElementById('nickName');
  Age = document.getElementById('age');
  Gender = document.getElementById('gender');
  Email = document.getElementById('email');

  console.log(user.Age, user.Gender, user.Email)
  WelMsg.innerHTML = "&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; " + user.NickName;

  FName.innerHTML = "First Name :" + user.FirstName;
  LName.innerHTML = "Last Name :" + user.LastName;
  NName.innerHTML = "Nick Name :" + user.NickName;
  Age.innerHTML = "Age :" + user.Age;
  Gender.innerHTML = "Gender :" + user.Gender;
  Email.innerHTML = "Email :" + user.Email;

};

//unhide the user profile aftert clicking the 'Profile' hyperlink
//in the left-hand-side navigation
const showHideUserProfile = () => {
  let profileBlock = document.querySelector("#profileMod");
  if (profileBlock.style.display === "none") {
    profileBlock.style.display = "block";
    document.getElementById("postBlock").style.display = "none";
    document.getElementById("postListAfterLogin").style.display = "none";
    document.getElementById("postList").style.display = "none";
  } else {
    profileBlock.style.display = "none";
    document.getElementById("postBlock").style.display = "block";
    document.getElementById("postListAfterLogin").style.display = "block";

  }
}

const refreshPostsAfterLogin = () => {
  fetch("/getPosts", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
  })
    .then((response) => {
      response.text().then(function (data) {
        let posts = JSON.parse(data);
        console.log("posts:", posts);
        //post shows all latest posts from database
        displayPostsAfterLog(posts);
      });
    })
    .catch((error) => {
      console.log(error);
    });
  

  const displayPostsAfterLog = (posts) => {
  
    postsContainer = document.querySelector("#postListAfterLogin");
    postsContainer.innerHTML = "";
    for (let i = posts.length - 1; i >= 0; i--) {
    
      postsContainer.innerHTML +=
        `
            <div class="posts" style.display ="inline-block" id=` +

        `>
         
            
            <p class="post-content" >` + "Author: " +  posts[i].Author + `</p>
            <p class="post-content" >` +  "Category: " + posts[i].PostCat + `</p>
            <p class="post-content" >` +  "Title: " + posts[i].PostTitl + ` </p>
            <p class="post-content" >` + "Content: " + posts[i].PostCont + `</p>
            <p class="post-content" >` + "Created: " + ConvertDate(posts[i].PostTime) + `</p> 

    
            <div  style.display="inline-block" &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 
            &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
            &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;

            <button class="button" id="ShowComments" onclick="ShowCommentsBlock(${posts[i].PostID}) ;" style.text-align="center">` +
            " &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;" +
            " &nbsp; &nbsp; &nbsp; &nbsp;" +
            " &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp;&nbsp; &nbsp;  Show Comments" +
            `</button>
      </div>

      <div id="c${posts[i].PostID}" class="commentBlock" style='z-index: 1;', >
      <button class="button hideCommentBtn" id="button${posts[i].PostID}"  onclick= 'CloseComments(${posts[i].PostID}) ;'> ` + "Close" + `</button>
      /div>
            <br>  
            <br>  
            </div>
            </div> `;
    }
  };
};

const successfulLogin = () => {
  console.log("STATUS 200 OK");
  console.log("WERE ARE GETTING TO SUCCEDDFUL LOGIN FUNCTION");
  document.getElementById("wName").style.display = "block";
  document.getElementById("loginModal").style.display = "none";
  document.getElementById("LoggedOn").style.display = "block";
  document.getElementById("homePage").style.display = "none";
  document.getElementById("happyFace").style.display = "block";
  document.getElementById("addPost").style.display = "block";
  document.getElementById("login").style.display = "none";
  document.getElementById("register").style.display = "none";
  document.getElementById("welcomemsg").style.display = "none";
  document.getElementById("current-user").style.display = "block";
  document.getElementById("logout").style.display = "block";
  document.getElementById("postBlock").style.display = "block";
  document.getElementById("postList").style.display = "none";
  document.getElementById("usersLog").style.display = "block";
  document.getElementById("profile").style.display = "block";
  document.getElementById("Select User").style.display = "block";

  setTimeout(() => {
    console.log("WERE ARE GETTING TO TIMEOUT LOGIN SIDE");
    document.getElementById("LoggedOn").style.display = "none";
    document.getElementById("happyFace").style.display = "none";
    document.getElementById("happyFace").style.display = "none";

  }, 1500);


  postBtn = document.querySelector("#postBlock > button");
  postBtn.style.visibility = "visible";
  document.querySelector(".loggedInUsers").style.display = "block";

  refreshPostsAfterLogin();
};

const unsuccessfullLogin = () => {
  console.log("failed - not status 200");

  document.getElementById("loginModal").style.display = "none";
  document.getElementById("logRejected").style.display = "block";
  setTimeout(() => {
    document.getElementById("logRejected").style.display = "none";
  }, 1500);
  document.getElementById("postList").style.display = "block";
  document.getElementById("postBlock").style.display = "none";

};

const Logout = () => {
  document.querySelector(".chat-private").style.visibility = "hidden";
  document.getElementById("current-user").style.display = "none";
  document.getElementById("postList").style.display = "block";
  document.getElementById("homePage").style.display = "block";
  document.getElementById("wName").style.display = "none";
  document.getElementById("usersLog").style.display = "none";

};

//remove cookie from browser when logout
function LogoutDeleteCookie(){
	let deleteCookie = GetCookie("user_session");
  console.log({deleteCookie})
  let objDeleteCookie = {
    toDelete: deleteCookie,
  }
  console.log({objDeleteCookie})
  let configLogout = {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
   body: JSON.stringify(objDeleteCookie)

};

fetch("/logout", configLogout)
.then(function (response) {
  console.log(response);
  if (response.status == 200) {
    console.log("successful logout");

  } else {
    console.log("unccessful logout");

  }
})
}

//
//
// ====================================================
window.onload = function () {
  refreshPosts();
  // ChatReturn()

}

//============== Chat scroll variables ======================
//private messages history array
let MessagesForDisplay = []
var CountNewMessages = 0;
let MsgsInChat;

async function chatEventHandler() {

  var conn;

  var usersLog = document.getElementById("usersLog");

  let configMsg = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };
  // fetch messages from back end
  let messages = await fetch("/messagesAPI", configMsg);
  messages = await messages.json();
  
  // TODO: 2. **get ONLINE USERS list updated in real time
  // TODO: 3. using THROTTLE / DEBOUNCE on scrolling event to display 10 message in reverse order
  // TODO: 4. arrange users with chat(according to most recent descending order)
  
  
  function AppendUser(item) {
    console.log(item.innerHTML, "--------");
    // var doScroll =
    //   usersLog.scrollTop > usersLog.scrollHeight - usersLog.clientHeight - 1;

    // if current user, do not display. (return) because AppendUser() is called in a loop.
    if (item.innerHTML === CurrentUser) {
      return;
    }
    //notification after logging in if new messages are present
    if (CurUserNoti != null) {
      for (let i = 0; i < CurUserNoti.length; i++) {
        if (item.innerHTML == CurUserNoti[i].notificationsender) {
          // let notiItem = CurUserNoti[i].notificationsender; //This variable is not being called anywhere
          item.classList.add("notification");
        }
      }
    }

    //making individual chat-modals for all users
    let chatModal = document.createElement("div");
    chatModal.className = "chat-modal";
    console.log(item.innerHTML);
    chatModal.id = "chat-modal-" + item.innerHTML;
    
    let chatTitleBox = document.createElement("div");
    chatTitleBox.className = "chat-title-box-" + item.innerHTML;
    
    let but = document.createElement("button");
    but.setAttribute("value", "closeBtn");
    but.className = "message-close";
    but.id = "btn-" + item.innerHTML;

    let h2 = document.createElement("h2");
    h2.className = "chat-title";
    h2.id = "recipient-" + item.innerHTML;
    chatTitleBox.append(but);
    chatTitleBox.append(h2);
    
    let messageHtml = document.createElement("div");
    messageHtml.className = "messages-" + item.innerHTML;
    
    // message content box for scroll event
    let messageHtml2 = document.createElement("div");
    messageHtml2.className = "messages-content";
    messageHtml2.id = "log-" + item.innerHTML;
    
    let messageBox = document.createElement("div");
    messageBox.className = "message-box";
    messageBox.id = "message-box-" + item.innerHTML;
    
    let mesInput = document.createElement("input");
    mesInput.setAttribute("type", "text");
    mesInput.id = "msg-" + item.innerHTML;
    mesInput.className = "message-input";
    mesInput.setAttribute("placeholder", "Type message...");
    
    let but2 = document.createElement("button");
    but2.className = "message-submit";
    but2.id = "msg-send-btn-" + item.innerHTML;
    but2.innerText = "Send";
    messageBox.append(mesInput);
    messageBox.append(but2);
    messageHtml.append(messageHtml2, messageBox);
    chatModal.append(chatTitleBox, messageHtml);
    chatModal.style.display = "none";
    
    let chat = document.querySelector(".chat-private");
    chat.append(chatModal);
    console.log("append", chatModal);
    usersLog.appendChild(item);
    item.innerHTML = item.innerHTML;
    
    // if (doScroll) {
    //   usersLog.scrollTop = usersLog.scrollHeight - usersLog.clientHeight;
    // }
    

    // opening private chat window on clicking on selected users
    item.onclick = () => {
      chat.style.visibility = "visible";
      let chosenId = "#chat-modal-" + item.innerHTML;
      let receiverChatbox = document.querySelector(chosenId);
      receiverChatbox.style.display = "block";
      h2.innerHTML = "Messaging - " + item.innerHTML;

      // if condition for removing notification
      if (item.classList.contains("notification")) {
        // object of notification to send to front end
        let notification = {
          NotificationSender: item.innerHTML,
          NotificationRecipient: CurrentUser,
          NotificationSeen: "seen",
        };
        conn.send(JSON.stringify(notification));
        item.classList.remove("notification");
      }

      // **filter** and append correct messages to chat window
      messages.forEach((message) => {

        // 1. when current user is sender
        if (
          message.sender === CurrentUser &&
          message.recipient === item.innerHTML
        ) {
          
          MessagesForDisplay.push(message)
        } else if (
          message.recipient === CurrentUser &&
          message.sender === item.innerHTML
        ) {
          // 2. when current user is recipient
          MessagesForDisplay.push(message)
        }
      });

      //clearing message content when exit btn clicked

      // click event for exit chat btn
      
      document.getElementById("btn-" + item.innerHTML).onclick = () => {
        let chat = document.querySelector(".chat-private");
        chat.style.visibility = "hidden";
        let chosenChatbox = Array.from(document.querySelectorAll(".chat-modal"));
        if (chosenChatbox != null) {
          chosenChatbox.forEach((element) => {
            element.style.display = "none";
          });
        }
        document.getElementById("log-" + item.innerHTML).innerHTML = ""
        // needed to remove bubbling event
        // document.getElementById("log-" + item.innerHTML).removeEventListener("scroll")
      }

      //show ten or less messages when opening the chat
    
      addTen(MessagesForDisplay, 10, item.innerHTML)

      // chat scroll event

      chatScroll = document.getElementById("log-" + item.innerHTML) 

      const loadMsg = function () {
          let ParentDiv = document.getElementById("log-" + item.innerHTML)

          MsgsInChat = ParentDiv.children.length - CountNewMessages;//<=== subtracting 1 to get correct #of messages
          //find array index for the most recent message yet to be printed
          let cutoffIndex = MessagesForDisplay.length - MsgsInChat;
          //make a new slice that only includes messages yet to be printed
          //adding one here as the 'slice' method excludes the last index
          let msgsToPrint = MessagesForDisplay.slice(0,cutoffIndex +1);
          
          console.log(chatScroll.scrollTop)
          if(chatScroll.scrollTop <= 15) {
            addTen(msgsToPrint, 10, item.innerHTML)
          } 
      }

      chatScroll.addEventListener("scroll", () => {throttle(loadMsg, 50)})

    };
  }

  // function to send message to backend to be stored into DB
  function onclickFun(item) {
    
    if (item.innerHTML === CurrentUser) {
      return;
    }
    console.log(item.innerHTML);
    document.getElementById("msg-send-btn-" + item.innerHTML).onclick =
      
    function () {
        var msg = document.getElementById("msg-" + item.innerHTML);
        
        if (!conn) {
          console.log("no conn");
          return false;
        }
        
        if (!msg.value.trim()) {
          console.log("no msg value");
          return false;
        }
        
        // object with message to send to front end
        let message = {
          Sender: CurrentUser,
          Recipient: item.innerHTML,
          Content: msg.value.trim(),
          Date: newTime(date.toString()),
        };

        conn.send(JSON.stringify(message));
        msg.value = "";
        return false;
      };
  }








  // websocket activity for chats
  if (window["WebSocket"]) {
    conn = new WebSocket("ws://" + document.location.host + "/ws");
    conn.onclose = function (evt) {
      var item = document.createElement("div");
      item.innerHTML = "<b>Connection closed.</b>";
    };
    conn.onmessage = function (evt) {
      let msg = evt.data;
      console.log(msg)

      if (IsJsonString(msg)) {
        msg = JSON.parse(msg);
        console.log("websocket data: " + msg);


        let messageWrapper = document.createElement("div");
        messageWrapper.className = "messageWrapper";
        let newMessage = document.createElement("div");
        let dateDiv = document.createElement("div");
        dateDiv.className = "dateDiv";
        
        if (CurrentUser === msg.Sender) {
          newMessage.className = "sender";
          newMessage.innerHTML = `${"You"}: ${msg.Content}`;
          dateDiv.innerHTML = `${msg.Date}`;
          newMessage.appendChild(dateDiv);
          messageWrapper.append(newMessage);
          document
            .querySelector("#log-" + msg.Recipient)
            .appendChild(messageWrapper);
        } else if (CurrentUser !== msg.Sender) {
          newMessage.className = "recipient";
          newMessage.innerHTML = `${msg.Sender}: ${msg.Content}`;
          dateDiv.innerHTML = `${msg.Date}`;
          newMessage.appendChild(dateDiv);
          // console.log(
          //   document.querySelector("#log-" + msg.Sender).children.length
          // );
          // document.querySelector("#log-" + msg.Sender).append(newMessage);
          // console.log(
          //   document.querySelector("#log-" + msg.Sender).children.length
          // );

          
          let allChatbox = Array.from(document.querySelectorAll(".chat-modal"));
          allChatbox.forEach((element) => {
            let chatBoxId = "chat-modal-" + msg.Sender;
            
            if (chatBoxId == element.id) {
              // NOTIFICATION to show while already being online and receiving new message
              if (element.style.display == "none") {
                var newitem = document.getElementById("usersLog").children;
                var searchitem = msg.Sender;
                var newnotif;
                console.log(item)
                for (var i = 0; i < newitem.length; i++) {
                  if (newitem[i].textContent == searchitem) {
                    newnotif = newitem[i];
                    newnotif.classList.add("notification");
                  }
                }
              } else {
                // add recipient msg to chat box
                document
                  .querySelector("#log-" + msg.Sender)
                  .appendChild(newMessage);
              }
            }
          });
        }
      }
      
      // formatting message
      var messages = evt.data.split("\n");
      console.log(messages, messages.length);
      // clear userslog before adding new users
      if (messages[0] == "" && messages.length > 1) {
        let uLog = document.getElementById("usersLog")
        uLog.innerText = ""
      }
      
      for (var i = 1; i < messages.length; i++) {
        var item = document.createElement("div");
        item.innerHTML = messages[i];
        //if message is a list of chat members, it begins with a space
        if (messages[0] == "") {
          
          if (i < messages.length) {
            if (messages[i].includes("-online")) {
              messages[i] = messages[i].replace("-online", "");
              item.className = "onlineUser";
            } else {
              item.className = "offlineUser";
            }
            item.innerText = messages[i];

            //print list of registered users inside 'usersLog' div
            AppendUser(item);
            console.log("-----------------------");
            onclickFun(item);
          }
        }
      }
      
      // Array of online users

      online_users = document.getElementsByClassName("onlineUser")
      online_users = Array.from(online_users)

      //Array of offline users

      offline_users = document.getElementsByClassName("offlineUser")
      offline_users = Array.from(offline_users)

      // update offline
      if (msg.Label == "offline") {
        
        online_users.forEach(value => {
          if (value.innerHTML == msg.Name) {
            value.className = "offlineUser"
          }
        })
      }

      // update online     
      if (msg.Label == "online") {
        
        offline_users.forEach(value => {
          if (value.innerHTML == msg.Name) {
            value.className = "onlineUser"
          }
        })
      }

    };
  } else {
    var item = document.createElement("div");
    item.innerHTML = "<b>Your browser does not support WebSockets.</b>";
  }
}
function IsJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function addTen (messages, limit, name){
  //count the number of messages inside the chat window
  //in case user added a message before scrolling to top
  let ParentDiv = document.getElementById("log-" + name)
  MsgsInChat = ((ParentDiv.children.length)-1) - CountNewMessages;//to exclude the messages added just now
  //let availableMsgs = messages.length- MsgsInChat;
  //console.log("the number of msgs available to be added:---->",availableMsgs);
  let msgsToAdd = Math.min(limit - messages.length);
  
  //let arrayPosition = messages.length-msgsToAdd;
  let arrayPosition = messages.length-1;

  //do nothing if all messages have been printed
  if((arrayPosition == 0 && messages.length > 1)|| arrayPosition < 0 || messages.length == 0 || MessagesForDisplay.length <= MsgsInChat){
    //if(!(arrayPosition == 0 && messages.length >= 1)){
    return
  }else{  

    //print available messages in chunks of 10 or less
    for(let m = arrayPosition; m > (arrayPosition - limit); m--){
      let messageBubble = document.createElement("div");
      let dateDiv = document.createElement("div");
      dateDiv.className = "dateDiv";
      if (messages[m].sender === CurrentUser && messages[m].recipient === name){ 
        messageBubble.className = "sender";
        messageBubble.innerText = `"You": ${messages[m].chatMessage}`;
        let bubbleWrapper = document.createElement("div"); 
        bubbleWrapper.className = "messageWrapper"; 
        dateDiv.innerHTML = `${ConvertDate(messages[m].creationDate)}`;  
        messageBubble.appendChild(dateDiv);
        bubbleWrapper.append(messageBubble);
        ParentDiv.prepend(bubbleWrapper)
        //move the chat scroll-bar 30px from top
        ParentDiv.scrollTop = ParentDiv.scrollHeight/8;
        if(m==0){return}
      } else if (messages[m].recipient === CurrentUser && messages[m].sender === name) {
        // when current user is recipient add class of recipient
        messageBubble.className = "recipient";
        messageBubble.innerText = `${messages[m].sender}: ${messages[m].chatMessage}`;
        dateDiv.innerHTML = `${ConvertDate(messages[m].creationDate)}`;
        messageBubble.appendChild(dateDiv);
        ParentDiv.prepend(messageBubble);
        //move the chat scroll-bar 30px from top
        ParentDiv.scrollTop = ParentDiv.scrollHeight/8;
        if(m==0){return}
      }
      MsgsInChat = MsgsInChat +  msgsToAdd
    }
  }

}

function throttle(fn, wait) {
  if (timerId) {
      return
  }

  fn()

  timerId = setTimeout(function () {
      timerId = undefined
  }, wait)
}