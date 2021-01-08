$(function () {
    $("#reportsTabs li a").click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });
})
//______________________
/// check if current user is system admin
fetch('../data/employees.json').then((emps) => emps.json())
    .then((emps) => {
        if (getEmp(getEmp(emps, sessionStorage.getItem('username')) == false || emps, sessionStorage.getItem('username')).admin == undefined) {
            $('#attendanceForm').html('');
            showAlert('Violation of User Agreement', 'Your account has been banned due to violation of our policy!', 1);
            $('#alertmodal').on('hidden.bs.modal', function (e) {
                location.replace('../../index.html');
            });
        } else {
            //continue from here
            loadAdminPanel();
        }
    });
//_____________________

function loadAdminPanel() {
    //load all emps
    fetch('../data/employees.json').then((emps) => emps.json())
        .then(emps => {
            //continue from here
            //create all reports (default)
            showAllEmps(emps);
            showFullReport(emps);
            showLateReport(emps);
            showAbsenceReport(emps);
            showRequests(emps);

            //handle search 
            $('#searchform').submit((e) => {
                e.preventDefault();
                let range = $(e.target).serializeArray()[0].value;
                if (range == '')
                    range = '01/01/2021 – 12/31/2021';
                range = range.split(' – ');
                const query = $(e.target).serializeArray()[1].value;
                const active = $('.nav-link.active').attr('href').slice(1)
                switch (active) {
                    case 'allemps':
                        showAllEmps(emps, query)
                        break;
                    case 'fullreport':
                        showFullReport(emps, new Date(range[0]), new Date(range[1]), query)
                        break;
                    case 'latereport':
                        showLateReport(emps, new Date(range[0]), new Date(range[1]), query)

                        break;
                    case 'absencereport':
                        showAbsenceReport(emps, new Date(range[0]), new Date(range[1]), query)
                        break;
                }
            });

            //make tr clickable for showing details for master
            $(function () {
                $("tbody.reportTBody").on('click', 'tr,td.tdToggleCollapse', function (e) {
                    e.preventDefault();
                    let collapseId = $(this).attr('data-target');
                    $(collapseId).toggle('show');
                });
            });

            ///handle request 
            $(function () {
                $("td").on('click', 'button.request', function (e) {
                    e.preventDefault();
                    if ($(this).hasClass('acceptRequest'))
                        acceptRequest(emps, $(this).parent().attr('empid')); //param has emp id in array emps
                    else {
                        rejectRequest(emps, $(this).parent().attr('empid')); //param has emp id in array emps
                        $(this).parent().parent().remove(); /// remove tr
                    }
                    //reload requests
                    showRequests(emps);
                });
            });

            //handle selecting new sub admin
            $(function () {
                $(document).on('click', 'td.selectsubadmin', e => {
                    selectSubAdmin(e.target, parseInt($(e.target).attr('empid')), emps);
                });
            });
        })
        .catch(emps => {
            console.log("failed to load employees json file");
        });
}


function showAllEmps(emps, query = "") {
    let rows = "",
        checked = "";
    //loop on emps only not admin or new 
    emps.filter(e => e.admin == undefined
        && e.new == undefined
        && (e.fname.indexOf(query) != -1 || e.lname.indexOf(query) != -1))
        .forEach(emp => {
            if (emp.subadmin != undefined) //if sub admin
                checked = "checked";
            rows += `
            <tr class="noCollapse">
            <td class="toggleCollapse tdToggleCollapse" data-target="#allemps${emp.id}">
            <p>${emp.fname + " " + emp.lname}</p>
            <div id="allemps${emp.id}" class="collapse">
                <div class="card-body">
                    <label>Username:  </label><span> ${emp.username}</span><br>
                    <label>Email:  </label><span> ${emp.email}</span><br>
                    <label>Address:  </label><span> ${emp.address}</span><br>
                    <label>Age:  </label><span> ${emp.age}</span><br>
                    <label>Code:  </label><span> ${emp.code}</span><br>
                </div>
            </div>
            </td>
            <td class="selectsubadmin" empid="${emp.id}" ><input name="subadmin" type="radio" ${checked} /></td>
            </tr>
            `;
            checked = "";
        })
    $('#allempsRows').html(rows);
}

function selectSubAdmin(el, i, empsArray) {

    if ($(el).first().attr('checked') == undefined) {
        //delete subadmin from last sub admin
        for (e in empsArray) {
            if (empsArray[e].subadmin != undefined) {
                delete empsArray[e].subadmin;
                break;
            }
        }
        // remove checked from last sub admin
        $('.selectsubadmin input[checked]').first().removeAttr('checked');

        //check this emp as sub admin
        $(el).children('input').first().attr('checked', '');

        // add subadmin property to selected emp
        empsArray[i].subadmin = "";
        //download data
        var _blob = new Blob([JSON.stringify(empsArray)], {
            type: "application/json"
        });
        let downloadLink = document.createElement('a');
        downloadLink.href = window.webkitURL.createObjectURL(_blob);
        downloadLink.setAttribute("download", "employees.json");
        downloadLink.click();
    }
}

function showFullReport(emps, startDate = new Date('Jan 1, 2021 00:00:00'),
    endDate = new Date('Dec 31, 2021 23:59:59'), query = "") {

    let rows = "";
    //loop on emps only not admin or new emp .... according to query
    emps.filter(e => e.admin == undefined
        && e.new == undefined
        && (e.fname.indexOf(query) != -1 || e.lname.indexOf(query) != -1))
        .forEach(emp => {
            let yearReport = {
                attend: 0,
                late: 0,
                absent: 0
            };
            let monthsReport = [];

            monthsReport = getMonthly(emp.attendance, startDate, endDate)
            monthsReport.forEach((m) => {
                yearReport.attend += m.attend;
                yearReport.late += m.late;
                yearReport.absent += m.absent;
            })
            rows += `
            <tr class="toggleCollapse" data-target="#fullreport${emp.id}">
            <td>
                ${emp.fname + " " + emp.lname}
            </td>
            <td>${yearReport.attend}</td>
            <td>${yearReport.late}</td>
            <td>${yearReport.absent}</td>
            </tr>
            <tr>
                <td colspan="4" id="fullreport${emp.id}" class="collapse">
                    <table>
                        <thead>
                            <th>Month</th>
                            <th>Attendance Times</th>
                            <th>Late Times</th>
                            <th>Absence Times</th>
                        </thead>
                        <tbody>`;
            monthsReport.forEach((m) => {
                rows += `
                <tr class="toggleCollapse" data-target="#dailylatereport${emp.id}">
                    <td>${m.month}</td>
                    <td>${m.attend}</td>
                    <td>${m.late}</td>
                    <td>${m.absent}</td>
                </tr>
                `;
            })
            rows += '</tbody></table></td></tr>';

        })
    $('#fullreportRows').html(rows);
}


function showLateReport(emps, startDate = new Date('Jan 1, 2021 00:00:00'),
    endDate = new Date('Dec 31, 2021 23:59:59'), query = "") {
    let rows = "";
    //loop on emps only not admin or new emp .... according to query
    emps.filter(e => e.admin == undefined
        && e.new == undefined
        && (e.fname.indexOf(query) != -1 || e.lname.indexOf(query) != -1))
        .forEach(emp => {
            let yearReport = {
                late: 0,
            };
            let monthsReport = [];

            monthsReport = getMonthly(emp.attendance, startDate, endDate)
            monthsReport.forEach((m) => {
                yearReport.late += m.late;
            })
            rows += `
            <tr class="toggleCollapse" data-target="#latereport${emp.id}">
            <td>
                ${emp.fname + " " + emp.lname}
            </td>
            <td>${yearReport.late}</td>
            </tr>
            <tr>
                <td colspan="4" id="latereport${emp.id}" class="collapse">
                    <table>
                        <thead>
                            <th>Month</th>
                            <th>Late Times</th>
                        </thead>
                        <tbody>`;
            monthsReport.forEach((m) => {
                rows += `
                <tr class="toggleCollapse" data-target="#dailylatereport${emp.id}">
                    <td>${m.month}</td>
                    <td>${m.late}</td>
                </tr>
                `;
            })
            rows += '</tbody></table></td></tr>';

        })
    $('#latereportRows').html(rows);
}


function showAbsenceReport(emps, startDate = new Date('Jan 1, 2021 00:00:00'),
    endDate = new Date('Dec 31, 2021 23:59:59'), query = "") {
    let rows = "";
    //loop on emps only not admin or new emp .... according to query
    emps.filter(e => e.admin == undefined
        && e.new == undefined
        && (e.fname.indexOf(query) != -1 || e.lname.indexOf(query) != -1))
        .forEach(emp => {
            let yearReport = {
                absent: 0,
            };
            let monthsReport = [];

            monthsReport = getMonthly(emp.attendance, startDate, endDate)
            monthsReport.forEach((m) => {
                yearReport.absent += m.absent;
            })
            rows += `
            <tr class="toggleCollapse" data-target="#absentreport${emp.id}">
            <td>
                ${emp.fname + " " + emp.lname}
            </td>
            <td>${yearReport.absent}</td>
            </tr>
            <tr>
                <td colspan="4" id="absentreport${emp.id}" class="collapse">
                    <table>
                        <thead>
                            <th>Month</th>
                            <th>Absence Times</th>
                        </thead>
                        <tbody>`;
            monthsReport.forEach((m) => {
                rows += `
                <tr class="toggleCollapse" data-target="#dailyabsentreport${emp.id}">
                    <td>${m.month}</td>
                    <td>${m.absent}</td>
                </tr>
                `;
            })
            rows += '</tbody></table></td></tr>';
        })
    $('#absencereportRows').html(rows);
}

function showRequests(emps) {
    let rows = "",
        requests = 0;
    //loop on emps only not admin
    for (i in emps) {
        if (emps[i].new != undefined) { /// if emp has new 
            requests++;
            rows += `
            <tr class="noCollapse">
            <td class="toggleCollapse tdToggleCollapse" data-target="#requests${i}">
            <p>${emps[i].fname + " " + emps[i].lname}</p>
            <div id="requests${i}" class="collapse">
                <div class="card-body">
                    <label>Username:  </label><span> ${emps[i].username}</span><br>
                    <label>Email:  </label><span> ${emps[i].email}</span><br>
                    <label>Address:  </label><span> ${emps[i].address}</span><br>
                    <label>Age:  </label><span> ${emps[i].age}</span><br>
                </div>
            </div>
            </td>
            <td empid="${i}">
            <button class="acceptRequest request btn filled">Accept</button>
            <button class="rejectRequest request btn">Reject</button>
            </td>
            </tr>
            `;
        }
    }
    $('#requestsRows').html(rows);
    $('#reqNotifis').text(requests);
}

function acceptRequest(emps, i) {
    delete emps[i].new;
    emps[i].code = makecode(8);
    //download data
    var _blob = new Blob([JSON.stringify(emps)], {
        type: "application/json"
    });
    let downloadLink = document.createElement('a');
    downloadLink.href = window.webkitURL.createObjectURL(_blob);
    downloadLink.setAttribute("download", "employees.json");
    downloadLink.click();
    downloadLink.href = 'mailto:' + emps[i].email +
        "?subject=New Employee Registration&body=Registration request has been approved by the admin!\nPlease follow the link below to login to your account\n" + "http://localhost:5500/login_page.html";
    downloadLink.setAttribute("download", "false");
    downloadLink.click();
    showAlert('Registration Status', 'Registration confirmation email has been sent to the new employee!', 1);
}

function rejectRequest(emps, i) {
    emps[i].splice(i, 1);
    //download data
    var _blob = new Blob([JSON.stringify(emps)], {
        type: "application/json"
    });
    let downloadLink = document.createElement('a');
    downloadLink.href = window.webkitURL.createObjectURL(_blob);
    downloadLink.setAttribute("download", "employees.json");
    downloadLink.click();
    downloadLink.href = 'mailto:' + emps[i].email +
        "?subject=New Employee Registration&body=Sorry to tell you that your registration request has been rejected by the admin!\nPlease follow the link below for more information\n" + "http://localhost:5500";
    downloadLink.setAttribute("download", "false");
    downloadLink.click();
    showAlert('Registration Status', 'Registration confirmation email has been sent to the new employee!', 1);
}

function makecode(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
