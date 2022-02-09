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

//References
var uid;
var companyProjectData;
var projectKeysArray;
var pageNumber = 0;

onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      uid = user.uid;
      GetUserCompanyId(uid);
    } 
});

function GetUserCompanyId(userId){
    const dbref = ref(db);
    get(child(dbref, "users/" + userId)).then((snapshot)=>{
        if(snapshot.exists()){
            var data = snapshot.val();
            if (data.companyId != 0){ //checks if user is currently in a company or not
                document.getElementById("companyData").style.display = "";
                GetCompanyProjects(data.companyId);
                GetCompanyEmployees(data.companyId);
                GetCompanyName(data.companyId);
            } else { //if not in company, displays message that user is not in company
                document.getElementById("noCompanyTitle").style.display = "";
            }
        } else {
            console.log("Failed");
        }
    });
}

function GetCompanyName(companyId){
    const dbref = ref(db);
    get(child(dbref, "company/" + companyId)).then((snapshot)=>{
        if(snapshot.exists()){
            var data = snapshot.val();
            document.getElementById("companyName").innerHTML = data.companyName;
        } else {
            console.log("Failed");
        }
    });
}

function GetCompanyProjects(companyId){
    const searchQuery = query(ref(db, 'projects'), orderByChild("companyId"), equalTo(companyId));
    get(searchQuery).then((snapshot)=>{
        if(snapshot.exists()){
            var data = snapshot.val();
            companyProjectData = Object.values(data);
            projectKeysArray = Object.keys(data);
            localStorage.setItem("latestProjectData", JSON.stringify(data));
            var projectNumber = 0;
            document.getElementById("companyProjectCount").innerHTML = companyProjectData.length;
            for (let i=0; i<companyProjectData.length; i++){ //functions loops through all existing projects, displays first top 8
                projectNumber += 1;
                if (projectNumber > 4){
                    break //ensures function loads only the first 8 projects on screen
                };
                //creates reference IDs for innerHTML insertion of data
                var projectId = "companyProject_" + i;
                var nameId = "companyNameOfLayout_" + i;
                var likesId = "companyLikesCount_" + i;
                var imageId = "companyCoverImage_" + i;

                document.getElementById(projectId).style.display = "inline";
                document.getElementById(projectId).addEventListener("click", function(){
                    ViewProject(i);
                });
                document.getElementById(nameId).innerHTML = companyProjectData[i].nameOfLayout;
                
                if (companyProjectData[i].likes){
                    document.getElementById(likesId).innerHTML = companyProjectData[i].likes.length;
                } else {
                    document.getElementById(likesId).innerHTML = 0;
                }
                
                if (companyProjectData[i].pictures){ 
                    document.getElementById(imageId).src = "data:image/png;base64," + companyProjectData[i].pictures[0];
                }else{
                    document.getElementById(imageId).src = "../resources/icons/Placeholder.png";
                };

            }
            //Creates navigation buttons
            var noOfButtons = Math.ceil(companyProjectData.length/4); //calculate number of nav buttons needed
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
                        companyNextPage(i);
                    });
                    document.getElementById("companyNavigation").appendChild(btn);
                }
            }
        } else {
            console.log("failed");
        }
    });
}

function companyNextPage(newPageNumber){ //loads projects based on page number clicked
    for (let i=0; i<4; i++){ //functions loops through all existing projects, displays that pages 8
        //creates reference IDs for innerHTML insertion of data
        var projectId = "companyProject_" + i;
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
    for (let i=projectCount; i<companyProjectData.length; i++){ //functions loops through all existing projects, displays that pages 8
        projectCount += 1;
        loopCount += 1;
        if (projectCount > maxProjectNumber){
            break //ensures function loads only 8 projects
        };
        //creates reference IDs for innerHTML insertion of data
        var projectId = "companyProject_" + loopCount;
        var nameId = "companyNameOfLayout_" + loopCount;
        var likesId = "companyLikesCount_" + loopCount;
        var imageId = "companyCoverImage_" + loopCount;

        document.getElementById(projectId).style.display = "inline";
        document.getElementById(projectId).addEventListener("click", function(){
            ViewProject(i);
        });
        document.getElementById(nameId).innerHTML = companyProjectData[i].nameOfLayout;
        
        if (companyProjectData[i].likes){
            document.getElementById(likesId).innerHTML = companyProjectData[i].likes.length;
        } else {
            document.getElementById(likesId).innerHTML = 0;
        }

        if (companyProjectData[i].pictures){ 
            document.getElementById(imageId).src = "data:image/png;base64," + companyProjectData[i].pictures[0];
        }else{
            document.getElementById(imageId).src = "../resources/icons/Placeholder.png";
        };

    }
}

function ViewProject(projectArrayId){
    var viewProjectKey = projectKeysArray[projectArrayId];
    localStorage.setItem("viewProjectKey", viewProjectKey); //store viewprojectid into localstorage to be retrieved when viewProject.html opens 
    window.location = "../html/viewProject.html";
}

function GetCompanyEmployees(companyId){
    const searchQuery = query(ref(db, 'users'), orderByChild("companyId"), equalTo(companyId));
    get(searchQuery).then((snapshot)=>{
        if (snapshot.exists()){
            var data = snapshot.val();
            data = Object.values(data);
            var string = ""
            for (let i = 0; i<data.length; i++){
                string += data[i].username + "<br>"
            };
            document.getElementById("companyDesignerList").innerHTML = string;
            document.getElementById("companyDesignerCount").innerHTML = data.length;
        } else {
            console.log("Failed to get Employees");
        }
    });
}