function logout() {
    sessionStorage.clear();
}

function createUserSession(emp) {
    sessionStorage.setItem('username', emp.username);
}

function getEmp(emps, id) { /// username or code
    for (i in emps) {
        //check if has code
        let code = "";
        if (emps[i].code != undefined)
            code = emps[i].code;
        // get emp by code or username
        if (id == emps[i].username || id == code)
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
    if (date == 0)
        return "__";
    date = new Date(date);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function getMonthly(months, start = 1, end = 12) {
    return months.filter(m => m.month >= start && m.month <= end).forEach((m) {
        let curr = (new Date()).getMonth() + 1
        if (curr == m.month) // its the current month
            m.absent = (new Date()).getDate() - m.attend
        else if (m.month < curr) // if prev months
            m.absent = 30 - m.attend
        else // if coming months
            m.absent = 0
    });

    // //___________________________________
    // let monthlyReport = [];
    // let now = new Date();
    // var atten = 0,
    //     late = 0,
    //     absent = 0;
    // //get months according to range
    // months = months.filter(m => m.month >= start && m.month <= end)

    // //___________________
    // let months = emp.attendance;
    // let monthlyReport = [];
    // let now = new Date();
    // var atten = 0,
    //     late = 0,
    //     absent = 0;

    // for (i in months) {
    //     for (j in months[i].days) {
    //         day = months[i].days[j];
    //         atten += (day.attended) ? 1 : 0;
    //         late += (day.lateTime > 0) ? 1 : 0;
    //     }
    //     if ((now.getMonth() + 1) > months[i].month)
    //         absent = 30 - atten;
    //     else if ((now.getMonth() + 1) == months[i].month)
    //         absent = now.getDate() - atten;
    //     else
    //         break;
    //     monthlyReport.push({
    //         attend: atten,
    //         late: late,
    //         absent: absent,
    //         month: months[i].month
    //     });
    //     atten = 0, late = 0, absent = 0;
    // }
    // return monthlyReport;
}
//get daily attendance whatever attended or absent
function getDaily(months, month, start = 1, end = 30) {

    return months.filter(m => m.month == month)[0].days.filter(d => d.day >= start && d.day <= end)

    // //______________________
    // //get month obj from attendance
    // month = months.filter(m => m.month == month)[0];
    // let dailyReport = [];
    // let i = 0;
    // ///check days array for month is empty or not * means he absent in the whole month
    // if (month.days.length == 0)
    //     // push empty days 
    //     for (var j = 1; j <= (new Date()).getDate(); j++) {
    //         dailyReport.push({
    //             day: j,
    //             time: 0,
    //             late: 0,
    //             lateTime: 0
    //         });
    //     }
    // else
    //     for (var j = start; j <= end; j++) {
    //         dayObj = month.days[i];
    //         if (dayObj.day == j) {
    //             dailyReport.push({
    //                 day: j,
    //                 time: dayObj.time,
    //                 late: (dayObj.lateTime == 0) ? 1 : 0,
    //                 lateTime: dayObj.lateTime
    //             });
    //             /// stop looping for days array
    //             if (i < month.days.length - 1)
    //                 i++;
    //         } else
    //             dailyReport.push({
    //                 day: j,
    //                 time: 0,
    //                 late: 0,
    //                 lateTime: 0
    //             });
    //     }
    // return dailyReport;
}


function readableDate(date) {
    return (new Date(date)).toDateString();
}

function msToTime(duration) {
    if (duration == 0)
        return "__";
    seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + " : " + minutes + " : " + seconds;
}

$('#searchform').submit((e) => {
    e.preventDefault();
    let range = $(e.target).serializeArray()[0].value;
    let query = $(e.target).serializeArray()[1].value;
    let p = false,
        val = "";

    // show specific range



    // array of emps names tds
    let namesTds = $('.tab-pane.active > table > tbody > tr.toggleCollapse > td:first-child()');
    if (namesTds.length == 0) {
        namesTds = $('.tab-pane.active > table > tbody > tr.noCollapse > td:first-child()');
        p = true;
    }
    //if str empty after hiding some elements then show again
    if (query == "")
        for (i in namesTds)
            $(namesTds[i]).parent().fadeIn();
    else
        for (i in namesTds) {
            if (p) // if td has paragraph
                val = $(namesTds[i]).children().first().text();
            else
                val = $(namesTds[i]).text();
            // if not match any of query .. then hide ...else then show
            if (val.toLowerCase().indexOf(query.toLowerCase()) == -1)
                $(namesTds[i]).parent().fadeOut();
            else
                $(namesTds[i]).parent().fadeIn();
        }

    return false;
});

function generatePDF() {
    html2pdf(document.querySelector('.reports'));
}

// function getCurrYearReport(monthlyReport) {
//     let currYearReport = {
//         attended: 0,
//         late: 0,
//         absent: 0
//     };
//     for (i in monthlyReport) {
//         currYearReport.attended += monthlyReport[i].attend;
//         currYearReport.late += monthlyReport[i].late;
//         currYearReport.absent += monthlyReport[i].absent;
//     }
//     return currYearReport;
// }

// function getCurrMonthReport(dailyReport) {
//     let currMonthReport = {
//         attended: 0,
//         late: 0,
//         absent: 0
//     };
//     for (i in dailyReport) {
//         if (dailyReport[i].time == 0)
//             currMonthReport.absent++;
//         else
//             currMonthReport.attended++;
//         currMonthReport.late += dailyReport[i].late;
//     }
//     return currMonthReport;
// }