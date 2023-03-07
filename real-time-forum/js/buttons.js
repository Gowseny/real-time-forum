//This function opens Login Modal
const openLogin = () => {
  // closePost();
  document.getElementById("loginModal").style.display = "block";
  document.getElementById("regModal").style.display = "none";
  document.getElementById("postList").style.display = "none";
  document.getElementById("regConfirmed").style.display = "none";
};

//this function open Registration Modal
const openReg = () => {
  // closePost();
  document.getElementById("postList").style.display = "none";
  document.getElementById("loginModal").style.display = "none";
  document.getElementById("regModal").style.display = "block";
  document.getElementById("regConfirmed").style.display = "none";
};

//this function is for the cancel buttons
const closeBtn = () => {
  document.getElementById("postList").style.display = "block";
  document.getElementById("regConfirmed").style.display = "none";
};


//this function is for the log out button

document.getElementById('logout').onclick = (e) => {
  e.preventDefault();
  document.getElementById("postBlock").style.display = "none";
  document.getElementById("postListAfterLogin").style.display = "none";
  document.getElementById("postList").style.display = "block";
  document.getElementById("logout").style.display = "none";
  document.getElementById("LoggedOut").style.display = "block";
  document.getElementById("byeFace").style.display = "block";
  document.getElementById("addPost").style.display = "none";
  document.getElementById("login").style.display = "block";
  document.getElementById("register").style.display = "block";
  document.getElementById("Select User").style.display = "none";
  document.getElementById("chatNav").style.visibility = "visible";
  document.getElementById("welcomemsg").style.display = "flex";
  document.getElementById("profile").style.display = "none";



  setTimeout(() => {
    console.log('SETTIMEOUT WORKS WITH LOGOUT BUTTON WE ARE GETTING HERE')
    document.getElementById("LoggedOut").style.display = "none";
    document.getElementById("byeFace").style.display = "none";
  }, 1500);

  //delete cookie from databadse
  LogoutDeleteCookie()
  //hide users list, chat, user nickname
  Logout()
};


