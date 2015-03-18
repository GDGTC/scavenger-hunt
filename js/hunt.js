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
    document.getElementById('shwrapper').style.display = tf == true ? 'none' : 'block';
}

// Create a callback to handle the result of the authentication
function authHandler(error, authData) {
  if (error) {
    console.log("Login Failed!", error);
    showLogin(true);
  } else {
    console.log("Authenticated successfully with payload:", authData);

    //  save the info about the user who just logged in
    ref.child("users").child(authData.uid).update({
      provider: authData.provider,    // only using google for this but whatevs
      name: authData.google.displayName,
      googleObject: authData.google,  // tuck the whole google obj away for later
      lastLoggedIn: Firebase.ServerValue.TIMESTAMP
    });
    authData = ref.getAuth();
    showLogin(false);
    getEndpoint();
  }
}

//  better to have user action call a popup for browser security
function login(){
    ref.authWithOAuthPopup("google", authHandler, {
      remember: "default", 
      scope: "email"
    });
}
function logout(){
    ref.unauth();
    showLogin(true);
}

function hexDiv(badgename, iseven){
  var ans =  '<div class="hex ' + iseven + '"><div class="left"></div><div class="middle"><img src="img/' + badgename + '.png" class="badgeimg"></div><div class="right"></div></div>';
   return ans;
}

function endpointSortBy(a,b) {
  if (a.badgetype + a.badgename < b.badgetype + b.badgename)
     return -1;
  if (a.badgetype + a.badgename > b.badgetype + b.badgename)
    return 1;
  return 0;
}

function showStatus(){

    var myData = ref.child("users").child(authData.uid).child("badges");
    //pull in json from db ***
    myData.on("value", function(snapshot) {
      myData.off("value"); //stop listening

      badges = snapshot.val();

      var badgediv = '<div id="badgediv">';
      var rowstart = '<div class="hex-row">';
      var rowend = "</div>";
      var i = 1;
      var col = 0;
      badgediv += rowstart;



      snapshot.forEach(function(childSnapshot) {
        // childData will be the actual contents of the child
        var childData = childSnapshot.val();
        even = col % 2 == 0 ? "":"even";
        badgediv += '<div class="hex ' + even + '"><div class="left"></div><div class="middle"><img src="img/' + childData.endpoint.img + '" class="badgeimg"></div><div class="right"></div></div>';
        if (i%3 == 0){
          badgediv += rowend + rowstart;
          col= -1;
        }
        i++; col++;
      });

      // for (var badge in badges){
      //   even = col % 2 == 0 ? "":"even";
      //   badgediv += hexDiv(badge, even);
      //   if (i%3 == 0){
      //     badgediv += rowend + rowstart;
      //     col= -1;
      //   }
      //   i++; col++;
      // }
      badgediv += rowend;
      badgediv += "</div>";

      document.getElementById('shwrapper').innerHTML = badgediv;

    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });

}



//*****************************************
//*****************************************
//  Check for endpoint
//*****************************************
//*****************************************

function getEndpoint(){
  //  Scavenger Hunt Logic
  // User needs to be logged in
  authData = ref.getAuth(); // reset auth?
  if (authData) {
    if(window.location.hash) {
      // Fragment exists
      var hashval = window.location.hash.substring(1);

      if(hashval == "cleardata"){
        ref.child("users").child(authData.uid).set(null);
        ref.child("leaderboard").child(authData.uid).set(null);
      }

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

          var nodeType = nodeData.badgetype;

          //  save the scavenger hunt item to the user
          ref.child("users").child(authData.uid).child("badgesByType").child(nodeType).child(hashval).set({          
            endpoint: nodeData,
            foundAt: Firebase.ServerValue.TIMESTAMP
          });

          var badgecounter = 0;
          var myData = ref.child("users").child(authData.uid).child("badges");
          myData.orderByChild("type").on("value", function(snapshot) {
              myData.off("value"); //stop listening
              badges = snapshot.val();
              for(x in badges){ badgecounter++;}
               //  save the info about the user who just logged in
                ref.child("users").child(authData.uid).update({
                    provider: authData.provider,    // only using google for this but whatevs
                    name: authData.google.displayName,
                    googleObject: authData.google,  // tuck the whole google obj away for later
                    lastSeen: Firebase.ServerValue.TIMESTAMP,
                    badgecount : badgecounter
                });
               var leaderboard = ref.child("leaderboard").child(authData.uid);
               leaderboard.setWithPriority({name: authData.google.displayName, score:badgecounter},badgecounter);
          });


        }
      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      });

  
      showStatus();

    } else {
      // Fragment doesn't exist
      showStatus();
    }
  }
}


function hashChanged(){
  //alert(location.hash);
  getEndpoint();
  showStatus();
}

