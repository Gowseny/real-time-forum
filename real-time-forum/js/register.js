const regform = document.querySelector("#regform");

let firstname = regform.querySelector("#FirstName");
let lastname = regform.querySelector("#LastName");
let nickname = regform.querySelector("#NickName");
let age = regform.querySelector("#Age");
let gender = regform.querySelector("#Gender");
let email = regform.querySelector("#Email");
let password = regform.querySelector("#PassWord");
let Email = regform.querySelector("#Email").value;
let PassWord = regform.querySelector("#PassWord").value;

const checkInputs = (e) => {
  let target = e.target;
  // 1. checking FirstName input validity
  if (target.name == "FirstName") {
    if (target.value === "") {
      console.log(target.value);
      // show error
      // add error class
      setErrorFor(firstname, "FirstName cannot be blank");
      console.log("error");
      //  } else if (!isNameValid(target.value)){
      //   setErrorFor(firstname, 'FirstName is invalid');
    } else {
      // add success class
      setSuccessFor(firstname);
      console.log("success");
    }
  }
  // 2. checking FirstName input validity
  if (target.name == "LastName") {
    if (target.value === "") {
      setErrorFor(lastname, "LastName cannot be blank");
      // } else if (!isNameValid(target.value)){
      //   setErrorFor(lastname, 'LastName is invalid');
    } else {
      setSuccessFor(lastname);
    }
  }
  // 3. checking nickname input validity
  if (target.name == "NickName") {
    if (target.value === "") {
      setErrorFor(nickname, "NickName cannot be blank");
    } else {
      setSuccessFor(nickname);
    }
  }
  // 4. checking age input validity
  if (target.name == "Age") {
    if (target.value === "") {
      setErrorFor(age, "Age cannot be blank");
    } else if (target.value <= 0) {
      setErrorFor(age, "Age is Invalid");
    } else if (target.value <= 17) {
      setErrorFor(age, "Sorry you have to be 18");
    } else if (target.value >= 120) {
      setErrorFor(age, "Error! Age is too much");
    } else {
      setSuccessFor(age);
    }
  }
  // 5. checking gender input validity
  if (target.name == "Gender") {
    if (target.value === "") {
      setErrorFor(gender, "Gender cannot be blank");
    } else if (
      !target.value === "male" ||
      !target.value === "female" ||
      !target.value === "other"
    ) {
      setErrorFor(gender, "Gender invalid!");
    } else {
      setSuccessFor(gender);
    }
  }
  // 6. checking email input validity
  if (target.name == "Email") {
    if (target.value === "") {
      setErrorFor(email, "Email cannot be blank");
    } else if (!isEmail(target.value)) {
      setErrorFor(email, "Email is invalid");
    } else {
      setSuccessFor(email);
    }
  }
  // 7. checking password input validity
  if (target.name == "PassWord") {
    if (target.value === "") {
      setErrorFor(password, "Password cannot be blank");
    } else if (!validPassowrd(target.value)) {
      setErrorFor(
        password,
        "Password is invalid, it should be atleast 8 characters, with a number, a uppercase,a lowercase and one special character"
      );
    } else {
      setSuccessFor(password);
    }
  }
}

const setErrorFor = (input, message) => {
  const regFormControl = input.parentElement; // .reg-form-control
  const small = regFormControl.querySelector("small");
  // add the error class
  regFormControl.className = "reg-form-control error";
  // all the error message inside the small tag
  small.innerHTML = message;
  // small.style.visibilty = "visible";
}

const setSuccessFor = (input) => {
  const regFormControl = input.parentElement;
  regFormControl.className = "reg-form-control success";
}

const isEmail = (Email) => {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(Email);
}

const isNameValid = (input) => {
  return /([A-ZÀ-ÿ][-,a-z. '])+/.test(input)
}

const validPassowrd = (PassWord) => {
  // Strong: The password has to meet all the requirements.
  // Using the metrics above, we are going to create a strong level password that has at least one lowercase letter (?=.*[a-z]), one uppercase letter (?=.*[A-Z]), one digit (?=.*[0-9]), one special character (?=.*[^A-Za-z0-9]), and is at least eight characters long(?=.{8,}).
  // return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})$/.test(PassWord)
  //for weak password use below regexp
  return /^([a-zA-Z0-9@*#]{8,15})$/.test(PassWord);
}

//register form input validation checks
firstname.addEventListener("blur", checkInputs);
lastname.addEventListener("blur", checkInputs);
nickname.addEventListener("blur", checkInputs);
age.addEventListener("blur", checkInputs);
gender.addEventListener("blur", checkInputs);
email.addEventListener("blur", checkInputs);
password.addEventListener("blur", checkInputs);

//show password function
const togglePassword = document.querySelector("#togglePassword");
togglePassword.addEventListener("click", function (e) {
  // toggle the type attribute
  const type =
    password.getAttribute("type") === "password" ? "text" : "password";
  password.setAttribute("type", type);
  // toggle the eye slash icon
  this.classList.toggle("fa-eye-slash");
});

//======== Register form submission ========
//Put register data into a JS object if user clicks 'Register' button
const registerBtn = document.querySelector("#registerBtn");
registerBtn.onclick = (e) => {
  //stop browser refreshing
  e.preventDefault();
  //grab user data
  let FirstName = regform.querySelector("#FirstName").value;
  let LastName = regform.querySelector("#LastName").value;
  let NickName = regform.querySelector("#NickName").value;
  let Age = regform.querySelector("#Age").value;
  let Gender = regform.querySelector("#Gender").value;
  let Email = regform.querySelector("#Email").value;
  let PassWord = regform.querySelector("#PassWord").value;

  //populate JS object with user data
  let RegisterData = {
    FirstName: FirstName,
    LastName: LastName,
    NickName: NickName,
    Age: Age,
    Gender: Gender,
    Email: Email,
    PassWord: PassWord,
  };

  //send user input in the 'Register' form to the 'RegData' struct in go
  // via the 'Register' handler function in go
  let configRegister = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(RegisterData),
  };
  fetch("http://localhost:8080/register", configRegister)
    .then((resp) => {
      return resp.text();
    })
    .then(function (response) {
      console.log(response);
      if (response.slice(0, 5) == "ERROR") {
        if (
          response == "ERROR: This email already exists, please log in instead"
        ) {
          console.log("error");
          setErrorFor(
            email,
            "This Email already exists, please log in instead"
          );
        } else if (
          response ==
          "ERROR: This username already exists, please log in instead"
        ) {
          setErrorFor(
            nickname,
            "This NickName already exists, please log in instead"
          );
        }
        return;
      }
      console.log("Success:", response);
      setTimeout(() => {
        document.getElementById("regConfirmed").style.display = "none";
      }, 2000);
      document.getElementById("postBlock").style.display = "flex";
      document.getElementById("logout").style.display = "block";
      document.getElementById("regModal").style.display = "none";
      document.getElementById("regConfirmed").style.display = "block";
      return response;
    });
};

const successfulReg = () => {
  console.log("Reg Successfull --- STATUS 200")
  document.getElementById('regModal').style.display = "none";
  document.getElementById('regConfirmed').style.display = 'block';
  document.getElementById('happyFace').style.display = 'block';
  document.getElementById('profileMod').style.display = "none";
  document.getElementById('welcomemsg').style.display ="none"; 
  document.getElementById('Users').style.display ="block"; 
  document.getElementById('Offline').style.display ="block"; 
  document.getElementById('Online').style.display ="block"; 
  document.getElementById('Messenger').style.display ="block"; 
  
  setTimeout(() => {
    document.getElementById('regConfirmed').style.display = 'none';
    document.getElementById('happyFace').style.display = 'none';
  },2000);

  document.getElementById('postList').style.display = 'block';
  document.getElementById('logout').style.display = 'block'
}

const unsuccessfulReg = (response) => {
 console.log("REG FAILED --- NOT STATUS 200")

 if (response == "ERROR: This email already exists, please log in instead") {
  console.log("error");
  setErrorFor(email, "This Email already exists, please log in instead");
  document.getElementById('regModal').style.display = "block";
  document.getElementById('regRejected').style.display = 'block';
  document.getElementById('sadFace').style.display = "block";

  // document.getElementById('postedArticles').style.display ="none"; 

  setTimeout(() => {
      document.getElementById('regRejected').style.display = 'none';
      document.getElementById('sadFace').style.display = "none";

    },2000);

  document.getElementById('postList').style.display = 'none';
} else if (response == "ERROR: This username already exists, please log in instead") {
  setErrorFor(
    nickname,
    "This NickName already exists, please log in instead"
  );
  document.getElementById('regModal').style.display = "block";
  document.getElementById('regRejected').style.display = 'block';
  document.getElementById('sadFace').style.display = "block";

  // document.getElementById('postedArticles').style.display ="none"; 

  setTimeout(() => {
      document.getElementById('regRejected').style.display = 'none';
      document.getElementById('sadFace').style.display = "none";

    },2000);

  document.getElementById('postList').style.display = 'none';
}

  return response;
}
