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
          loginToSystem($(this));
        }
        form.classList.add('was-validated');
      }, false);
    });
  }, false);
})();


function loginToSystem(form) {
  let emp = {};
  //get form data as object
  $.each(form.serializeArray(), function (i, kv) {
    emp[kv.name] = kv.value;
  });
  //get all emp data
  fetch('../data/employees.json').then((emps) => emps.json())
    .then(emps => {
      console.log(emps);
      let status = checkLoginCredentials(emp, emps);
      if (status > 0) {
        createUserSession(emp);

        if (status == 1) /// if admin
          window.location.replace('../admin_panel.html');

        else if (status == 2) /// if new emp who can`t login
          showAlert('Request Not', 'Your registration request not accepted yet!', 1);

        else /// then he is normal emp
          window.location.replace('../emp_profile.html');

      } else {
        showAlert('Login Failed', 'wrong username or password !', 1);
      }
    })
    .catch(emps => {
      console.log("failed to load employees json file");
    });
  return false;
}


function checkLoginCredentials(emp, emps) {
  for (e in emps) {
    if (emp.username == emps[e].username && emp.password == emps[e].password) {
      if (emps[e].admin != undefined) //** if admin return "1" **//
        return 1;
      else if (emps[e].new != undefined) //* if new emp return 2 *//
        return 2;
      ///** else if normal employee return "3" **//
      return 3;
    }
  }
  ///** if not valid credentials return "0" */
  return 0;
}