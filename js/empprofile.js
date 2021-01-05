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
    showMonthlyReport(getMonthly(emp));
    showDailyReport(getDaily(emp));
    showChart(getMonthly(emp));
}

function showChart(monthly) {
    var ctx = $('#chart');
    var datasets = [];
    for (i in monthly)
        datasets.push(monthly[i].attend);
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
    for (i in reportRows) {
        rows += `
        <tr class="toggleCollapse">
        <td>${reportRows[i].month}</td>
        <td>${(reportRows[i].attend == 0) ? "__" : reportRows[i].attend}</td>
        <td>${(reportRows[i].late == 0) ? "__" : reportRows[i].late}</td>
        <td>${(reportRows[i].absent == 0) ? "__" : reportRows[i].absent}</td>
        </tr>
        `;
    }
    $('#monthlyReportRows').html(rows);
}

function showDailyReport(reportRows) {
    let rows = "";
    for (i in reportRows) {
        rows += `
        <tr class="toggleCollapse">
        <td>${reportRows[i].day}</td>
        <td>${formatAMPM(reportRows[i].time)}</td>
        <td>${msToTime(reportRows[i].lateTime)}</td>
        </tr>
        `;
    }
    $('#dailyReportRows').html(rows);
}

$(".daterangepicker-field").daterangepicker({
    forceUpdate: true,
    callback: function (startDate, endDate, period) {
        var title = startDate.format('L') + ' – ' + endDate.format('L');
        $(this).val(title)
    }
});