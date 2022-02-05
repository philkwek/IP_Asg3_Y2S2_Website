
function User(email, username, databaseId){
    this.email = email;
    this.username = username;
    this.companyId = 0; //0 = no company associated with the account, id is companyname + #0000 (id)
    this.databaseId = databaseId; //this Id is the one provided by Firebase Auth (Private)
    this.projectsCreated = [];
}

function Company(companyName, companyId, databaseId){
    this.companyName = companyName;
    this.companyId = companyId; //id format = *companyname*#0000 (manual input)
    this.employeeList = [databaseId];
    this.createdProjects = [];
}
