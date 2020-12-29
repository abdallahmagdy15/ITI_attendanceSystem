function logout() {
    sessionStorage.clear();
}

function createUserSession(emp) {
    sessionStorage.setItem('username', emp.username);
}

function getEmp(emps, username) {
    for (i in emps) {
        if (username == emps[i].username)
            return emps[i];
    }
    return false
}

function showAlert(title, content, buttons) {
    let modal = $('#alertmodal');
    // Update the modal's content.
    let modalTitle = $('.modal-title');
    let modalBody = $('.modal-body');
    let modalFooter = $('.modal-footer');

    modalTitle.text(title);
    modalBody.html(content);
    switch (buttons) {
        case 1:
            modalFooter.html('<button type="button" class="btn" data-bs-dismiss="modal">Close</button>');
            break;
        case 2:
            modalFooter.html('<button type="button" class="btn" data-bs-dismiss="modal">Cancel</button><button type="button" class="btn filled">Ok</button>');
            break;
    }

    modal.modal('show');
}

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}


function getCurrYearReport(monthlyReport) {
    let currYearReport = {
        attended: 0,
        late: 0,
        absent: 0
    };
    for (i in monthlyReport) {
        currYearReport.attended += monthlyReport[i].attend;
        currYearReport.late += monthlyReport[i].late;
        currYearReport.absent += monthlyReport[i].absent;
    }
    return currYearReport;
}

function getCurrMonthReport(dailyReport) {
    let currMonthReport = {
        attended: 0,
        late: 0,
        absent: 0
    };
    for (i in dailyReport) {
        if (dailyReport[i].time == 0)
            currMonthReport.absent++;
        else
            currMonthReport.attended++;
        currMonthReport.late += dailyReport[i].late;
    }
    return currMonthReport;
}

function getMonthly(emp) {
    let months = emp.attendance;
    let monthlyReport = [];
    let now = new Date();
    var atten = 0,
        late = 0,
        absent = 0;

    for (i in months) {
        for (j in months[i].days) {
            day = months[i].days[j];
            atten += (day.attended) ? 1 : 0;
            late += (day.lateTime > 0)?1:0;
        }
        if (now.getMonth() > months[i].month)
            absent = 30 - atten;
        else if (now.getMonth() == months[i].month)
            absent = now.getDate() - atten;
        else
            break;
        monthlyReport.push({
            attend: atten,
            late: late,
            absent: absent,
            month: months[i].month,
        });
        atten = 0, late = 0, absent = 0;
    }
    return monthlyReport;
}

function getDaily(emp) {

    let currMonth = emp.attendance.filter(m => m.month == (new Date()).getMonth())[0];
    let dailyReport = [];
    let i = 0;
    if (currMonth.days.length == 0) ///check days array for cuur month is empty or not
        for (var j = 1; j <= (new Date()).getDate(); j++) { // push empty days 
            dailyReport.push({
                day: j,
                time: 0,
                late: 0,
                lateTime: 0
            });
        }
    else
        for (var j = 1; j <= (new Date()).getDate(); j++) {
            dayObj = currMonth.days[i];
            if (dayObj.day == j) {
                dailyReport.push({
                    day: j,
                    time: dayObj.time,
                    late: (dayObj.lateTime == 0) ? 1 : 0,
                    lateTime: dayObj.lateTime
                });
                if (i < currMonth.days.length - 1) /// stop looping for days array
                    i++;
            } else
                dailyReport.push({
                    day: j,
                    time: 0,
                    late: 0,
                    lateTime: 0
                });
        }
    return dailyReport;
}