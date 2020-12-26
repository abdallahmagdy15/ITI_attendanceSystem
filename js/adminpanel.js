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
        //create all reports
        showAllEmps(emps);
        showFullReport(emps);
        //showLateReport();
        //showRequests();
        //make tr clickable for showing details for master
        $(function () {
            $(".toggleCollapse[data-target]").click(function (e) {
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
            <td>
            <p class="toggleCollapse" data-target="#empDetails${i}">${emps[i].fname+" "+emps[i].lname}</p>
            <div id="empDetails${i}" class="collapse">
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
            if (per == "curryear") {
                detailReport = getMonthly(emps[i]);
                masterReport = getCurrYearReport(detailReport);
            } else { /// per current month
                detailReport = getDaily(emps[i]);
                masterReport = getCurrMonthReport(detailReport);
            }

            detailReportKeys = Object.keys(detailReport[0]);
            rows += `
            <tr class="toggleCollapse" data-target="#details${i}">
            <td>
                ${emps[i].fname+" "+emps[i].lname}
            </td>
            <td>${masterReport.attended}</td>
            <td>${masterReport.late}</td>
            <td>${masterReport.absent}</td>
            </tr>
            <tr>
                <td colspan="4">
                <div id="details${i}" class="collapse">
                    <table width="100%">
                        <thead>
                            <tr><th>${detailReportKeys[3]}</th><th>${detailReportKeys[0]}</th><th>${detailReportKeys[1]}</th><th>${detailReportKeys[2]}</th></tr>
                        </thead>
                        <tbody>`;

            for (j in detailReport) {
                rows += `
                            <tr>
                                <td>${detailReport[j][detailReportKeys[3]]}</td>
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