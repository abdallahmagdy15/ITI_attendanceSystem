$(function () {
    $("#profileReportsTabs li a").click(function(e){
        e.preventDefault();
        $(this).tab('show');
    });
  })
  let usernameSession = sessionStorage.getItem('username');

  