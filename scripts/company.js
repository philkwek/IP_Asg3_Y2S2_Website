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
var companyId;
var companyProjectData;
var projectKeysArray;
var pageNumber = 0;
var inviteDesignerBtn = document.getElementById("inviteDesignerBtn");
var acceptInvite = document.getElementById("invitedToCompanyAccept");
var rejectInvite = document.getElementById("invitedToCompanyReject");

var imageUploaded;
var logoInput = document.getElementById("companyLogoUpload");
var logoInputBtn = document.getElementById("newLogoConfirm");

onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      uid = user.uid;
      getUserCompanyId(uid);
    } 
});

if (acceptInvite){
    acceptInvite.addEventListener("click", function(){
        addUserToCompany(uid);
    });
    rejectInvite.addEventListener("click", function(){
        const dbref = ref(db);
        const updateUserCompany = {};
        updateUserCompany['/users/' + uid + "/companyId"] = 0;
        return update(dbref, updateUserCompany); //removes company id to indicate that user did not want to join company
    })
}

if (inviteDesignerBtn){
    inviteDesignerBtn.addEventListener("click", function(){
        inviteDesigner(document.getElementById("designerEmailInput").value)
    })
}

function addUserToCompany(userId){
    const dbref = ref(db);
    get(child(dbref, "company/" + companyId)).then((snapshot)=>{
        if (snapshot.exists()){
            var data = snapshot.val();
            console.log(data);
            var employeeList = data.employeeList; //get employee list
            employeeList.push(userId);

            //Update company data to include new employee
            set(ref(db, 'company/' + companyId + '/employeeList'), employeeList).then(()=>{
                location.reload();
            })      
        } else {
            console.log("error");
        }
    });
}

function getUserCompanyId(userId){
    const dbref = ref(db);
    get(child(dbref, "users/" + userId)).then((snapshot)=>{
        if(snapshot.exists()){
            var data = snapshot.val();
            if (data.companyId != 0){ //checks if user is currently in a company, invited to a company or not in an company
                companyId = data.companyId;

                //check if user has accepted invitation to company or not
                get(child(dbref, "company/" + companyId)).then((snapshot)=>{
                    if (snapshot.exists()){
                        var data = snapshot.val();
                        console.log(data);
                        var employeeList = data.employeeList; //get employee list
                        var userAccepted = false;
                        for (let i=0; i<employeeList.length; i++){ //check if userId is in employee list, if exist, then user has accepted invitation
                            if (employeeList[i] == userId){
                                userAccepted = true;
                                document.getElementById("companyData").style.display = "";
                                getCompanyProjects(companyId);
                                getCompanyEmployees(companyId);
                                getCompanyName(companyId);
                                getCompanyLogo(companyId);
                                break
                            }
                        }
                        if (userAccepted == false){ //if user has not accepted, ask user if they want to accept
                            document.getElementById("invitedToCompany").style.display = "";
                            document.getElementById("invitedToCompanyName").innerHTML = data.companyName;
                        }
                    } else {
                        console.log("error");
                    }
                });

            } else { //if not in company, displays message that user is not in company
                document.getElementById("noCompanyTitle").style.display = "";
            }
        } else {
            console.log("Failed");
        }
    });
}

function getCompanyName(companyId){
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

function getCompanyLogo(companyId){
    const pathRef = sRef(storage, "Images/companyLogo/" + companyId +"/companyLogo.jpg");
    const logoSet = document.getElementById("companyLogo");
    getDownloadURL(pathRef).then((url)=>{
        logoSet.setAttribute('src', url);
    }).catch((error) =>{
        //if does not exist, default pfp is used
        var url = "../resources/icons/DefaultProfilePicture.png";
        logoSet.setAttribute('src', url);
    })
}

function getCompanyProjects(companyId){
    const searchQuery = query(ref(db, 'projects'), orderByChild("companyId"), equalTo(companyId));
    get(searchQuery).then((snapshot)=>{
        if(snapshot.exists()){
            var data = snapshot.val();
            companyProjectData = Object.values(data);
            projectKeysArray = Object.keys(data);
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
}

function viewProject(projectArrayId){
    var ViewProjectKey = projectKeysArray[projectArrayId];
    localStorage.setItem("latestProjectData", JSON.stringify(companyProjectData[projectArrayId]));
    localStorage.setItem("viewProjectKey", ViewProjectKey); //store viewprojectid into localstorage to be retrieved when viewProject.html opens 
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

function validateEmail(input) //function for checking if input is an email or not
{
    var re = /\S+@\S+\.\S+/;
    return re.test(input);
}

function inviteDesigner(email){
    if(validateEmail(email)){
        //runs if input is an email
        //check if a designer with email exists
        const searchQuery = query(ref(db, 'users'), orderByChild("email"), equalTo(email));
        get(searchQuery).then((snapshot)=>{
            if (snapshot.exists()){
                var data = Object.values(snapshot.val());
                const userId = data[0].databaseId;

                //updates to invite designer to company, designer has to accept invitation
                set(ref(db, 'users/' + userId + "/companyId"), companyId).then(()=>{
                    alert("Invited Designer Successfully!");
                })  
            } else {
                alert("Designer does not exist!")
            }
        })
    } else {
        alert("Please enter an Email!");
    }
}

function uploadImage(){
    if (imageUploaded){ //checks to ensure that user has selected a img for upload
        const storageRef = sRef(storage, "Images/companyLogo/"+companyId+"/"+"companyLogo.jpg");
        uploadBytes(storageRef, imageUploaded).then((snapshot) => {
            alert("Uploaded File!");
            location.reload();
        })
    } else {
        alert("You have not selected a image!")
    }
}


if (logoInput){ 
    logoInput.addEventListener("change", function(){
        imageUploaded = logoInput.files[0];
    })
}

if (logoInputBtn){
    logoInputBtn.addEventListener("click", function(){
      uploadImage();
    })
  }