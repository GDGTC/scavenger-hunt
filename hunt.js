var ref = new Firebase('https://devfestmn.firebaseio.com/hunt');

//Login Info
var authData = ref.getAuth();

if (authData) {
  console.log("User " + authData.uid + " is logged in with " + authData.provider);
  showLogin(false);
} else {
  console.log("User is logged out");
  showLogin(true);
}

function showLogin(tf){
    document.getElementById('loginbutton').style.display = tf == true ? 'block' : 'none';
    document.getElementById('logoutbutton').style.display = tf == true ? 'none' : 'block';
}

// Create a callback to handle the result of the authentication
function authHandler(error, authData) {
  if (error) {
    console.log("Login Failed!", error);
    showLogin(true);
  } else {
    console.log("Authenticated successfully with payload:", authData);
    ref.child("users").child(authData.uid).set({
      provider: authData.provider,
      name: authData.google.displayName,
      googleObject: authData.google
    });
  showLogin(false);
  }
}

function login(){
    ref.authWithOAuthPopup("google", authHandler, {
      remember: "sessionOnly",
      scope: "email"
    });
}
function logout(){
    ref.unauth();
    showLogin(true);
}



//  Scavenger Hunt Logic
// User needs to be logged in
if (authData) {
  if(window.location.hash) {
    // Fragment exists
    var hashval = window.location.hash.substring(1);
    //alert(hashval);

//  Trying to seach the hunt/endpoints and see if the enpoint matches the has value.  Fruitless.  going to bed.


//pull in json from db ***
  ref.on("value", function(snapshot) {
    ref.off("value");

    returnedData = snapshot.val();
    usersData = returnedData.users;
    checkPoints = returnedData.checkpoints;

  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });



  } else {
    // Fragment doesn't exist
  }
}