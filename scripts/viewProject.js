import { getDatabase, ref, child, set, update, remove, get, orderByChild, query } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-database.js"
import { getAuth, initializeAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserSessionPersistence,
    browserLocalPersistence,
    sendPasswordResetEmail,
    updateEmail, } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-auth.js";

//Reference the imports
const auth = getAuth();
const db = getDatabase();
var uid;

//References
var backButton = document.getElementById("backIcon");
var backButtonProfile = document.getElementById("backIcon_profile");

if (backButton){
    backButton.addEventListener("click", function(){
        window.location = "../html/homepage.html";
    })
}

if (backButtonProfile){
    backButtonProfile.addEventListener("click", function(){
        window.location = "../html/account.html";
    })
}

onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      uid = user.uid;
      // ...
    } 
});

function LikeProject(viewProjectKey){
    var newLikeCount;
    var latestProjectData = JSON.parse(localStorage.getItem("latestProjectData"));
    var viewData = latestProjectData[viewProjectKey];

    if(viewData.likes){
        newLikeCount = viewData.likes;
    } else {
        newLikeCount = [];
    }
    
    var likedPost = false;
    for (let i=0; i<newLikeCount.length; i++){
        if (newLikeCount[i] == uid){
            likedPost = true;
            break
        }
    }

    if (likedPost){
        alert("You've already liked this post!");
    } else {
        newLikeCount.push(uid);
        const likeCountUpdate = {};
        likeCountUpdate['/projects/' + viewProjectKey + "/likes"] = newLikeCount;
        update(ref(db), likeCountUpdate);
        document.getElementById("likesCount").innerHTML = newLikeCount.length;
    }
}

function OpenLikeMenu(){
    console.log('clicked')
}

function GetViewProject(){
    var projectKey = localStorage.getItem("viewProjectKey");
    var latestProjectData = JSON.parse(localStorage.getItem("latestProjectData"));
    var viewData = latestProjectData[projectKey];

    //reference html data points
    var projectTitle = document.getElementById("projectNameTitle");
    var likesCount = document.getElementById("likesCount");
    var likeButton = document.getElementById("likeIcon");
    var confirmLike = document.getElementById("confirmLike");
    var creationDate = document.getElementById("creationDate");
    var creatorName = document.getElementById("creatorName");
    var companyName = document.getElementById("companyName");
    var bedroomCount = document.getElementById("bedroomsCount");
    var furnituresUsed = document.getElementById("furnituresUsed");

    //gets creator name and company name from database
    var creatorId = viewData.creator;
    var companyId = viewData.companyId;
    const dbref = ref(db);
    get(child(dbref, "users/" + creatorId)).then((snapshot)=>{ //get username from database
        if(snapshot.exists()){
            const username = snapshot.val().username;
            creatorName.innerHTML = username;
        } else {
            creatorName.innerHTML = "Unknown Creator";
        }
    });

    get(child(dbref, "company/" + companyId)).then((snapshot)=>{ //get company name from database
        if(snapshot.exists()){
            const name = snapshot.val().companyName;
            companyName.innerHTML = name;
        } else {
            companyName.innerHTML = "None";
        }
    });

    projectTitle.innerHTML = viewData.nameOfLayout;
    if (viewData.likes){
        likesCount.innerHTML = viewData.likes.length;
    }
    likeButton.addEventListener("click", function(){
        //LikeProject(latestProjectData[projectId].nameOfLayout);
        OpenLikeMenu();
    })
    confirmLike.addEventListener("click", function(){
        LikeProject(projectKey);
    })
    creationDate.innerHTML = viewData.dateCreated;
    bedroomCount.innerHTML = viewData.noOfBedrooms;
    furnituresUsed.innerHTML = viewData.furnitureUsed;
}

GetViewProject();