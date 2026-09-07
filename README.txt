System Name: JaiROAD Web Application

1. WEB FILES
All web files (PHP, CSS, JS) are included in this folder. To run the system, simply place this folder inside your local web server (e.g., XAMPP 'htdocs' or WAMP 'www') and access it via localhost in your browser. The login page is found in JAIROADS>views>login.php

2. DATABASE FILES
This system uses **Firebase Firestore**, a cloud-hosted NoSQL database, along with Firebase Authentication. 
Because the database is hosted in the cloud, there is no traditional `.sql` or `.db` file to import or configure locally. The system is already connected to the live database via the configuration found in `/public/js/firebase-config.js`. It will work automatically as long as you have an active internet connection.

If you wish to access the firebase console, you may do so 

3. LOGIN CREDENTIALS
To access the system, please use the following test accounts:

Admin Account:
Email: demoAdmin@engineer.ph
Password: admin1234

Engineer Account:
Email: demoEngineer@engineer.ph
Password: engineer1234

Thank you!
