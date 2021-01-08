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
//get monthly attendance 
function getMonthly(months, startDate, endDate) {
    if (new Date() < startDate)
        return [];

    if (new Date() < endDate)
        endDate = new Date()

    months = months.filter(m =>
        m.month >= startDate.getMonth() + 1 && m.month <= endDate.getMonth() + 1)
    months.forEach((m) => {
        let daysCount = 0;
        //get days for each month according to range of dates
        if (startDate.getMonth() == endDate.getMonth()) {
            m.days = m.days.filter(d => d.day >= startDate.getDate() && d.day <= endDate.getDate())
            daysCount = endDate.getDate() - startDate.getDate()
        }
        else if (m.month == startDate.getMonth() + 1) {
            m.days = m.days.filter(d => d.day >= startDate.getDate())
            daysCount = 30 - startDate.getDate()
        }
        else if (m.month == endDate.getMonth() + 1) {
            m.days = m.days.filter(d => d.day <= endDate.getDate())
            daysCount = endDate.getDate()
        }

        m.days.forEach(d => {
            m.attend++;
            if (d.lateTime > 0)
                m.late++;
        })
        
        m.absent = (daysCount + 1) - m.attend
    })
    return months;
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

$(".daterangepicker-field").daterangepicker({
    forceUpdate: true,
    callback: function (startDate, endDate, period) {
        var title = startDate.format('L') + ' – ' + endDate.format('L');
        $(this).val(title)
    }
});


function generatePDF() {
    html2pdf(document.querySelector('.reports'));
}

