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

if (backButton){
    backButton.addEventListener("click", function(){
        window.location = "../html/homepage.html";
    })
}

onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      uid = user.uid;
      // ...
    } 
});

function LikeProject(layoutName){
    var newLikeCount = 0;
    var latestProjectData = JSON.parse(localStorage.getItem("latestProjectData"));
    for (let i=0; i<latestProjectData.length; i++){ //gets correct like array from saved data
        if(latestProjectData[i].nameOfLayout == layoutName){
            newLikeCount = latestProjectData[i].likes;
            break
        } 
    };

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
        likeCountUpdate['/projects/' + layoutName + "/likes"] = newLikeCount;
        update(ref(db), likeCountUpdate);
        document.getElementById("likesCount").innerHTML = newLikeCount.length;
    }
}

function OpenLikeMenu(){
    console.log('clicked')
}

function GetViewProject(){
    var projectId = localStorage.getItem("projectArrayId");
    var latestProjectData = JSON.parse(localStorage.getItem("latestProjectData"));

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

    projectTitle.innerHTML = latestProjectData[projectId].nameOfLayout;
    likesCount.innerHTML = latestProjectData[projectId].likes.length;
    likeButton.addEventListener("click", function(){
        //LikeProject(latestProjectData[projectId].nameOfLayout);
        OpenLikeMenu();
    })
    confirmLike.addEventListener("click", function(){
        LikeProject(latestProjectData[projectId].nameOfLayout);
    })
    creationDate.innerHTML = latestProjectData[projectId].dateCreated;
    creatorName.innerHTML = latestProjectData[projectId].creator;
    companyName.innerHTML = latestProjectData[projectId].companyId;
    bedroomCount.innerHTML = latestProjectData[projectId].noOfBedrooms;
    furnituresUsed.innerHTML = latestProjectData[projectId].furnitureUsed;
}

GetViewProject();