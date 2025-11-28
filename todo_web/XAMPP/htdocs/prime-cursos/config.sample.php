<?php
// Sample config for Prime Cursos
// IMPORTANT:
// - Copy this file to a path outside of the webroot (one level above `prime-cursos`) and
//   rename it to `prime-cursos-config.php` (or keep it as a template for your private config).
// - DO NOT commit real secrets into your repo. Use this file only as a template.

// Directory where JSON data files will be stored (place outside public_html for safety)
$PRIME_DATA_DIR = '/home/your_user/prime-cursos-data';

// PayPal credentials
$PAYPAL_ENV = 'sandbox'; // 'sandbox' or 'live'
$PAYPAL_CLIENT = 'your-paypal-client-id-here';
$PAYPAL_SECRET = 'your-paypal-secret-here';

// Optional: other secrets (SMTP, admin tokens, etc.)
// $SMTP_HOST = 'smtp.example.com';
// $SMTP_USER = 'smtp_user';
// $SMTP_PASS = 'smtp_password';

// Example notes:
// 1) After uploading your site to the server, create the folder '/home/your_user/prime-cursos-data'
//    and place your JSON files there (users.json, orders.json, course_access.json).
// 2) Place this file (with real values) in '/home/your_user/prime-cursos-config.php' and ensure it is
//    NOT accessible over the web (outside public_html). inc_paypal.php will include it automatically.

return true;
