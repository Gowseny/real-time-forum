 //Unhides a post's comments section
 function DisplayComments(id) {
    console.log("THIS DISPIPLAY COMMENT IS WORKING ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
    //select the comment input for a particular post 
    let commentText = document.querySelector("#commentTxt"+id).value
    let commentBlock = document.querySelector("#c"+id)
    let clearCommentBtn = document.querySelector("#button"+id)
    commentBlock.style.display = "block"
    SendCommentToDB(commentText, id)
    //show comments section, including the cancel button
    clearCommentBtn.style.display = "block"
    refreshComments(id)
  }

     //Show comments after clicking a post
 function ShowCommentsBlock(id) {
  console.log('############################### Were are getting inside showComments BLOCK')
  //select the comment block for a particular post 
  let commentBlock = document.querySelector("#c"+id)
  let clearCommentBtn = document.querySelector("#button"+id)
  commentBlock.style.display = "block"
  //show comments section, including the cancel button
  clearCommentBtn.style.display = "block"
  refreshComments(id)
}


  // //hides a post's comments section
  function CloseComments(id){
    console.log("#############################were are closing commments")
    let commentBlock = document.querySelector("#c" + id)
    console.log(commentBlock, "#################here is the COMMENT BLOCK")
    let clearCommentBtn = document.querySelector("#button"+id)
    console.log(id, "#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ID from close comments")
    commentBlock.style.display = "none"
    clearCommentBtn.style.display = "none"

  }

  //send comment, post ID, and session cookie to the database
  function SendCommentToDB(comment, id){
    let commentText = document.querySelector("#commentTxt"+id)
    //clear the comment from text input
    commentText.value = ""
    let commentBlock = document.querySelector("#c"+id)
    //Not needed: append the latest comment to the comments section
      //let item = document.createElement('p');
     // item.innerHTML = `${comment}`;
     // commentBlock.appendChild(item)
     
        let theCookie = GetCookie("user_session")
        console.log({theCookie})
        let CommentContent = comment
        let PostID = id
        let CommentCookie = theCookie
     
      console.log(CommentContent, PostID, CommentCookie)
      //populate JS object with comment data
      let CommentData = {
        CommContent: CommentContent,
        PstID: PostID,
        CommCookie: CommentCookie,
      }
      //send user comment to the 'comment' struct in go
      // via the '/comment' handler function in go
  let configComment = {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(CommentData)
  };
  fetch("http://localhost:8080/comment", configComment)
  .then(function(response) {
    //console.log('PostDataSuccess:', response)
    if(!response.ok){
      unsuccessfulComment() 
    }else{
      successfulComment() 
    }
  })
  }
  //If post has been successfully sent to back-end
  function successfulComment() {
    console.log("success - status 200")
  }
  //If problems emerge when sending post to back-end
  function unsuccessfulComment() {
    console.log("failed - not status 200")
  }
  //fetch comments data and display in front-end
  function refreshComments(id){
    console.log(".............................................we are getting to refreshs commments")
    fetch("/getComments", {
      headers : {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    })
    .then((response)=> {
      response.text().then(function(data){
        let comments = JSON.parse(data);
        console.log("comments:", comments);
        //post shows all latest posts from database
        displayCommentsHist(comments, id)
      });
    })
    .catch((error) => {
      console.log(error);
    });
  }
 //To display comments history in front-end
 function displayCommentsHist(comments, id) {
  console.log("called @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ comments that should be showing", comments)
  console.log(id)
  let commentsContainer = document.querySelector(`#c${id}`)
  commentsContainer.innerHTML = `<button class="button" id="button${id}"  onclick= 'CloseComments(${id})'> ` + "Close" + `</button>
  <br>
  <div style="display:flex; flex-direction: row; column-gap: 15px; justify-content: left; align-items: center">
    <p class="commentBlock" ><h2 class="cCommentLabel" id='cCommentLabel${id}'>`+"Comment: " +`</h2><input type="text" class="cComment-content" id='cCommentTxt${id}' placeholder="Write a comment.." ; ><button class="button cCommentBtn" id='cCommentBtn${id}' onclick= 'AppendComments(${id})'> ` + "Send comment" + `</button></p>
    </div>
  <br id='refNode${id}'>
  `
  let addCommentClass = document.querySelector(".commentBlock");
  let addCommentLable = document.querySelector(`#cCommentLabel${id}`);
  let addCommentText = document.querySelector(`#cCommentTxt${id}`);
  let addCommentButton = document.querySelector(`#cCommentBtn${id}`);
  addCommentClass.style.desplay = "block";
  addCommentLable.style.display = "block";
  addCommentText.style.display = "block";
  addCommentButton.style.display = "block";
  
  for (let i = comments.length - 1; i >= 0; i--) {
      if (comments[i].PstID !== id) {
          continue
      }
    commentsContainer.innerHTML += `
    <div class="comment-container"><hr><p class='' >`+ "Author: " + comments[i].Author + `</p>&nbsp;&nbsp;<p class=''>`+ "Comment: " + comments[i].CommContent + `</p>&nbsp;&nbsp;<p class=''>`+ "Time: " + ConvertDate(comments[i].CommentTime) + `</p><hr></div>
    `
  }
}

//send new comment to database from the comment block
function AppendComments(id) {
//console.log(id)
//select the comment input for a particular post 
let commentText = document.querySelector("#cCommentTxt"+id).value
addCommentToDB(commentText, id)
//show comments section, including the cancel button
//HTA removed as not needed here //refreshComments(id)
}

//From the comment block, send comment, post ID, and session cookie to the database
function addCommentToDB(comment, id){
  let commentText = document.querySelector("#cCommentTxt"+id)
  //clear the comment from text input
  commentText.value = ""
  
  //let commentBlock = document.querySelector("#c"+id)
    //To improve user experience
    //we add the latest comment to the comments section stright away
    //let cAuthor = document.querySelector("#current-user");
    let item = document.createElement('div');
    item.classList.add("comment-container")
    let date_time = new Date().toLocaleString();
    //new comment will be appended after the referenceNode
    let referenceNode = document.querySelector("#refNode"+id);
    //let parentNode = document.querySelector("#c"+id);

    item.innerHTML = `
    <p >`+ `<hr>`+ "Author: " + CurrentUser + `</p>&nbsp;&nbsp;<p >`+ "Comment: " + comment  + `</p>&nbsp;&nbsp;<p >`+ "Time: " + date_time +  `<hr>`+`</p>
    `

    referenceNode.parentNode.insertBefore(item, referenceNode.nextSibling);
   
      let theCookie = GetCookie("user_session")
      //console.log({theCookie})
      let CommentContent = comment
      let PostID = id
      let CommentCookie = theCookie
   
    //console.log(CommentContent, PostID, CommentCookie)
    //populate JS object with comment data
    let CommentData = {
      CommContent: CommentContent,
      PstID: PostID,
      CommCookie: CommentCookie,
    }
    //send user comment to the 'comment' struct in go
    // via the '/comment' handler function in go
let configComment = {
  method: "POST",
  headers: {
   "Content-Type": "application/json",
    "Accept": "application/json",
  },
  body: JSON.stringify(CommentData)
};
fetch("http://localhost:8080/comment", configComment)
.then(function(response) {
  //console.log('PostDataSuccess:', response)
  if(!response.ok){
    unsuccessfulComment() 
  }else{
    successfulComment() 
  }
})
}


