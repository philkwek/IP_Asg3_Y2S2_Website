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

onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      uid = user.uid;
      GetUserData();
      // ...
    } 
});

function GetUserData(){
    const dbref = ref(db);
    get(child(dbref, "users/" + uid)).then((snapshot)=>{ //get company name from database
        if(snapshot.exists()){
            const data = snapshot.val();
            document.getElementById("username").innerHTML = data.username;
            get(child(dbref, "company/" + data.companyId)).then((snapshot)=>{ //get company name from database
                if(snapshot.exists()){
                    const name = snapshot.val().companyName;
                    document.getElementById("companyName").innerHTML = name;
                } else {
                    //ignore
                }
            });
            console.log(data);
        } else {
          console.log("Not found");
        }
    });
}

