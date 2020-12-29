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

            ///reload reports based on "per" switch
            $(function () {
                $('.displayperSwitch').change(function () {
                    let per = "curryear";
                    if ($(this).parent().hasClass('off')) ///if per month
                        per = "currmonth";
                    ///check for which report it was toggled
                    if ($(this).attr('id') == 'fullreportSwitch')
                        showFullReport(emps, per);
                    else if ($(this).attr('id') == 'latereportSwitch')
                        showLateReport(emps, per);
                    else
                        showAbsenceReport(emps, per);
                })
            })
            //showLateReport();
            //showRequests();
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


function showAllEmps(emps) {
    let rows = "",
        checked = "";
    //loop on emps only not admin or new 
    for (i in emps) {
        if (emps[i].admin == undefined && emps[i].new == undefined) {
            if (emps[i].subadmin != undefined) //if sub admin
                checked = "checked";
            rows += `
            <tr>
            <td class="toggleCollapse tdToggleCollapse" data-target="#allemps${i}">
            <p>${emps[i].fname+" "+emps[i].lname}</p>
            <div id="allemps${i}" class="collapse">
                <div class="card-body">
                    <label>Username:  </label><span> ${emps[i].username}</span><br>
                    <label>Email:  </label><span> ${emps[i].email}</span><br>
                    <label>Address:  </label><span> ${emps[i].address}</span><br>
                    <label>Age:  </label><span> ${emps[i].age}</span><br>
                    <label>Code:  </label><span> ${emps[i].code}</span><br>
                </div>
            </div>
            </td>
            <td class="selectsubadmin" empid="${i}" ><input name="subadmin" type="radio" ${checked} /></td>
            </tr>
            `;
        }
        checked = "";
    }
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

function showFullReport(emps, per = "curryear") {
    let rows = "";
    //loop on emps only not admin or new emp
    for (var i = 0; i < emps.length; i++) {
        if (emps[i].admin == undefined && emps[i].new == undefined) {
            let masterReport = {};
            let detailReport = [];
            let detailColHeads = "";

            if (per == "curryear") {
                detailReport = getMonthly(emps[i]);
                masterReport = getCurrYearReport(detailReport);
                detailColHeads = `<tr><th>Month</th><th>Attendance Times</th><th>Late Times</th><th>Absent Times</th></tr>`;
            } else { /// per current month
                detailReport = getDaily(emps[i]);
                masterReport = getCurrMonthReport(detailReport);
                detailColHeads = `<tr><th>Day</th><th>Time</th><th>Late Time</th></tr>`;
            }

            detailReportKeys = Object.keys(detailReport[0]);
            rows += `
            <tr class="toggleCollapse" data-target="#fullreport${i}">
            <td>
                ${emps[i].fname+" "+emps[i].lname}
            </td>
            <td>${masterReport.attended}</td>
            <td>${masterReport.late}</td>
            <td>${masterReport.absent}</td>
            </tr>
            <tr>
                <td colspan="4">
                <div id="fullreport${i}" class="collapse">
                    <table>
                        <thead>
                            ${detailColHeads}
                        </thead>
                        <tbody>`;

            for (j in detailReport) {
                if (per == "curryear")
                    rows += `
                            <tr>
                                <td>${detailReport[j][detailReportKeys[3]]}</td>
                                <td>${detailReport[j][detailReportKeys[0]]}</td>
                                <td>${detailReport[j][detailReportKeys[1]]}</td>
                                <td>${detailReport[j][detailReportKeys[2]]}</td>
                            </tr>`;
                else
                    rows += `
                            <tr>
                                <td>${detailReport[j][detailReportKeys[0]]}</td>
                                <td>${formatAMPM( detailReport[j][detailReportKeys[1]])}</td>
                                <td>${msToTime(detailReport[j][detailReportKeys[3]])}</td>
                            </tr>`;
            }
            rows += `
                        </tbody>
                    </table>
                </div>
                </td>
            </tr>`;

        }
    }

    $('#fullreportRows').html(rows);
}


function showLateReport(emps, per = "curryear") {
    let rows = "";
    //loop on emps only not admin or new emps
    for (var i = 0; i < emps.length; i++) {
        if (emps[i].admin == undefined && emps[i].new == undefined) {
            let masterReport = {};
            let detailReport = [];
            let detailColHeads = "";

            if (per == "curryear") {
                detailReport = getMonthly(emps[i]);
                masterReport = getCurrYearReport(detailReport);
                detailColHeads = `<tr><th>Month</th><th>Late Times</th></tr>`;
            } else { /// per current month
                detailReport = getDaily(emps[i]);
                masterReport = getCurrMonthReport(detailReport);
                detailColHeads = `<tr><th>Day</th><th>Time</th><th>Late Time</th></tr>`;
            }

            detailReportKeys = Object.keys(detailReport[0]);
            rows += `
            <tr class="toggleCollapse" data-target="#latereport${i}">
            <td>
                ${emps[i].fname+" "+emps[i].lname}
            </td>
            <td>${masterReport.late}</td>
            </tr>
            <tr>
                <td colspan="4">
                <div id="latereport${i}" class="collapse">
                    <table >
                        <thead>
                            ${detailColHeads}
                        </thead>
                        <tbody>`;

            for (j in detailReport) {
                if (per == "curryear")
                    rows += `
                            <tr>
                                <td>${detailReport[j][detailReportKeys[3]]}</td>
                                <td>${detailReport[j][detailReportKeys[1]]}</td>
                            </tr>`;
                else
                    rows += `
                            <tr>
                                <td>${detailReport[j][detailReportKeys[0]]}</td>
                                <td>${formatAMPM( detailReport[j][detailReportKeys[1]])}</td>
                                <td>${msToTime(detailReport[j][detailReportKeys[3]])}</td>
                            </tr>`;
            }
            rows += `
                        </tbody>
                    </table>
                </div>
                </td>
            </tr>`;

        }
    }

    $('#latereportRows').html(rows);
}


function showAbsenceReport(emps, per = "curryear") {
    let rows = "";
    //loop on emps only not admin or new
    for (var i = 0; i < emps.length; i++) {
        if (emps[i].admin == undefined && emps[i].new == undefined) {
            let masterReport = {};
            let detailReport = [];
            let detailColHeads = "";

            if (per == "curryear") {
                detailReport = getMonthly(emps[i]);
                masterReport = getCurrYearReport(detailReport);
                detailColHeads = `<tr><th>Month</th><th>Absent Times</th></tr>`;
            } else { /// per current month
                detailReport = getDaily(emps[i]);
                masterReport = getCurrMonthReport(detailReport);
                detailColHeads = `<tr><th>Day</th></tr>`;
            }

            detailReportKeys = Object.keys(detailReport[0]);
            rows += `
            <tr class="toggleCollapse" data-target="#absencereport${i}">
            <td>
                ${emps[i].fname+" "+emps[i].lname}
            </td>
            <td>${masterReport.absent}</td>
            </tr>
            <tr>
                <td colspan="4">
                <div id="absencereport${i}" class="collapse">
                    <table >
                        <thead>
                            ${detailColHeads}
                        </thead>
                        <tbody>`;

            for (j in detailReport) {
                if (per == "curryear")
                    rows += `
                            <tr>
                                <td>${detailReport[j][detailReportKeys[3]]}</td>
                                <td>${detailReport[j][detailReportKeys[2]]}</td>
                            </tr>`;
                else {
                    //check absent days
                    if (detailReport[j][detailReportKeys[1]] == 0)
                        rows += `
                    <tr>
                        <td>${detailReport[j][detailReportKeys[0]]}</td>
                    </tr>`;
                }

            }
            rows += `
                        </tbody>
                    </table>
                </div>
                </td>
            </tr>`;

        }
    }

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
            <tr>
            <td class="toggleCollapse tdToggleCollapse" data-target="#requests${i}">
            <p>${emps[i].fname+" "+emps[i].lname}</p>
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
    emps[i].code = makecode(10);
    //download data
    var _blob = new Blob([JSON.stringify(emps)], {
        type: "application/json"
    });
    let downloadLink = document.createElement('a');
    downloadLink.href = window.webkitURL.createObjectURL(_blob);
    downloadLink.setAttribute("download", "employees.json");
    downloadLink.click();
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