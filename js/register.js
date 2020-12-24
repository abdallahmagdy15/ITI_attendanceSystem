//bootstrap form validation
(function () {
  'use strict';
  window.addEventListener('load', function () {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation');
    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function (form) {
      form.addEventListener('submit', function (event) {
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
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


$('#regForm').submit(function (e) {
  let emp = {};
  //get form data as object
  $.each($(this).serializeArray(), function (i, kv) {
    emp[kv.name] = kv.value;
  });
  //get all emp data
  fetch('../data/employees.json').then((emps) => emps.json())
    .then(emps => {
      console.log(emps);
      registerEmpData(emp, emps, 'abdallah.magdy1515@gmail.com'); /// *** need to get admin mail from json
    })
    .catch(emps => {
      console.log("failed to load employees json file");
    });


  return false;
});


function registerEmpData(emp, emps, adminMail) {
  emps.push(emp);
  //download data
  var _blob = new Blob([JSON.stringify(emps)], {
    type: "application/json"
  });
  let downloadLink = document.createElement('a');
  downloadLink.href = window.webkitURL.createObjectURL(_blob);
  downloadLink.setAttribute("download", "employees.json");
  downloadLink.click();
  downloadLink.href = 'mailto:' + adminMail;
  downloadLink.setAttribute("download", "false");
  downloadLink.click();
  alert("Registration request has been sent to the admin for  the approvement!"); ///*** */ need UI enhancement 
}