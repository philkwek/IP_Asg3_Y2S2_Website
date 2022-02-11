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

//Global References
var companyProjectData;
var profileProjectData;
var projectKeysArray;
var pageNumber = 0;
var searched = false;

//Button References
const searchUserButton = document.getElementById("searchUsersBtn");
const userDiv = document.getElementById("userData");
const searchCompanyButton = document.getElementById("searchCompanyBtn");
const companyDiv = document.getElementById("companyData");
const makeNewSearchButton = document.getElementById("makeNewSearch");

if (makeNewSearchButton){
    makeNewSearchButton.addEventListener("click", function(){
        location.reload();
    });
}

if (searchUserButton){
    searchUserButton.addEventListener("click", function(){
        const searchInput = document.getElementById("searchInput").value;
        if(validateEmail(searchInput)){ //validates input to check if email or not
            searchUsers(searchInput, true);
        } else {
            searchUsers(searchInput, false);
        }
    })
}

if (searchCompanyButton){
    searchCompanyButton.addEventListener("click", function(){
        const searchInput = document.getElementById("searchInput").value;
        searchCompany(searchInput);
    })
}

function hideSearch(searchType){ //function for hiding search bar and buttons for looking at results
    document.getElementById("makeNewSearch").style.display = "";
    var elements = document.getElementsByClassName("newSearch")
    for (let i=0; i<elements.length; i++){
        elements[i].style.display = "none";
    }
    if (searchType){ //true=user search, false=company search
        userDiv.style.display = "";
        companyDiv.style.display = "none";
    } else {
        userDiv.style.display = "none";
        companyDiv.style.display = "";
    }
}

function validateEmail(input) //function for checking if input is an email or not
{
    var re = /\S+@\S+\.\S+/;
    return re.test(input);
}

function searchUsers(input, emailCheck){
    if (emailCheck){
        var searchQuery = query(ref(db, 'users'), orderByChild("email"), equalTo(input), limitToFirst(1));
    } else {
        var searchQuery = query(ref(db, 'users'), orderByChild("username"), equalTo(input), limitToFirst(1));
    }
    get(searchQuery).then((snapshot)=>{
        if (snapshot.exists()){
            hideSearch(true);
            var data = snapshot.val();
            var userId = Object.values(data)[0].databaseId;
            getUserProjects(userId);
            getProfilePicture(userId);
            getUserData(userId);
        } else { //Runs if user searched does not exist
            alert("User does not exist! User name & email is case sensitive. Please try again.")
        }
    });
}

function searchCompany(companyName){
    const searchQuery = query(ref(db, 'company'), orderByChild("companyName"), equalTo(companyName), limitToFirst(1));
    get(searchQuery).then((snapshot)=>{
        if (snapshot.exists()){
            hideSearch(false);
            var data = snapshot.val();
            data = Object.values(data)[0];
            document.getElementById("companyName").innerHTML = data.companyName; //inserts name of company
            const companyId = data.companyId; //get company id for getting company projects
            getCompanyProjects(companyId);
            getCompanyEmployees(companyId);
            getCompanyLogo(companyId);

        } else {
            alert("Company does not exist! Company name is case sensitive. Please try again.");
        }
    });
}

function getCompanyLogo(companyId){

}

function getCompanyProjects(companyId){
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
                    viewProject(i);
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

function viewProject(projectArrayId){
    var viewProjectKey = projectKeysArray[projectArrayId];
    localStorage.setItem("viewProjectKey", viewProjectKey); //store viewprojectid into localstorage to be retrieved when viewProject.html opens 
    window.location = "../html/viewProject.html";
}

function getCompanyEmployees(companyId){
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

function getUserProjects(userId){
    const dbref = ref(db);
    const userProjects = query(ref(db, 'projects/'), orderByChild("creator"), equalTo(userId))
    get(userProjects).then((snapshot)=>{
        if(snapshot.exists()){
            var data = snapshot.val();
            profileProjectData = Object.values(data);
            projectKeysArray = Object.keys(data);
            document.getElementById("projectsCount").innerHTML = profileProjectData.length;
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
                
                if (profileProjectData[i].likes){
                    document.getElementById(likesId).innerHTML = profileProjectData[i].likes.length;
                } else {
                    document.getElementById(likesId).innerHTML = 0;
                }
                
                if (profileProjectData[i].pictures){ 
                    document.getElementById(imageId).src = "data:image/png;base64," + profileProjectData[i].pictures[0];
                }else{
                    document.getElementById(imageId).src = "../resources/icons/Placeholder.png";
                };

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
        
        if (profileProjectData[i].likes){
            document.getElementById(likesId).innerHTML = profileProjectData[i].likes.length;
        } else {
            document.getElementById(likesId).innerHTML = 0;
        }

        if (profileProjectData[i].pictures){ 
            document.getElementById(imageId).src = "data:image/png;base64," + profileProjectData[i].pictures[0];
        }else{
            document.getElementById(imageId).src = "../resources/icons/Placeholder.png";
        };

    }
}

function getProfilePicture(userId){ //gets profilepicture img url from db and sets attribute
    const pathRef = sRef(storage, "Images/userProfilePictures/" + userId +"/profilePicture.jpg");
    const profilePicSet = document.getElementById("profilePicture");
    getDownloadURL(pathRef).then((url)=>{
        profilePicSet.setAttribute('src', url);
    }).catch((error) =>{
        //if does not exist, default pfp is used
        var url = "../resources/icons/DefaultProfilePicture.png"
        profilePicSet.setAttribute('src', url);
    })
}

function getUserData(userId){
    const dbref = ref(db);
    get(child(dbref, "users/" + userId)).then((snapshot)=>{ //get company name from database
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