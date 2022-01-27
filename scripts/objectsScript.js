
function User(email, username, userId, databaseId){
    this.email = email;
    this.username = username;
    this.userId = userId; //this Id is for public use
    this.companyId = 0; //0 = no company associated with the account, id is companyname + #0000 (id)
    this.databaseId = databaseId; //this Id is the one provided by Firebase Auth (Private)
}

function Company(companyName, companyId, employeeList){
    this.companyName = companyName;
    this.companyId = companyId; //id format = *companyname*#0000 (manual input)
    this.employeeList = employeeList;
}

function employeeList(userId){
    this.userId = userId;
}