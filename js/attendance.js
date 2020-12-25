/// check if current user is sub admin
fetch('../data/employees.json').then((emps) => emps.json())
    .then((emps) => {
        if (getEmp(emps, sessionStorage.getItem('username')).subadmin == undefined) {
            $('#attendanceForm').html('');
            showAlert('Violation of User Agreement', 'Your account has been banned due to violation of our policy!', 1);
            $('#alertmodal').on('hidden.bs.modal', function (e) {
                location.replace('../../index.html');
            });
        }
    });

$('#attendanceForm').submit(function (e) {
    let record = {};
    //get form data as object
    $.each($(this).serializeArray(), function (i, kv) {
        record[kv.name] = kv.value;
    });
    record.time = (new Date()).toString();
    //get all attendance data
    fetch('../data/Attendance.json').then((attRecords) => attRecords.json())
        .then(attRecords => {
            confirmAttendance(record, attRecords);
        })
        .catch(attRecords => {
            console.log("failed to load attendance json file");
        });
    return false;
});

function confirmAttendance(record, attRecords) {
    attRecords.push(record);
    //download data
    var _blob = new Blob([JSON.stringify(attRecords)], {
        type: "application/json"
    });
    let downloadLink = document.createElement('a');
    downloadLink.href = window.webkitURL.createObjectURL(_blob);
    downloadLink.setAttribute("download", "attendance.json");
    downloadLink.click();

    //get emps data to load emp name
    fetch('../data/employees.json').then((emps) => emps.json())
        .then(emps => {
            let emp = getEmp(emps, record.username);
            if (emp != false)
                showAlert('Attendance Confirmed',
                    `<p><label>Name: </label> ${emp.fname + " " + emp.lname}</p>
        <p><label>Time: </label> ${record.time}</p>`, 1);
        })
        .catch(emps => {
            console.log("failed to load employees json file");
        });
}