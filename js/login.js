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


$('#loginForm').submit(function (e) {
  let emp = {};
  let formAction;
  //get form data as object
  $.each($(this).serializeArray(), function (i, kv) {
    emp[kv.name] = kv.value;
  });
  //get all emp data
  fetch('../data/employees.json').then((emps) => emps.json())
    .then(emps => {
      console.log(emps);
      let status = checkLoginCredentials(emp, emps);
      if (status) {
        createUserSession(emp);
        window.location.replace('../emp_profile.html');
      } else {
        showAlert('Login Failed','wrong username or password !',1);
        //alert('wrong username or password !'); ///*** */ needs UI enhancements
      }
    })
    .catch(emps => {
      console.log("failed to load employees json file");
    });

  return false;
});

function checkLoginCredentials(emp, emps) {
  for (e in emps) {
    if (emp.username == emps[e].username && emp.password == emps[e].password)
      return true;
  }
  return false;
}

function createUserSession(emp) {
  sessionStorage.setItem('username', emp.username);
}
