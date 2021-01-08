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
            attendAutoComplete(emps);
            formSubmitHandler(emps);
        }
    });

let selectedEmps = [];

function formSubmitHandler(emps) {
    $('#attendanceForm').submit(function (e) {
        confirmAttendance(emps);
        return false;
    });
}

function confirmAttendance(emps) {
    for (i in selectedEmps) {
        //get emp obj by code
        let empMonthObj;
        try {
            empMonthObj = emps.filter(e => e.code === selectedEmps[i].code)[0]
                .attendance.filter(a => a.month === selectedEmps[i].time.getMonth() + 1)[0];
        } catch {
            showAlert(selectedEmps[i].name + ', Code is not correct', 'Please enter the correct one!', 1);
            selectedEmps[i].notFound = "";
        }
        let time = (new Date(selectedEmps[i].time)).getTime();
        let ruleTime = (new Date(selectedEmps[i].time)).setHours(9, 0, 0);
        //update month obj
        let lateTime = calcLatency(time, ruleTime)
        empMonthObj.days.push({
            day: selectedEmps[i].time.getDate(),
            time: selectedEmps[i].time,
            lateTime: calcLatency(time, ruleTime)
        });
    }

    let confirmMsg = '';
    for (i in selectedEmps) {
        if (selectedEmps[i].notFound != undefined)
            continue;
        confirmMsg += `<p><label>Name: </label> ${selectedEmps[i].name}</p>
        <p><label>Time: </label> ${formatAMPM(selectedEmps[i].time)}</p><hr>`;
    }

    if (confirmMsg != '') {
        //download updated data
        var _blob = new Blob([JSON.stringify(emps)], {
            type: "application/json"
        });
        let downloadLink = document.createElement('a');
        downloadLink.href = window.webkitURL.createObjectURL(_blob);
        downloadLink.setAttribute("download", "employees.json");
        downloadLink.click();

        showAlert('Attendance Confirmed', confirmMsg, 1);
    }
}

function calcLatency(time, ruleTime) {
    if (time > ruleTime)
        return Math.abs(time - ruleTime)
    else // not late
        return 0;
}

function attendAutoComplete(emps) {
    emps = emps.filter(e => e.admin == undefined && e.new == undefined)
    let empsCode = emps.map(emp => {
        return {
            label: emp.fname + " " + emp.lname,
            value: emp.code
        }
    });

    $("#code").autocomplete({
        source: empsCode,
        select: function (event, ui) {
            selectedEmps.push({
                code: ui.item.value,
                time: new Date(),
                name: ui.item.label
            });
            $('#selectedEmps').append(`<li class="list-group-item selected-emp" code="${ui.item.value}" >${ui.item.label}
            <span class="delItemBtn">X</span></li>`);
        }
    })

    $('#selectedEmps').on('click', 'li.selected-emp', function (e) {
        e.preventDefault();
        let code = $(this).attr('code')
        selectedEmps = selectedEmps.filter(emp => emp.code != code);
        $(this).remove()
        $("#code").val("")
    })
}