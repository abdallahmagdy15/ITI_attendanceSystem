$(function () {
    $("#profileReportsTabs li a").click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });
})
let usernameSession = sessionStorage.getItem('username');
if (usernameSession == undefined)
    location.replace('../login_page.html');
//load current user data
fetch('../data/employees.json').then((emps) => emps.json())
    .then(emps => {
        console.log(emps);
        let emp = getEmp(emps , usernameSession);
        if (emp != false)
            loadEmpData(emp);
    })
    .catch(emps => {
        console.log("failed to load employees json file");
    });


function loadEmpData(emp) {
    $('#empName').text(emp.fname + " " + emp.lname);
    $('#profileEmail').text(emp.email);
    $('#profileAddress').text(emp.address);
    $('#profileAge').text(emp.age);
    $('#profileDoE').text(emp.dateofemp);
    if (emp.subadmin != undefined) {
        $('#profileOptions').append('<li  class="optionlist"><a href="attendance_page.html">Take Attendance</a></li>');
    }
}

