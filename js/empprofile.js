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
        let emp = getEmp(emps, usernameSession);
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
    showMonthlyReport(getMonthly(emp));
    showDailyReport(getDaily(emp));
}

function showMonthlyReport(reportRows) {
    let rows = "";
    for (i in reportRows) {
        rows += `
        <tr>
        <td>${reportRows[i].month}</td>
        <td>${reportRows[i].attend}</td>
        <td>${reportRows[i].late}</td>
        <td>${reportRows[i].absent}</td>
        </tr>
        `;
    }
    $('#monthlyReportRows').html(rows);
}

function showDailyReport(reportRows) {
    let rows = "";
    for (i in reportRows) {
        rows += `
        <tr>
        <td>${reportRows[i].day}</td>
        <td>${reportRows[i].time}</td>
        <td>${reportRows[i].late}</td>
        </tr>
        `;
    }
    $('#dailyReportRows').html(rows);
}

function getMonthly(emp) {
    let months = emp.attendance;
    let monthlyReport = [];
    let now = new Date();
    var atten = 0,
        late = 0,
        absent = 0;

    for (i in months) {
        for (j in months[i].days) {
            day = months[i].days[j];
            atten += (day.attended) ? 1 : 0;
            late += ((new Date(day.time)).getTime() > (new Date(day.time)).setHours(9, 0, 0)) ? 1 : 0;
        }
        if (now.getMonth() > months[i].month)
            absent = 30 - atten;
        else if (now.getMonth() == months[i].month)
            absent = now.getDay() - atten;
        else
            break;
        monthlyReport.push({
            month: months[i].month,
            attend: atten,
            late: late,
            absent: absent
        });
        atten = 0, late = 0, absent = 0;
    }
    return monthlyReport;
}


function getDaily(emp) {

    let currMonth = emp.attendance.filter(m => m.month == (new Date()).getMonth())[0];
    let dailyReport = [];
    var late = 0,
        i = 0;
    for (var j = 1; j <= (new Date()).getDay(); j++) {
        dayObj = currMonth.days[i];
        if (dayObj.day == j) {
            late = ((new Date(dayObj.time)).getTime() > (new Date(dayObj.time)).setHours(9, 0, 0)) ? 1 : 0;
            dailyReport.push({
                day: j,
                time: dayObj.time,
                late: late
            });
            i++;
        } else
            dailyReport.push({
                day: j,
                time: 0,
                late: 0
            });
    }
    return dailyReport;
}