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
var latestProjectData; //for global usage of the current project data from db
var projectKeysArray; //array of all the project ids
var pageNumber = 0; //for page number of project page
var uid; //global user id variable
var searchButton = document.getElementById("searchIcon");
var searchInput = document.getElementById("searchInput");

if (searchButton){
    searchButton.addEventListener("click", function(){
        if (document.getElementById("searchDiv").style.display == "inline"){
            document.getElementById("searchDiv").style.display = "none";
        } else {
            document.getElementById("searchDiv").style.display = "inline";
        }
    })
}

if (searchInput){
    searchInput.addEventListener("keydown", function(){ //runs whenever a key is pressed to print suggestions
        searchResults(); 
    })
}

onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      uid = user.uid;
      // ...
    } 
});

function getLatestList(){ //gets names of all projects for search
    const mostRecentProjects = query(ref(db, 'projects'), orderByChild("dateCreated"));
    get(mostRecentProjects).then((snapshot) =>{
        var data = snapshot.val();
        latestProjectData = Object.values(data);
        var projectNumber = 0;
        for (let i=0; i<latestProjectData.length; i++){ //functions loops through all existing projects, displays first top 8
            projectNumber += 1;
            //projectNamesObj.push(latestProjectData[i].nameOfLayout.toString());
        };
    })
};


function insertLatestProject(){ //loads in the first 8 projects from db on first load
    const dbRef = ref(getDatabase());
    const mostRecentProjects = query(ref(db, 'projects'), orderByChild("dateCreated"));
    get(mostRecentProjects).then((snapshot) =>{
        var data = snapshot.val();
        latestProjectData = Object.values(data);
        projectKeysArray = Object.keys(data);
        localStorage.setItem("latestProjectData", JSON.stringify(data));
        var projectNumber = 0;
        for (let i=0; i<latestProjectData.length; i++){ //functions loops through all existing projects, displays first top 8
            projectNumber += 1;
            if (projectNumber > 6){
                break //ensures function loads only the first 8 projects on screen
            };
            //creates reference IDs for innerHTML insertion of data
            var projectId = "project_" + i;
            var nameId = "nameOfLayout_" + i;
            var likesId = "likesCount_" + i;
            var imageId = "coverImage_" + i;

            document.getElementById(projectId).style.display = "inline";
            document.getElementById(projectId).addEventListener("click", function(){
                viewProject(i);
            });
            document.getElementById(nameId).innerHTML = latestProjectData[i].nameOfLayout;
            if(latestProjectData[i].likes){
                document.getElementById(likesId).innerHTML = latestProjectData[i].likes.length;
            }

            if (latestProjectData[i].pictures){ 
                document.getElementById(imageId).src = "data:image/png;base64," + latestProjectData[i].pictures[0];
            }else{
                document.getElementById(imageId).src = "../resources/icons/Placeholder.png";
            };
            
        }

        //Creates navigation buttons
        var noOfButtons = Math.ceil(latestProjectData.length/6); //calculate number of nav buttons needed
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
    })
}

function nextPage(newPageNumber){ //loads projects based on page number clicked
    for (let i=0; i<6; i++){ //functions loops through all existing projects, displays that pages 8
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
        var maxProjectNumber = 6; //highest count of projects that can be shown
    } else {
        var projectCount = pageNumber * 6; //current count of project
        var maxProjectNumber = projectCount + 6; //highest count of projects that can be shown
    }

    var loopCount = -1;
    for (let i=projectCount; i<latestProjectData.length; i++){ //functions loops through all existing projects, displays that pages 8
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
            viewProject(i);
        });
        document.getElementById(nameId).innerHTML = latestProjectData[i].nameOfLayout;
        if (latestProjectData[i].likes){
            document.getElementById(likesId).innerHTML = latestProjectData[i].likes.length;
        } else {
            document.getElementById(likesId).innerHTML = 0;
        };
        //insert cover image
        if (latestProjectData[i].pictures){ 
            document.getElementById(imageId).src = "data:image/png;base64," + latestProjectData[i].pictures[0];
        }else{
            document.getElementById(imageId).src = "../resources/icons/Placeholder.png";
        };
    }
}

function searchResults(){
    var input = document.getElementById("searchInput");
    input = input.value.toUpperCase(); //converts input to all upper case, making the search none case-senstive
    for (let i=0; i<5; i++){    //hides all currently shown suggestions
        var suggestionId = "suggestions" + i;
        document.getElementById(suggestionId).style.display = "none";
    }
    if (input != ""){ //ensures suggestions are only given on inputs that are not empty
        var suggestionBoxUsed = -1;
        for (let i=0; i<latestProjectData.length; i++) { //loops through data object 
            var a = latestProjectData[i].nameOfLayout;
            if (suggestionBoxUsed > 3){
                break; //breaks loop when all 5 suggestion boxes has been used
            }
            if(a.toUpperCase().indexOf(input) > -1){ //checks if input is in the currently looped object (nameOfLayout)
                suggestionBoxUsed += 1; 
                var suggestionId = "suggestions" + suggestionBoxUsed;
                document.getElementById(suggestionId).innerHTML = a;
                document.getElementById(suggestionId).addEventListener("click", function(){
                    viewProject(i);
                })
                document.getElementById(suggestionId).style.display = "inline";
            } else if (i == latestProjectData.length - 1  && suggestionBoxUsed == -1){
                console.log("no suggestions");
                suggestionBoxUsed += 1; 
                var suggestionId = "suggestions" + suggestionBoxUsed;
                document.getElementById(suggestionId).innerHTML = "No results found";
                document.getElementById(suggestionId).style.display = "inline";
                break //if not, continue until all 5 suggestions boxes are used or when there are no more object names
            }
        }
    }
}

function viewProject(projectArrayId){
    var viewProjectKey = projectKeysArray[projectArrayId];
    localStorage.setItem("viewProjectKey", viewProjectKey); //store viewprojectid into localstorage to be retrieved when viewProject.html opens 
    window.location = "../html/viewProject.html";
}

insertLatestProject();
getLatestList();
searchResults();

