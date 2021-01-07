//bootstrap form validation
(function () {
  'use strict';
  window.addEventListener('load', function () {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation');
    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (form.checkValidity() === false) {
          event.stopPropagation();
        } else {
          onSubmitEmp($(this));
        }
        form.classList.add('was-validated');
      }, false);
    });
  }, false);
})();


class Employee {
  constructor(fname, lname, address, email, age) {
    this.fname = fname;
    this.lname = lname;
    this.address = address;
    this.email = email;
    this.age = age;
  }
}


function onSubmitEmp(form) {
  let emp = {};
  //get form data as object
  $.each(form.serializeArray(), function (i, kv) {
    emp[kv.name] = kv.value;
  });
  emp.dateofemp = (new Date());
  //define default attendance array of months objects
  var attendance = [];
  for (var i = 1; i < 13; i++)
    attendance.push({
      month: i,
      attend:0,
      late:0,
      absent:0,
      days: []
    });
  emp.attendance = attendance;
  emp.new = "";
  //get all emp data
  fetch('../data/employees.json').then((emps) => emps.json())
    .then(emps => {
      console.log(emps);
      ///check availibility of username
      if (checkUsernameAvailibility(emp.username, emps))
        registerEmpData(emp, emps, 'abdallah.magdy1515@gmail.com'); /// *** need to get admin mail from json
      else
        showAlert("Username Not Available", "This username is already taken by another employee!", 1);
    })
    .catch(emps => {
      console.log("failed to load employees json file");
    });
  return false;
}

function checkUsernameAvailibility(uname, emps) {
  for (i in emps) {
    if (uname == emps[i].username)
      return false;
  }
  return true;
}

function registerEmpData(emp, emps) {
  emps.push(emp);
  //download data
  var _blob = new Blob([JSON.stringify(emps)], {
    type: "application/json"
  });
  console.log("*******", emp);
  let downloadLink = document.createElement('a');
  downloadLink.href = window.webkitURL.createObjectURL(_blob);
  downloadLink.setAttribute("download", "employees.json");
  downloadLink.click();
  downloadLink.href = 'mailto:' + emps[0].email +
   "?subject=New Employee Registration&body=A new Employee called : " +
    '"' + emp.fname + " " + emp.lname + '"' +
     " has registested and he is waiting for your confirmation";
  downloadLink.setAttribute("download", "false");
  downloadLink.click();
  showAlert('Registration Status', 'Registration request has been sent to the admin for  the approvement!', 1);
}