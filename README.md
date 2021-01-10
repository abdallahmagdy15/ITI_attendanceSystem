# ITI Attendance System

## INTRO 
 ITI_attendanceSystem is a front-end application for taking employees attendance , showing their attendance in profile page and showing reports for the admin about employees attendance.

## FEATURES
  - Simple Light Theme UI
  - Data stored as a tree in a json file
  - Responsive using bootstrap
  - showing modals for any important alerts for the user
  - handling authentication and authorization of accessing pages (using sessionStorage)
  
  #### Login and Register
  - login & register have client-side validation and
   work around (server-side) validation using js based on json file data
  
  #### Profile
  - profile page shows the employee information and (monthly , daily) reports for his attendance 
  - only sub admin can take attendance from the option appears in the options button (caret)
  - profile has an attendance chart
  - profile has daily report with a buttons to switch between months

  #### Attendance page
  - sub admin can search for employees by their name and add to list to confirm their attendance
  - a confirmation modal will appear
  - sub admin can type employee code directly

  #### Admin Panel
  - admin panel contains master-detail-detail reports for all employees attendance
  - admin can select the sub admin from all employees tab
  - admin can sort reports tables (asc or desc)
  - admin can search for specific employee by his name
  - admin can show reports for specific range of date

  - both admin panel and profile have *pdf download* option for the report
  
## TECHNOLOGIES
  - HTML5
  - CSS3
  - Advanced JS and ES6
  - JQuery,fetch
  - Bootstrap

## OTHER LIBRARIES
  - Jquery UI
  - chart
  - daterangepicker
  - html2pdf
  - knockout
  - moment
  - popper
  - fontawesome

## USAGE
  - for any new operation saved to db , a json file will be downloaded then you have to
   replace this with the old one in "data" folder

  - admin username : admin
  - admin password : 123456789
  - any other user password : 123456789a

## LIVE WEBSITE
  https://iti-attendance.netlify.app

### REQUIRED TASK
1. Create attendance system using projects
  - Client side technologies (CSS,HTML,JS)
  - Html5 and bootstrap
  - Advanced JS and ECMA6
  - (JQuery,Ajax,fetch)

2. storing and saving your reports data in Json files formats

3. make sure you make all validations and user restriction on data
before saving


## ABOUT
  **Abdullah Magdy Abou Elyazeed**  
  Email: **abdallah.magdy1515@gmail.com**  
  LinkedIn: [**abdallahmagdy15**](https://www.linkedin.com/in/abdallahmagdy15/)  
