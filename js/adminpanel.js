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
        if (getEmp(emps, sessionStorage.getItem('username')).admin == undefined) {
            $('#attendanceForm').html('');
            showAlert('Violation of User Agreement', 'Your account has been banned due to violation of our policy!', 1);
            $('#alertmodal').on('hidden.bs.modal', function (e) {
                location.replace('../../index.html');
            });
        } else {
            //continue from here
        }
    });
//_____________________

//load all emps
fetch('../data/employees.json').then((emps) => emps.json())
    .then(emps => {
        //continue from here
        //create all reports (default)
        showAllEmps(emps);
        showFullReport(emps);
        showLateReport(emps);
        showAbsenceReport(emps);

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
            $("tbody.reportTBody").on('click','tr,td.tdToggleCollapse',function (e) {
                e.preventDefault();
                let collapseId = $(this).attr('data-target');
                $(collapseId).toggle('show');
            });
        });
    })
    .catch(emps => {
        console.log("failed to load employees json file");
    });

function showAllEmps(emps) {
    let rows = "";
    //loop on emps only not admin
    for (i in emps) {
        if (emps[i].admin == undefined) {
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
                </div>
            </div>
            </td>
            <td><input name="subadmin" type="radio"/></td>
            </tr>
            `;
        }
    }
    $('#allempsRows').html(rows);
}

function showFullReport(emps, per = "curryear") {
    let rows = "";
    //loop on emps only not admin or subadmin
    for (var i = 0; i < emps.length; i++) {
        if (emps[i].admin == undefined && emps[i].subadmin == undefined) {
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
                    <table width="100%">
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
                                <td>${detailReport[j][detailReportKeys[1]]}</td>
                                <td>${detailReport[j][detailReportKeys[2]]}</td>
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
    //loop on emps only not admin or subadmin
    for (var i = 0; i < emps.length; i++) {
        if (emps[i].admin == undefined && emps[i].subadmin == undefined) {
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
                    <table width="100%">
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
                                <td>${detailReport[j][detailReportKeys[1]]}</td>
                                <td>${detailReport[j][detailReportKeys[2]]}</td>
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
    //loop on emps only not admin or subadmin
    for (var i = 0; i < emps.length; i++) {
        if (emps[i].admin == undefined && emps[i].subadmin == undefined) {
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
                    <table width="100%">
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
                else
                    rows += `
                            <tr>
                                <td>${detailReport[j][detailReportKeys[0]]}</td>
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

    $('#absencereportRows').html(rows);
}