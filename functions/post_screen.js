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
document.getElementById("upvote").addEventListener("click", myScript);
document.getElementById("downvote").addEventListener("click", myScript);

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

//TEST FUNCTIONS HERE
//fillPostPage("test post","can you see the content?","text","nathan a","DNE subreddit");
