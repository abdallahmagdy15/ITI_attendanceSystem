let stDate = new Date('Jan 1, 2021 00:00:00'),
    enDate = new Date('Dec 31, 2021 23:59:59');

$(function () {
    $("#reportsTabs li a").click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });
})
//______________________
/// check if current user is system admin
fetch('../data/employees.json').then((emps) => emps.json())
    .then((Emps) => {
        if (getEmp(getEmp(Emps, sessionStorage.getItem('username')) == false || Emps, sessionStorage.getItem('username')).admin == undefined) {
            $('#attendanceForm').html('');
            showAlert('Violation of User Agreement', 'Your account has been banned due to violation of our policy!', 1);
            $('#alertmodal').on('hidden.bs.modal', function (e) {
                location.replace('../../index.html');
            });
        } else {
            //continue from here
            loadAdminPanel(Emps);
        }
    });
//_____________________

function loadAdminPanel(Emps) {

    //continue from here
    //create all reports (default)
    showAllEmps(Emps);
    showFullReport(Emps);
    showLateReport(Emps);
    showAbsenceReport(Emps);
    showRequests(Emps);

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
                showAllEmps(Emps, query)
                break;
            case 'fullreport':
                showFullReport(Emps, new Date(range[0]), new Date(range[1]), query)
                break;
            case 'latereport':
                showLateReport(Emps, new Date(range[0]), new Date(range[1]), query)

                break;
            case 'absencereport':
                showAbsenceReport(Emps, new Date(range[0]), new Date(range[1]), query)
                break;
        }
    });


    //handle sorting
    $('.sortable').click(function (e) {
        const sortby = $(this).attr('sort')
        $('.activeSortable').removeClass('activeSortable');
        $(this).addClass('activeSortable')
        if (sortby.split('-')[1] == 'asc') {
            $(this).attr('sort', sortby.split('-')[0] + '-' + 'desc')
            $(this).children().first().removeClass('fa-chevron-down').addClass('fa-chevron-up')
        }
        else {
            $(this).attr('sort', sortby.split('-')[0] + '-' + 'asc')
            $(this).children().first().removeClass('fa-chevron-up').addClass('fa-chevron-down')
        }
        const active = $('.nav-link.active').attr('href').slice(1)
        switch (active) {
            case 'allemps':
                showAllEmps(Emps, "", 0, sortby)
                break;
            case 'fullreport':
                showFullReport(Emps, stDate, enDate, "", 0, sortby)
                break;
            case 'latereport':
                showLateReport(Emps, stDate, enDate, "", 0, sortby)
                break;
            case 'absencereport':
                showAbsenceReport(Emps, stDate, enDate, "", 0, sortby)
                break;
            case 'requests':
                break;
        }
    })

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
                acceptRequest(Emps, $(this).parent().attr('empid')); //param has emp id in array emps
            else {
                rejectRequest(Emps, $(this).parent().attr('empid')); //param has emp id in array emps
                $(this).parent().parent().remove(); /// remove tr
            }
            //reload requests
            showRequests(Emps);
        });
    });

    //handle selecting new sub admin
    $(function () {
        $(document).on('click', 'td.selectsubadmin', e => {
            selectSubAdmin(e.target, parseInt($(e.target).attr('empid')), Emps);
        });
    });

}

function showAllEmps(employees, query = "", index = 0, sortby = 'name-asc') {
    let rows = "",
        checked = "", recordsStart = index * 10, recordsEnd = (index + 1) * 10, emps = [];
    //create a copy of emps for this function
    employees.forEach(e => emps.push(Object.assign({}, e)))

    //loop on emps only not admin or new 
    emps = emps.filter(e => e.admin == undefined
        && e.new == undefined
        && (e.fname.indexOf(query) != -1 || e.lname.indexOf(query) != -1));
    emps.sort(compareName(sortby));
    emps.slice(recordsStart, recordsEnd).forEach(emp => {
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

function showFullReport(employees, startDate = stDate,
    endDate = enDate, query = "", index = 0, sortby = "name-asc") {

    let rows = "", recordsStart = index * 10, recordsEnd = (index + 1) * 10, emps = [];
    //create a copy of emps for this function
    employees.forEach(e => emps.push(Object.assign({}, e)))
    //loop on emps only not admin or new emp .... according to query
    emps = emps.filter(e => e.admin == undefined
        && e.new == undefined
        && (e.fname.indexOf(query) != -1 || e.lname.indexOf(query) != -1))
        .sort(compareName(sortby))
        .slice(recordsStart, recordsEnd);
    emps.forEach(emp => {
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
        emp.yearReport = yearReport
        emp.monthsReport = monthsReport
    })
    emps.sort(compare(sortby))
        .forEach(emp => {
            rows += `
            <tr class="toggleCollapse" data-target="#fullreport${emp.id}">
            <td>
                ${emp.fname + " " + emp.lname}
            </td>
            <td>${emp.yearReport.attend}</td>
            <td>${emp.yearReport.late}</td>
            <td>${emp.yearReport.absent}</td>
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
            emp.monthsReport.forEach((m) => {
                rows += `
                <tr class="toggleCollapse" data-target="#dailylatereport${emp.id}">
                    <td>${m.month}</td>
                    <td>${m.attend}</td>
                    <td>${m.late}</td>
                    <td>${m.absent}</td>
                </tr>
                <tr>
                    <td colspan="4" id="dailylatereport${emp.id}">
                        <table>
                            <thead>
                                <tr>
                                    <th>Day</th>
                                    <th>Attendance Time</th>
                                    <th>Late Time</th>
                                </tr>
                            </thead>
                            <tbody>`;

                m.days.forEach(d => {
                    rows += `<tr>
                                <td>${d.day}</td>
                                <td>${formatAMPM(d.time)}</td>
                                <td>${formatAMPM(d.lateTime)}</td>
                            </tr>`;
                })
                rows += `</tbody>
                        </table>
                    </td>
                </tr>
                `;
            })
            rows += '</tbody></table></td></tr>';

        })
    $('#fullreportRows').html(rows);
}


function showLateReport(employees, startDate = stDate,
    endDate = enDate, query = "", index = 0, sortby = "name-asc") {
    let rows = "", recordsStart = index * 10, recordsEnd = (index + 1) * 10, emps = [];
    //create a copy of emps for this function
    employees.forEach(e => emps.push(Object.assign({}, e)))
    //loop on emps only not admin or new emp .... according to query
    emps = emps.filter(e => e.admin == undefined
        && e.new == undefined
        && (e.fname.indexOf(query) != -1 || e.lname.indexOf(query) != -1))
        .sort(compareName(sortby))
        .slice(recordsStart, recordsEnd);

    emps.forEach(emp => {
        let yearReport = {
            late: 0,
        };
        let monthsReport = [];

        monthsReport = getMonthly(emp.attendance, startDate, endDate)
        monthsReport.forEach((m) => {
            yearReport.late += m.late;
        })
        emp.yearReport = yearReport
        emp.monthsReport = monthsReport
    })
    emps.sort(compare(sortby))
        .forEach(emp => {
            rows += `
            <tr class="toggleCollapse" data-target="#latereport${emp.id}">
            <td>
                ${emp.fname + " " + emp.lname}
            </td>
            <td>${emp.yearReport.late}</td>
            </tr>
            <tr>
                <td colspan="4" id="latereport${emp.id}" class="collapse">
                    <table>
                        <thead>
                            <th>Month</th>
                            <th>Late Times</th>
                        </thead>
                        <tbody>`;
            emp.monthsReport.forEach((m) => {
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


function showAbsenceReport(employees, startDate = stDate,
    endDate = enDate, query = "", index = 0, sortby = "name-asc") {
    let rows = "", recordsStart = index * 10, recordsEnd = (index + 1) * 10, emps = [];
    //create a copy of emps for this function
    employees.forEach(e => emps.push(Object.assign({}, e)));
    //loop on emps only not admin or new emp .... according to query
    emps = emps.filter(e => e.admin == undefined
        && e.new == undefined
        && (e.fname.indexOf(query) != -1 || e.lname.indexOf(query) != -1))
        .sort(compareName(sortby))
        .slice(recordsStart, recordsEnd);
    emps.forEach(emp => {
        let yearReport = {
            absent: 0,
        };
        let monthsReport = [];

        monthsReport = getMonthly(emp.attendance, startDate, endDate)
        monthsReport.forEach((m) => {
            yearReport.absent += m.absent;
        })
        emp.yearReport = yearReport
        emp.monthsReport = monthsReport
    })
    emps.sort(compare(sortby))
        .forEach(emp => {
            rows += `
            <tr class="toggleCollapse" data-target="#absentreport${emp.id}">
            <td>
                ${emp.fname + " " + emp.lname}
            </td>
            <td>${emp.yearReport.absent}</td>
            </tr>
            <tr>
                <td colspan="4" id="absentreport${emp.id}" class="collapse">
                    <table>
                        <thead>
                            <th>Month</th>
                            <th>Absence Times</th>
                        </thead>
                        <tbody>`;
            emp.monthsReport.forEach((m) => {
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

function showRequests(employees) {
    let rows = "",
        requests = 0, emps = [];
    //create a copy of emps for this function
    employees.forEach(e => emps.push(Object.assign({}, e)));
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
$(".daterangepicker-field").daterangepicker({
    forceUpdate: true,
    maxDate: '2021-12-31',
    minDate: '2021-01-01',
    callback: function (startDate, endDate, period) {
        var title = startDate.format('L') + ' – ' + endDate.format('L');
        $(this).val(title)
    }
});

function compareName(sortby) {
    sortby = sortby.split('-');
    if (sortby[0] == 'name') {
        if (sortby[1] == 'asc')
            return function (a, b) {
                if (a.fname > b.fname)
                    return 1
                else if (a.fname < b.fname)
                    return -1
                return 0
            }
        else
            return function (a, b) {
                if (a.fname < b.fname)
                    return 1
                else if (a.fname > b.fname)
                    return -1
                return 0
            }
    }

    return undefined
}

function compare(sortby) {
    sortby = sortby.split('-');
    switch (sortby[0]) {
        case 'attend':
            if (sortby[1] == 'asc')
                return function (a, b) {
                    if (a.yearReport.attend > b.yearReport.attend)
                        return 1
                    else if (a.yearReport.attend < b.yearReport.attend)
                        return -1

                    return 0
                }
            else
                return function (a, b) {
                    if (a.yearReport.attend < b.yearReport.attend)
                        return 1
                    else if (a.yearReport.attend > b.yearReport.attend)
                        return -1

                    return 0
                }
        case 'late':
            if (sortby[1] == 'asc')
                return function (a, b) {
                    if (a.yearReport.late > b.yearReport.late)
                        return 1
                    else if (a.yearReport.late < b.yearReport.late)
                        return -1

                    return 0
                }
            else
                return function (a, b) {
                    if (a.yearReport.late < b.yearReport.late)
                        return 1
                    else if (a.yearReport.late > b.yearReport.late)
                        return -1

                    return 0
                }
        case 'absent':
            if (sortby[1] == 'asc')
                return function (a, b) {
                    if (a.yearReport.absent > b.yearReport.absent)
                        return 1
                    else if (a.yearReport.absent < b.yearReport.absent)
                        return -1

                    return 0
                }
            else
                return function (a, b) {
                    if (a.yearReport.absent < b.yearReport.absent)
                        return 1
                    else if (a.yearReport.absent > b.yearReport.absent)
                        return -1

                    return 0
                }
    }
    return undefined

}