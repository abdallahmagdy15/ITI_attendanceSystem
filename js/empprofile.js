$(function () {
    $("#profileReportsTabs li a").click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });
})
let usernameSession = sessionStorage.getItem('username');
if(usernameSession == undefined)
    location.replace('../login_page.html');
//load current user data
fetch('../data/employees.json').then((emps) => emps.json())
    .then(emps => {
        console.log(emps);
        let emp = getEmp(emps);
        if(emp != false)
            loadEmpData(emp);
    })
    .catch(emps => {
        console.log("failed to load employees json file");
    });

function getEmp(emps) {
    for (i in emps) {
        if (usernameSession == emps[i].username)
            return emps[i];
    }
    return false
}

function loadEmpData(emp) { 
    $('#empName').text(emp.fname + " " + emp.lname );
    $('#profileEmail').text(emp.email);
    $('#profileAddress').text(emp.address);
    $('#profileAge').text(emp.age);
    $('#profileDoE').text(emp.dateofemp);
 }