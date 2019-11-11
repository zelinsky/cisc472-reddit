// import below doesnt work!
//import { Firestore } from "@google-cloud/firestore";

/*
TO DO
- request data from db
- add more functionality to fillPostPAge Function (handle other content types)
  -> confirm with matt what we want to store
- have voting function check if user has voted
- fetch post fields then fill
- send votes
- fetch comments (nested)
- send comments
*/

// voting listeners
//document.getElementById("upvote").addEventListener("click", myScript);
//document.getElementById("downvote").addEventListener("click", myScript);

$( document ).ready(function() {
  
  //var post_instance = firebase.firestore().collection("subreddits").collection("websec").collection("posts").doc("post_exp");
  var test = firebase.firestore().collection("subreddits").doc("websec").collection("posts").doc("post_example").get();
  console.log(test);
  /*
  if(post_instance.get()){
    console.log(post_instance.data());
  }
  */

  //TEST FUNCTIONS HERE
  //fillPostPage("test post","can you see the content?","text","nathan a","DNE subreddit");
  //fillPostPage("test post",Firestore.subreddit.toString(),"text","nathan a","DNE subreddit");
  //fillPostPage(post_instance.title)
});


function vote(direction){
  // check if user has 1.Is logged in and 2.Has not voted already
  if(1){
    if(direction){
       // update upvote count with + 1
    }
    else {
      // update downvote count with - 1
    }
  }
}

function fillPostPage(title,content,type,user_owner,subreddit){
  var titleElement = document.getElementById("content") // replace with jQuery $("#id of element")

  // decide how to handle content based on its type
  switch(type){
    case "text":
      // handles text content
      titleElement.innerHTML = content;
      break;
    case "link":
      //handles links
      break;
  }
}