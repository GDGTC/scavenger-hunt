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

    //  save the info about the user who just logged in
    ref.child("users").child(authData.uid).set({
      provider: authData.provider,    // only using google for this but whatevs
      name: authData.google.displayName,
      googleObject: authData.google  // tuck the whole google obj away for later
    });
  showLogin(false);
  }
}

//  better to have user action call a popup for browser security
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

    //pull in json from db ***
    ref.on("value", function(snapshot) {
      //ref.off("value"); //stop listening

      returnedData = snapshot.val();
      usersData = returnedData.users;
      checkPoints = returnedData.checkpoints;

    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });

    //  Check on the endpoint that was passed in the hasvalue
    var huntnode = ref.child('endpoints/'+hashval);
    huntnode.on("value", function(snapshot) {
      //huntnode.off("value");
      console.log(snapshot.val());
      nodeData = snapshot.val();
      if(!nodeData){
        console.log("Data Not Here");
      }else{
        console.log("Found some " + hashval);

        //  save the scavenger hunt item to the user
        ref.child("users").child(authData.uid).child("badges").child(hashval).set({          
          endpoint: nodeData,
          foundAt: Firebase.ServerValue.TIMESTAMP
        });
      }
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });




  } else {
    // Fragment doesn't exist
  }
}