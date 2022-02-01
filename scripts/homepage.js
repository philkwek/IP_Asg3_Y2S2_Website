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
var pageNumber = 0; //for page number of project page
var uid; //global user id variable
var searchButton = document.getElementById("searchIcon");
var projectNamesObj = [];

if (searchButton){
    searchButton.addEventListener("click", function(){
        if (document.getElementById("searchDiv").style.display == "inline"){
            document.getElementById("searchDiv").style.display = "none";
        } else {
            document.getElementById("searchDiv").style.display = "inline";
        }
    })
}

onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      uid = user.uid;
      // ...
    } 
});

function GetLatestList(){ //gets names of all projects for search
    const dbRef = ref(getDatabase());
    const mostRecentProjects = query(ref(db, 'projects'), orderByChild("dateCreated"));
    get(mostRecentProjects).then((snapshot) =>{
        var data = snapshot.val();
        latestProjectData = Object.values(data);
        var projectNumber = 0;
        for (let i=0; i<latestProjectData.length; i++){ //functions loops through all existing projects, displays first top 8
            projectNumber += 1;
            projectNamesObj.push(latestProjectData[i].nameOfLayout.toString());
        };
    })
};


function InsertLatestProject(){ //loads in the first 8 projects from db on first load
    const dbRef = ref(getDatabase());
    const mostRecentProjects = query(ref(db, 'projects'), orderByChild("dateCreated"));
    get(mostRecentProjects).then((snapshot) =>{
        var data = snapshot.val();
        latestProjectData = Object.values(data);
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
            document.getElementById(nameId).innerHTML = latestProjectData[i].nameOfLayout;
            document.getElementById(likesId).innerHTML = latestProjectData[i].likes;
            //insert cover image
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
    console.log("clicked")

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
        document.getElementById(nameId).innerHTML = latestProjectData[i].nameOfLayout;
        document.getElementById(likesId).innerHTML = latestProjectData[i].likes;
        //insert cover image
    }
}

function SearchResults(){
    var input = document.getElementById("searchInput");
    //get list of all names of layouts in a array
    console.log(Array.isArray(projectNamesObj));
    console.log(projectNamesObj);
    console.log(projectNamesObj)
}

InsertLatestProject();
GetLatestList();
SearchResults();

