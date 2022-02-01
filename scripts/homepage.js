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
var uid; //global user id variable

onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      uid = user.uid;
      // ...
    } 
});

//Reference
var projectGallery = document.getElementById("projectGallery");

function InsertLatestProject(){
    const dbRef = ref(getDatabase());
    const mostRecentProjects = query(ref(db, 'projects'), orderByChild("dateCreated"));
    get(mostRecentProjects).then((snapshot) =>{
        var data = snapshot.val();
        var data = Object.values(data);

        for (let i=0; i<data.length; i++){ //functions loops through all existing projects, displays first top 8
            console.log(data[i]);

        }
    })
}

InsertLatestProject();
