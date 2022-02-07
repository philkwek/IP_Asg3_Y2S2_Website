 //This script handles all operations related to firebase realtimeDB and authentication
 
 // Import the functions you need from the SDKs you need
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
import { getDatabase, ref, child, set, update, remove, get, orderByChild } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-database.js";
import {getStorage, ref as sRef, deleteObject, getDownloadURL, uploadBytes} from "https://www.gstatic.com/firebasejs/9.5.0/firebase-storage.js";

//Reference the imports
const auth = getAuth();
const db = getDatabase();
const storage = getStorage();

//References
var uid;
var signUpButton = document.getElementById("signupButton");
var loginButton = document.getElementById("loginButton");
var logoutButton = document.getElementById("logoutButton");
var rememberMeState = document.getElementById("rememberMe"); //checkbox
var resetPasswordButton = document.getElementById("resetPasswordButton");
var usernamePlace = document.getElementById("dropdownMenuButton");
var changeEmailButton = document.getElementById("newEmailConfirmBtn");
var changeUsernameButton = document.getElementById("newUsernameConfirmBtn");
var createCompanyCheck = document.getElementById("createCompany");
var createCompanyButton = document.getElementById("createCompanyButton");

var imageInput = document.getElementById("profilePictureUpload");
var imageUploadBtn = document.getElementById("newProfilePictureConfirm");
var removeProfilePic = document.getElementById("confirmRemoveProfilePic");
var imageUploaded;

// Functions
function signUpUser(email, username, password, authType){
    setPersistence(auth, authType)
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        //Runs if user logged in
        var user = userCredential.user; 
        writeUserData(email, username, user.uid); //Calls function to create a new user profile for realtimeDB
        return;
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(error.message);
        return;
    });
} 

function loginUser(email, password, authType){
    setPersistence(auth, authType) //sets persistence to remember user
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed in 
        console.log("User logged in succesfully")

        const user = userCredential.user;
        const dbref = ref(db);

        //change webpage to homepage
        window.location.href = "homepage.html";
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(error.message);
        return;
    });
}

function logoutUser(){
  const auth = getAuth();
  signOut(auth).then(() => {
      displayUserData();
    // Sign-out successful.
  }).catch((error) => {
    // An error happened.
  });
}

function forgotPassword(email){
console.log("Sending email...")
const auth = getAuth();
sendPasswordResetEmail(auth, email)
    .then(() => {
        // Password reset email sent!
        console.log("Email sent!");
        alert("Email sent!");
        // ..
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage);
        // ..
    });
}

//function for writing user data into the realtimeDB
function writeUserData(email, username, databaseId) {
  let newUser = new User(email, username, databaseId);

  //sets profile data
  set(ref(db, 'users/' + databaseId), newUser)
  .then(()=>{
      console.log("User data written successfully");
      if (createCompanyCheck.checked){  // check if user is creating account with new company or just account
        //open create company page
        window.location.href = "createCompany.html"
    } else {
            //open homepage menu
        }
  })
  .catch((error)=>{
      console.log("Error uploading data!");
  });
}

function createCompany(companyName, companyId, databaseId){
    //check if ID or Name already exist,
    const dbref = ref(db);
    get(child(dbref, "company/" + companyId)).then((snapshot)=>{
      if(snapshot.exists()){
        alert("Company ID already exists! Please change to a different ID.");
      } else {  
          let newCompany = new Company(companyName, companyId, databaseId)
          set(ref(db, 'company/' + companyId), newCompany);

          const companyIdUpdate = {};
          companyIdUpdate['/users/' + databaseId + "/companyId"] = companyId;
          return update(dbref, companyIdUpdate);
      }
    });

    //if not, create new company, add current user then open alert and go to homepage
    //if yes, return alert error
}

// Event listeners
onAuthStateChanged(auth, (user) => {
if (user) {
  // User is signed in, see docs for a list of available properties
  // https://firebase.google.com/docs/reference/js/firebase.User
  uid = user.uid;
  console.log(uid);
  if (usernamePlace != null){
    const dbref = ref(db);
    get(child(dbref, "users/" + uid)).then((snapshot)=>{
      if(snapshot.exists()){
        const username = snapshot.val().username;
        $("#dropdownMenuButton").text(username);
      } else {
        console.log("Not found");
      }
    });
  }

  //For when user signs up and system logs user in
  var path = window. location. pathname;
  var page = path. split("/"). pop();
  console.log(page);
  if(page == "index.html"){
    window.location.href = "html/homepage.html"
  } 
  if(page == "signup.html"){
    window.location.href = "html/homepage.html"
  }
} else {
  // User is signed out

}
});

function changeEmail(newEmail) {
const auth = getAuth();
updateEmail(auth.currentUser, newEmail).then(() => {
  // Email updated!
  const emailUpdate = {};
  emailUpdate['/users/' + auth.currentUser.uid + "/email"] = newEmail;
  update(ref(db), emailUpdate);
  // ...
  alert("Email updated!");
}).catch((error) => {
  // An error occurred
  // ...
  alert("Email update failed");
});
}

function changeUsername(newUsername){
    const auth = getAuth();
    const uid = auth.currentUser.uid;

    const usernameUpdate = {};
    usernameUpdate['/users/' + uid + "/username"] = newUsername;
    return update(ref(db), usernameUpdate);
}

function UploadImage(){
  if (imageUploaded){ //checks to ensure that user has selected a img for upload
      const storageRef = sRef(storage, "Images/"+uid+"/"+"profilePicture.jpg");
      uploadBytes(storageRef, imageUploaded).then((snapshot) => {
          alert("Uploaded File!");
          location.reload();
      })

  } else {
      alert("You have not selected a image!")
  }
}

function DeleteProfilePicture(){
  const pathRef = sRef(storage, "Images/" + uid +"/profilePicture.jpg");
  deleteObject(pathRef).then(() =>{
      alert("Removed Profile Picture");
  }).catch((error) => {
      alert(error);
  })
}

if (imageInput){
  imageInput.addEventListener("change", function(){
      imageUploaded = imageInput.files[0];
  })
}
if (imageUploadBtn){
  imageUploadBtn.addEventListener("click", function(){
      UploadImage();
  })
}

if (removeProfilePic){
  removeProfilePic.addEventListener("click", function(x){
    DeleteProfilePicture();
  })
}

if (changeEmailButton){
changeEmailButton.addEventListener("click", function(x){
  console.log("email button clicked");
  x.preventDefault();
  var newEmail = document.getElementById("newEmailText").value;
  changeEmail(newEmail);
})
}

if (changeUsernameButton){
changeUsernameButton.addEventListener("click", function(x){
  console.log("username button clicked");
  x.preventDefault();
  var newUsername = document.getElementById("newUsernameText").value;
  changeUsername(newUsername);
})
}

if (signUpButton){
signUpButton.addEventListener("click", function(x){
  x.preventDefault();

  //Check remember me state
  var authType = browserSessionPersistence;
  if(rememberMeState.checked){
    authType = browserLocalPersistence;
  } else {
    authType = browserSessionPersistence;
  }

  const emailInput = document.getElementById("emailInput").value;
  const passwordInput = document.getElementById("passwordInput").value;
  const usernameInput = document.getElementById("usernameInput").value;

  console.log("Email: " + emailInput + " Password: " + passwordInput + " Username: " + usernameInput);
  signUpUser(emailInput, usernameInput, passwordInput, authType);
  console.log("Signing up user...")
})
}

if (loginButton){
loginButton.addEventListener("click",function(x){
  x.preventDefault();

  //Check remember me state
  var authType = browserSessionPersistence;
  if(rememberMeState.checked){
    authType = browserLocalPersistence;
  } else {
    authType = browserSessionPersistence;
  }
  const emailInput = document.getElementById("emailInput").value;
  const passwordInput = document.getElementById("passwordInput").value;
  loginUser(emailInput, passwordInput, authType);
  console.log("Logging in user...")
})
};

if(logoutButton){
logoutButton.addEventListener("click",function(x){
  x.preventDefault();
  console.log("Logging out user...")
  logoutUser();
  window.location.href = "../../index.html";
})
}

if (resetPasswordButton){
  resetPasswordButton.addEventListener("click", function(x){
    console.log("Reset button clicked")
    x.preventDefault();
    const emailInput = document.getElementById("emailInput").value;

    if (emailInput == ""){
      alert("Please input an Email")
    } else {
      forgotPassword(emailInput);
    }
  })
};

if (createCompanyButton){
    createCompanyButton.addEventListener("click", function(x){
        x.preventDefault();

        const companyName = document.getElementById("companyNameInput").value;
        const companyId = document.getElementById("companyIdInput").value;

        const user = auth.currentUser;
        const databaseId = user.uid;
        createCompany(companyName, companyId, databaseId);
    });
};

