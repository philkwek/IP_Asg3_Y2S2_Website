
//References for landing page buttons
var signupPageButton = document.getElementById("signupPageButton");
var loginPageButton = document.getElementById("loginPageButton");
var landingTitle = document.getElementById("landingTitle")
var openCreateAccount = document.getElementById("openCreateAccount")
var openLoginAccount = document.getElementById("openLoginAccount");
var createCompanyCheck = document.getElementById("createCompany");
//Listeners for button presses
if(createCompanyCheck){
    createCompanyCheck.addEventListener("click", function(x){
        x.preventDefault();
        document.getElementById("createCompanyInput").style.display = "inline";
    })
}

if (signupPageButton){
    signupPageButton.addEventListener("click", function(x){
        x.preventDefault();
        window.location.href = "html/signup.html";
    })
}

if (loginPageButton){
    loginPageButton.addEventListener("click", function(x){
        x.preventDefault();
        window.location.href = "html/login.html";
    })
}

if(landingTitle){
    landingTitle.addEventListener("click", function(x){
        x.preventDefault();
        window.location.href = "../index.html";
    })
}

if(openCreateAccount){
    openCreateAccount.addEventListener("click", function(x){
        x.preventDefault();
        window.location.href = "../html/signup.html";
    })
}

if(openLoginAccount){
    openLoginAccount.addEventListener("click", function(x){
        x.preventDefault();
        window.location.href = "../html/login.html";
    })
}
