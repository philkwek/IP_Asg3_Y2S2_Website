import { getDatabase, ref, child, set, update, remove, get, orderByChild, query, equalTo, limitToFirst } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-database.js"
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
import {getStorage, ref as sRef, deleteObject, getDownloadURL, uploadBytes} from "https://www.gstatic.com/firebasejs/9.5.0/firebase-storage.js";

//Reference the imports
const auth = getAuth();
const db = getDatabase();
const storage = getStorage();

//Button References
const searchUserButton = document.getElementById("searchUsersBtn");
const searchCompanyButton = document.getElementById("searchCompanyBtn");

if (searchUserButton){
    searchUserButton.addEventListener("click", function(){
        const searchInput = document.getElementById("searchInput").value;
        if(ValidateEmail(searchInput)){ //validates input to check if email or not
            SearchUsers(searchInput, true);
        } else {
            SearchUsers(searchInput, false);
        }
    })
}

if (searchCompanyButton){
    searchCompanyButton.addEventListener("click", function(){
        const searchInput = document.getElementById("searchInput").value;
        SearchCompany(searchInput);
    })
}

function SearchUsers(input, emailCheck){
    if (emailCheck){
        var searchQuery = query(ref(db, 'users'), orderByChild("email"), equalTo(input), limitToFirst(1));
    } else {
        var searchQuery = query(ref(db, 'users'), orderByChild("username"), equalTo(input), limitToFirst(1));
    }
    get(searchQuery).then((snapshot)=>{
        if (snapshot.exists()){
            console.log(snapshot.val());
        } else { //Runs if user searched does not exist
            console.log("failed");
        }
    });
}

function SearchCompany(companyName){
    const searchQuery = query(ref(db, 'company'), orderByChild("companyName"), equalTo(companyName), limitToFirst(1));
    get(searchQuery).then((snapshot)=>{
        if (snapshot.exists()){
            console.log(snapshot.val());
        } else {
            console.log("failed");
        }
    });
}

function ValidateEmail(input) //function for checking if input is an email or not
{
    var re = /\S+@\S+\.\S+/;
    return re.test(input);
}