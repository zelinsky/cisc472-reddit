/*
TO DO
-add more content types to fillPostPAge (optional?)

-get post and user instance from previous request

-votes for comments (add field in post)

-indicate current vote

-take away vote if you hit up or down twice

*/

$( document ).ready(function() {
  
  // get instance of post;
  var currentSub = "websec";
  var postKey = "post_exp";
  var user_key = "bobr";
  var postInst = firebase.firestore().collection("subreddits").doc(currentSub).collection("posts").doc(postKey);
  var currentUser = firebase.firestore().collection("users").doc(user_key);
  
  // handler for retrieving post
  postInst.get().then(function(doc) {
      if (doc.exists) {
          var data = doc.data();
          console.log("Document data:",data.title);
          fillPostPage(data);
      } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
      }
  }).catch(function(error) {
      console.log("Error getting document:", error);
  });

  // color buttons based on user's previous vote
  currentUser.collection("userPosts").doc(postKey).get().then(function(doc){
    if(doc.exists){
      var previousVote = doc.data().vote;
      if(previousVote == 1){
        $("#upvote_button").attr("class","btn btn-success");
        $("#downvote_button").attr("class","btn btn-danger");
      }
      else if(previousVote == -1){
        $("#upvote_button").attr("class","btn btn-danger");
        $("#downvote_button").attr("class","btn btn-success");
      }
    }
  })


  //* LISTENERS */
  // listen for votes from server
  postInst.onSnapshot(function(doc) {
    $("#votes").text(doc.data().votes);
  });
  
  //listen to votes from client 
  $("#upvote_button").click(function(){vote(1, postInst, currentUser, postKey);});
  $("#downvote_button").click(function(){vote(-1, postInst, currentUser, postKey);});

  //listen for comments from client
  $("#comment_input").keypress(function(event){
    var keycode = (event.keycode ? event.keycode : event.which);
    if(keycode == '13'){
      var newComment = $("#comment_input").val();
      $("#comment_input").val(null);
      
      sendComment(currentUser,newComment,postInst);
    }
  })

  //listen for comments from server
  postInst.collection("comments").onSnapshot(function(snapshot){
    snapshot.docChanges().forEach(function(change){
      addComment(getUsername(change.doc), change.doc.data().text);
    });
  });

});

function vote(newVote, postInst, currentUser, postKey){

  // check if user has 1.Is logged in and 2.Has not voted already
  var voteUpdate = 0; // stores value we have to add to post votes,  changes based on new vote
  var currentUserPost = currentUser.collection("userPosts").doc(postKey);// if user has intacted with this post before this gets that doc

  // checks if doc exists
  currentUserPost.get().then(function(doc) {
      if (doc.exists) {
          var oldVote = doc.data().vote;
          console.log("OLD VOTE: ", oldVote);
          
          // user has interacted with this post before! They either made it or voted on it
          console.log("Previous user vote:",oldVote);
          
          // only update votes in post if direction doesnt match current vote
          if(newVote != oldVote) {
            voteUpdate = newVote - oldVote; // ensures the post is updated with the correct vote count
            //console.log("vote update: ", voteUpdate);
            currentUserPost.update({vote : newVote}); // updates user vote
          }
      } else {
          // make new post instance and vote
          voteUpdate = newVote;
          
          currentUserPost.set({
            make: false,
            vote: voteUpdate,
            post: postInst.path
          });
      }
 
      // update server
      postInst.get().then(function(doc) {
        postInst.update({votes: doc.data().votes + voteUpdate}); // update vote in server
      }).catch(function(error) {
          console.log("Error getting document:", error);
      });
  }).catch(function(error) {
      console.log("Error getting document:", error);
  });

  // color buttons accordingly 
  if(newVote == 1){
    $("#upvote_button").attr("class","btn btn-success");
    $("#downvote_button").attr("class","btn btn-danger");
  }
  else {
    $("#upvote_button").attr("class","btn btn-danger");
    $("#downvote_button").attr("class","btn btn-success");
  }
}

function fillPostPage(postData){
  // want to show: title,content,type,user_owner,subreddit
  

  // decide how to handle content based on its type
  switch(postData.type){
    case "text":
      // handles text content
      $("#content").html(postData.content);
      break;
    case "link":
      //handles links
      break;
  }

  // fill in metadata
  // parse path to get username
  var tmp = postData.user.path.split("/");
  var username = tmp[tmp.length-1];

  $("#user_owner").html(username);
  $("#title").html(postData.title);
}

function sendComment(user, text, post){
  // user should be reference path
  // post should be db object
  //console.log(post.collection("comments").doc().getId());
  
  // send to post collection
  post.collection("comments").add({
    user: user,
    text: text 
  }) 
  .then(function(doc){
    // send to user collection
    user.collection("userComments").add({
      commentPath: doc,
      made: true,
      vote: 0
    });
  });
}

function addComment(user, newComment){
  //$("#comments").text(newComment);
  //$("#comments").text($("#comments").text().concat("\n", user,": ",newComment,"\n"));
  
  var userTitle = $("<b></b>").text(user.concat(": "));
  var commment = $("<p></p>").text(newComment);
  var message = $("<li class='list-group-item'></li>").append($("<b></b>").text(user),$("<p></p>").text(newComment));

  $("#comments").prepend(message);
}

function getUsername(ref){
  // gets the username from the reference path (returns a string)
  var tmp = ref.data().user.path.split("/");
  var username = tmp[tmp.length-1];
  console.log(username);
  return  username;
}