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

//References
var backButton = document.getElementById("backIcon");

if (backButton){
    backButton.addEventListener("click", function(){
        window.location = "../html/homepage.html";
    })
}

function GetViewProject(){
    var projectId = localStorage.getItem("projectArrayId");
    var latestProjectData = JSON.parse(localStorage.getItem("latestProjectData"));

    //reference html data points
    var projectTitle = document.getElementById("projectNameTitle");
    var likesCount = document.getElementById("likesCount");
    var creationDate = document.getElementById("creationDate");
    var creatorName = document.getElementById("creatorName");
    var companyName = document.getElementById("companyName");
    var layoutId = document.getElementById("layoutId");
    var bedroomCount = document.getElementById("bedroomsCount");
    var furnituresUsed = document.getElementById("furnituresUsed");

    projectTitle.innerHTML = latestProjectData[projectId].nameOfLayout;
    likesCount.innerHTML = latestProjectData[projectId].likes;
    creationDate.innerHTML = latestProjectData[projectId].dateCreated;
    creatorName.innerHTML = latestProjectData[projectId].creator;
    companyName.innerHTML = latestProjectData[projectId].companyId;
    layoutId.innerHTML = latestProjectData[projectId].layoutId;
    bedroomCount.innerHTML = latestProjectData[projectId].noOfBedrooms;
    furnituresUsed.innerHTML = latestProjectData[projectId].furnitureUsed;
}

GetViewProject();