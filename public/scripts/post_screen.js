/*
TO DO
- add more content types to fillPostPAge 

-get user 
-have voting function check if user has voted

-fetch comments (nested)

-send comments

-get post instance from previous request

*/

$( document ).ready(function() {
  
  // get instance of post;
  var cur_sub = "websec";
  var post_key = "post_exp";
  var user_key = "bobr";
  var post_inst = firebase.firestore().collection("subreddits").doc(cur_sub).collection("posts").doc(post_key);
  var c_user = firebase.firestore().collection("users").doc(user_key);
  
  // handler for retrieving post
  post_inst.get().then(function(doc) {
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
  
  // listen for votes from server
  post_inst.onSnapshot(function(doc) {
    $("#votes").text(doc.data().votes);
  });
  
  //listen to votes from client 
  $("#upvote_button").click(function(){vote(1, post_inst, c_user, post_key);});
  $("#downvote_button").click(function(){vote(-1, post_inst, c_user, post_key);});
});

function vote(newVote, post_inst, c_user, post_key){

  // check if user has 1.Is logged in and 2.Has not voted already
  var voteUpdate = 0; // stores value we have to add to post votes,  changes based on new vote
  var c_user_post = c_user.collection("userPosts").doc(post_key);// if user has intacted with this post before this gets that doc

  // checks if doc exists
  c_user_post.get().then(function(doc) {
      if (doc.exists) {
          var oldVote = doc.data().vote;
          // user has interacted with this post before! They either made it or voted on it
          console.log("Previous user vote:",oldVote);
          
          // only update votes in post if direction doesnt match current vote
          if(newVote != oldVote) {
            voteUpdate = newVote - oldVote; // ensures the post is updated with the correct vote count
            //console.log("vote update: ", voteUpdate);
            c_user_post.update({vote : newVote}); // updates user vote 
          }
      } else {
          // make new post instance and vote *******TEST PLS
          voteUpdate = newVote;
          
          c_user_post.set({
            make: false,
            vote: voteUpdate,
            post: post_inst._document_path
          });
      }
 
      // update server
      post_inst.get().then(function(doc) {
        post_inst.update({votes: doc.data().votes + voteUpdate}); // update vote in server
      }).catch(function(error) {
          console.log("Error getting document:", error);
      });
  }).catch(function(error) {
      console.log("Error getting document:", error);
  });
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
  $("#user_owner").html(postData.user);
  $("#title").html(postData.title);
}