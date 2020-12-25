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
    //get emp obj by username
    let empMonthObj;
    try{
    empMonthObj = emps.filter(e => e.username === record.username)[0]
         .attendance.filter(a => a.month === record.time.getMonth())[0];
    }
    catch{
        console.log("this employee has no attendance records!");
        return;
    }
    
    empMonthObj.days.push({
        day:record.time.getDay(),
        attended:"true",
        time:record.time
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