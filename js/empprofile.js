$(function () {
    $("#profileReportsTabs li a").click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });
})
let monthly, currMonth = 1;
let usernameSession = sessionStorage.getItem('username');
if (usernameSession == undefined)
    location.replace('../login_page.html');

//load current user data
fetch('../data/employees.json').then((emps) => emps.json())
    .then(emps => {
        let emp = getEmp(emps, usernameSession);
        if (emp != false)
            showEmpData(emp);
    })
    .catch(emps => {
        console.log("failed to load employees json file");
    });


function showEmpData(emp) {
    $('#empName').text(emp.fname + " " + emp.lname);
    $('#username').text(emp.username);
    $('#profileEmail').text(emp.email);
    $('#profileAddress').text(emp.address);
    $('#profileAge').text(emp.age);
    $('#profileDoE').text(readableDate(emp.dateofemp));
    $('#code').text(emp.code);

    if (emp.subadmin != undefined) {
        $('#profileOptions').append('<li  class="optionlist"><a href="attendance_page.html">Take Attendance</a></li>');
    }
    monthly = getMonthly(emp.attendance)
    showMonthlyReport(monthly);
    currMonth = (new Date()).getMonth() + 1;
    showDailyReport(monthly, currMonth);
    showChart(monthly);
}

function showChart(monthly) {
    var ctx = $('#chart');
    var datasets = [];
    monthly.forEach(m => {
        datasets.push(m.attend);
    })

    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Attendance',
                data: datasets,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}
function showMonthlyReport(reportRows) {
    let rows = "";
    reportRows.forEach((m) => {
        rows += `
        <tr class="toggleCollapse">
        <td>${m.month}</td>
        <td>${m.attend}</td>
        <td>${m.late}</td>
        <td>${m.absent}</td>
        </tr>
        `;
    })
    $('#monthlyReportRows').html(rows);
}

function showDailyReport(reportRows, month) {
    let rows = "";
    $('#selectedMonth').text("Month " + currMonth)
    month = reportRows.filter(m => m.month == month)[0]
    if (month != undefined)
        month.days.forEach((d) => {
            rows += `
        <tr class="toggleCollapse">
        <td>${d.day}</td>
        <td>${formatAMPM(d.time)}</td>
        <td>${msToTime(d.lateTime)}</td>
        </tr>
        `;
        })
    $('#dailyReportRows').html(rows);
}

//handle switching months
$('#prevmonth').click(function () {
    currMonth--;
    if (currMonth == 0)
        currMonth = 12
    showDailyReport(monthly, currMonth)
})
$('#nextmonth').click(function () {
    currMonth++;
    if (currMonth == 13)
        currMonth = 1
    showDailyReport(monthly, currMonth)
})