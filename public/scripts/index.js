function createUser(user) {
    firebase.firestore().collection("users").doc(user.uid).set({
        name: user.displayName,
        email: user.email,
        photo: user.photoURL
    });
}

/**
    * Function called when clicking the Login/Logout button.
    */
// [START buttoncallback]
function toggleSignInGoogle() {
    if (!firebase.auth().currentUser) {
        // [START createprovider]
        var provider = new firebase.auth.GoogleAuthProvider();
        // [END createprovider]
        // [START addscopes]
        //provider.addScope('https://www.googleapis.com/auth/plus.login');
        // [END addscopes]
        // [START signin]
        firebase.auth().signInWithRedirect(provider);
        // [END signin]
    } else {
        // [START signout]
        firebase.auth().signOut();
        // [END signout]
    }
    // [START_EXCLUDE]
    $('#sign-in-google').prop('disabled', true);
    $('#sign-in-github').prop('disabled', true);
    // [END_EXCLUDE]
}

function toggleSignInGithub() {
    if (!firebase.auth().currentUser) {
        // [START createprovider]
        var provider = new firebase.auth.GithubAuthProvider();
        // [END createprovider]
        // [START addscopes]
        //provider.addScope('repo');
        // [END addscopes]
        // [START signin]
        firebase.auth().signInWithRedirect(provider);
        // [END signin]
    } else {
        // [START signout]
        var provider = new firebase.auth.GithubAuthProvider();
        firebase.auth().currentUser.linkWithRedirect(provider);
        // [END signout]
    }
    // [START_EXCLUDE]
    $('#sign-in-google').prop('disabled', true);
    $('#sign-in-github').prop('disabled', true);
    // [END_EXCLUDE]
}
// [END buttoncallback]
/**
 * initApp handles setting up UI event listeners and registering Firebase auth listeners:
 *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
 *    out, and that is where we update the UI.
 *  - firebase.auth().getRedirectResult(): This promise completes when the user gets back from
 *    the auth redirect flow. It is where you can get the OAuth access token from the IDP.
 */
function initAuth() {
    /*
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start('#firebaseui-auth-container', {
        signInOptions: [
          // List of OAuth providers supported.
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          firebase.auth.GithubAuthProvider.PROVIDER_ID
        ],
        callbacks: {
            signInSuccessWithAuthResult: function(authResult, redirectUrl) {
              // User successfully signed in.
              // Return type determines whether we continue the redirect automatically
              // or whether we leave that to developer to handle.
              return false;
            },
        },
        // Other config options...
      });
      */
    // Result from Redirect auth flow.
    // [START getidptoken]
    firebase.auth().getRedirectResult().then(function (result) {
        if (result.credential) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            // [START_EXCLUDE]
            //document.getElementById('oauthtoken').textContent = token;
        } else {
            //document.getElementById('oauthtoken').textContent = 'null';
            // [END_EXCLUDE]
        }
        // The signed-in user info.
        var user = result.user;

        // If new user, add them to the database
        if (result.additionalUserInfo && result.additionalUserInfo.isNewUser) {
            /*var username = prompt("Please enter your username:", "Username");
            user.updateProfile({
                username: username
            })*/
            createUser(user);
        }
    }).catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // [START_EXCLUDE]
        if (errorCode === 'auth/account-exists-with-different-credential') {
            //alert('You have already signed up with a different auth provider for that email.');
            // If you are using multiple auth providers on your app you should handle linking
            // the user's accounts here.
            alert("You have already registered with Google. Please sign in with Google to link your GitHub account.")
        } else {
            console.error(error);
        }
        // [END_EXCLUDE]
    });
    // [END getidptoken]
    // Listening for auth state changes.
    // [START authstatelistener]
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            //console.log(uid);
            //firebase.auth().currentUser.getIdToken(true).then((idToken) => console.log(idToken));
            firebase.firestore().collection("users").doc(uid).get().then((doc) => console.log(doc.data()));
            var providerData = user.providerData;
            // [START_EXCLUDE]
            $('#navbar-user').text(`Logged in as: ${displayName}`).show();
            //$('#sign-in-status').text('Signed in');
            $('#sign-in-google').text('Sign out');
            if (user.providerData.length === 1 && user.providerData[0].providerId === "google.com") {
                $("#sign-in-github").text("Link GitHub account");
            } else {
                $('#sign-in-github').hide();
            }
            //$('#account-details').text(JSON.stringify(user, null, '  '));
            // [END_EXCLUDE]
        } else {
            // User is signed out.
            // [START_EXCLUDE]
            $('#navbar-user').empty().hide();
            //$('#sign-in-status').text('Signed out');
            $('#sign-in-google').text('Sign in with Google');
            $('#sign-in-github').text('Sign in with GitHub');
            $('#sign-in-github').show();
            //$('#account-details').text('null');
            //$('#oauthtoken').text('null');
            // [END_EXCLUDE]
        }
        // [START_EXCLUDE]
        $('#sign-in-google').prop('disabled', false);
        $('#sign-in-github').prop('disabled', false);
        // [END_EXCLUDE]
    });
    // [END authstatelistener]
    $('#sign-in-google').on('click', toggleSignInGoogle);
    $('#sign-in-github').on('click', toggleSignInGithub);

}

function upvotePost(db, id) {
    console.log(id);
}

function displayPosts(posts) {
    posts.get().then(function (querySnapshot) {
        $("#main-posts").empty();
        querySnapshot.forEach(function (doc) {
            //console.log(doc.id, ' => ', doc.data());
            $('#main-posts').append(`
            <div id="${doc.id}" class="reddit-post card border-primary mt-2">
                <div class="card-header"><h4>${doc.data().title}</h5></div>
                <div class="card-body">
                    <p class="card-text">${doc.data().content}</p>
                </div>
            </div>
            `);
        });
    });
}

function getPosts(db, id) {
    if (id) {
        var docRef = db.collection("subreddits").doc(id);
        docRef.get().then(function (doc) {
            if (doc.exists) {
                $("#new-post-container").addClass("hidden");
                //$("#new-post-sub").children("option:selected").prop("selected", false);
                $(`#new-post-sub option[value="${id}"]`).prop("selected", true);
                var posts = docRef.collection("posts");
                displayPosts(posts);
            } else {
                return;
            }
        }).catch(function (error) {
            console.log("Error displaying subreddit: ", error)
        });

    } else {
        var posts = db.collectionGroup('posts');
        displayPosts(posts);
    }
}

$(document).ready(function () {
    initAuth();
    const db = firebase.firestore();
    let curSub = "";

    $("#home-button").on("click", function(event) {
        curSub = "";
        getPosts(db);
    })
    $("#main-posts").on("click", ".card", function (event) {
        console.log(this.id);
    });

    $("#main-subs").on("click", ".card", function (event) {
        curSub = this.id;
        getPosts(db, this.id);
    });

    getPosts(db);

    // New Posts
    $("#make-post").on("click", function() {
        const c = $("#new-post-container");
        if (c.hasClass("hidden")) {
            c.removeClass("hidden");
        } else {
            c.addClass("hidden");
        }
    });

    $("#new-post-close").on("click", function() {
        $("#new-post-container").addClass("hidden");
    });

    $("#new-post-form").on("submit", function (e) {
        e.preventDefault();
        const user = firebase.auth().currentUser;
        if (!user) {
            alert("You must log in to create a post.");
            return;
        }
        $("#new-post-container").addClass("hidden");
        const data = $("#new-post-form").serializeArray();
        const title = data[0].value;
        const content = data[1].value;
        const subreddit = data[2].value;
        const subRef = db.collection("subreddits").doc(subreddit);
        subRef.get().then(function(doc) {
            if (doc.exists) {
                subRef.collection("posts").add({
                    title: title,
                    content: content,
                    type: "text",
                    votes: 1,
                    user: db.doc(`/users/${user.uid}`)
                }).then(function(postRef) {
                    getPosts(db, curSub);
                    db.collection("users").doc(user.uid).collection("userPosts").add({
                        made: true,
                        post: postRef,
                        vote: 1
                    });
                });
            } else {
                alert("Subreddit does not exist.");
            }
        }).catch(function(error) {
            console.log("Error getting document: ", error);
        });
        $("#new-post-form").find("input[type=text], textarea").val("");
    });



    const subreddits = db.collection('subreddits');
    subreddits.get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            //console.log(doc.id, ' => ', doc.data());
            $('#new-post-sub').append(`
            <option value="${doc.id}">${doc.data().name}</option>
            `);
            $('#main-subs').append(`
            <div id="${doc.id}" class="reddit-sub card border-warning mt-2">
                <div class="card-body">
                    <h5 class="card-title">${doc.data().name}</h5>
                </div>
            </div>
            `);
        });
    });

});
