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

function GetViewProject(){
    var projectId = localStorage.getItem("projectArrayId");
    var latestProjectData = JSON.parse(localStorage.getItem("latestProjectData"));
    console.log(projectId);
    console.log(latestProjectData);
}

GetViewProject();