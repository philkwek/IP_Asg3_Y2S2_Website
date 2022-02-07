import { getDatabase, ref, child, set, update, remove, get, orderByChild, query, equalTo } from "https://www.gstatic.com/firebasejs/9.5.0/firebase-database.js"
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

//References
var uid;
var projectKeysArray;
var profileProjectData;
var pageNumber = 0; //for page number of project page


onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      uid = user.uid;
      GetUserData();
      GetUserProjects();
      GetProfilePicture();
      // ...
    } 
});

function GetProfilePicture(){ //gets profilepicture img url from db and sets attribute
    const pathRef = sRef(storage, "Images/userProfilePictures/" + uid +"/profilePicture.jpg");
    getDownloadURL(pathRef).then((url)=>{
        const profilePicSet = document.getElementById("profilePicture");
        profilePicSet.setAttribute('src', url);
    }).catch((error) =>{
        //if does not exist, placeholder default pfp is used
    })
}

function GetUserData(){
    const dbref = ref(db);
    get(child(dbref, "users/" + uid)).then((snapshot)=>{ //get company name from database
        if(snapshot.exists()){
            const data = snapshot.val();
            document.getElementById("username").innerHTML = data.username;
            document.getElementById("projectsCount").innerHTML = data.projectsCreated.length;
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

function GetUserProjects(){
    const dbref = ref(db);
    const userProjects = query(ref(db, 'projects/'), orderByChild("creator"), equalTo(uid))
    get(userProjects).then((snapshot)=>{
        if(snapshot.exists()){
            var data = snapshot.val();
            profileProjectData = Object.values(data);
            projectKeysArray = Object.keys(data);
            localStorage.setItem("profileProjectData", JSON.stringify(data));
            var projectNumber = 0;
            for (let i=0; i<profileProjectData.length; i++){ //functions loops through all existing projects, displays first top 8
                projectNumber += 1;
                if (projectNumber > 4){
                    break //ensures function loads only the first 8 projects on screen
                };
                //creates reference IDs for innerHTML insertion of data
                var projectId = "project_" + i;
                var nameId = "nameOfLayout_" + i;
                var likesId = "likesCount_" + i;
                var imageId = "coverImage_" + i;

                document.getElementById(projectId).style.display = "inline";
                document.getElementById(projectId).addEventListener("click", function(){
                    ViewProject(i);
                });
                document.getElementById(nameId).innerHTML = profileProjectData[i].nameOfLayout;
                document.getElementById(likesId).innerHTML = profileProjectData[i].likes.length;
                //insert cover image
            }
            //Creates navigation buttons
            var noOfButtons = Math.ceil(profileProjectData.length/4); //calculate number of nav buttons needed
            //var noOfButtons = 3;
            if (noOfButtons > 0){
                for (let i=0; i<noOfButtons; i++){
                    //<button type="button" class="btn btn-primary m-1" id="">1</button>
                    var buttonId = "page" + i;
                    var buttonName = i + 1;
                    let btn = document.createElement("button");
                    btn.innerHTML = buttonName;
                    if (i==0){
                    btn.className="btn btn-primary m-1"; //blue color for currently selected page
                    } else {
                        btn.className = "btn btn-secondary m-1";
                    }
                    btn.id = "pageButton" + i;
                    btn.addEventListener("click", function(){
                        nextPage(i);
                    });
                    document.getElementById("navigation").appendChild(btn);
                }
            }
        } else {
            console.log("failed");
        }
    });
}

function nextPage(newPageNumber){ //loads projects based on page number clicked
    for (let i=0; i<4; i++){ //functions loops through all existing projects, displays that pages 8
        //creates reference IDs for innerHTML insertion of data
        var projectId = "project_" + i;
        document.getElementById(projectId).style.display = "none";
    }
    var buttonId = "pageButton" + newPageNumber;
    var oldButtonId = "pageButton" + pageNumber;
    document.getElementById(buttonId).className = "btn btn-primary m-1";
    document.getElementById(oldButtonId).className = "btn btn-secondary m-1";
    pageNumber = newPageNumber;

    if (pageNumber==0){
        var projectCount = 0; //current count of project if page number is 1 (or 0 in script terms)
        var maxProjectNumber = 4; //highest count of projects that can be shown
    } else {
        var projectCount = pageNumber * 4; //current count of project
        var maxProjectNumber = projectCount + 4; //highest count of projects that can be shown
    }

    var loopCount = -1;
    for (let i=projectCount; i<profileProjectData.length; i++){ //functions loops through all existing projects, displays that pages 8
        projectCount += 1;
        loopCount += 1;
        if (projectCount > maxProjectNumber){
            break //ensures function loads only 8 projects
        };
        //creates reference IDs for innerHTML insertion of data
        var projectId = "project_" + loopCount;
        var nameId = "nameOfLayout_" + loopCount;
        var likesId = "likesCount_" + loopCount;
        var imageId = "coverImage_" + loopCount;

        document.getElementById(projectId).style.display = "inline";
        document.getElementById(projectId).addEventListener("click", function(){
            ViewProject(i);
        });
        document.getElementById(nameId).innerHTML = profileProjectData[i].nameOfLayout;
        document.getElementById(likesId).innerHTML = profileProjectData[i].likes.length;
        //insert cover image
    }
}

function ViewProject(projectArrayId){
    var viewProjectKey = projectKeysArray[projectArrayId];
    localStorage.setItem("viewProjectKey", viewProjectKey); //store viewprojectid into localstorage to be retrieved when viewProject.html opens 
    window.location = "../html/viewProject_profile.html";
}
