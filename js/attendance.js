/// check if current user is sub admin
fetch('../data/employees.json').then((emps) => emps.json())
    .then((emps) => {
        if (getEmp(emps, sessionStorage.getItem('username')).subadmin == undefined) {
            $('#attendanceForm').html('');
            showAlert('Violation of User Agreement', 'Your account has been banned due to violation of our policy!', 1);
            $('#alertmodal').on('hidden.bs.modal', function (e) {
                location.replace('../../index.html');
            });
        } else {
            formSubmitHandler(emps);
        }
    });

function formSubmitHandler(emps) {
    $('#attendanceForm').submit(function (e) {
        let record = {};
        //get form data as object
        $.each($(this).serializeArray(), function (i, kv) {
            record[kv.name] = kv.value;
        });
        record.time = new Date();
        confirmAttendance(record, emps);
        return false;
    });
}

function confirmAttendance(record, emps) {
    //get emp obj by code
    let empMonthObj;
    try {
        empMonthObj = emps.filter(e => e.code === record.code)[0]
            .attendance.filter(a => a.month === record.time.getMonth())[0];
    } catch {
        console.log("this employee has no attendance records!");
        return;
    }
    let time = new Date(dayObj.time);
    let ruleTime = (new Date(dayObj.time)).setHours(9, 0, 0);
    let late = late = ((new Date(dayObj.time)).getTime() > (new Date(dayObj.time)).setHours(9, 0, 0)) ? 1 : 0;
    empMonthObj.days.push({
        day: record.time.getDate(),
        attended: "true",
        time: record.time,
        lateTime: calcLatency(time, ruleTime)
    });

    //download data
    var _blob = new Blob([JSON.stringify(emps)], {
        type: "application/json"
    });
    let downloadLink = document.createElement('a');
    downloadLink.href = window.webkitURL.createObjectURL(_blob);
    downloadLink.setAttribute("download", "employees.json");
    downloadLink.click();

    //get emps data to load emp name
    fetch('../data/employees.json').then((emps) => emps.json())
        .then(emps => {
            let emp = getEmp(emps, record.username);
            if (emp != false)
                showAlert('Attendance Confirmed',
                    `<p><label>Name: </label> ${emp.fname + " " + emp.lname}</p>
        <p><label>Time: </label> ${formatAMPM(record.time)}</p>`, 1);
        })
        .catch(emps => {
            console.log("failed to load employees json file");
        });
}

function calcLatency(time, ruleTime) {
    if (time > ruleTime)
        return Math.abs(time.getTime() - ruleTime.getTime())
    else // not late
        return 0;
}