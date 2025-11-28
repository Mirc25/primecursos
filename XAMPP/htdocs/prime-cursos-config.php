<?php
// prime-cursos-config.php
// LOCAL sandbox configuration for Prime Cursos (served copy)
// WARNING: This file may contain secrets. Do NOT commit or upload to public repos.

// Directory for data files (relative to this file, outside webroot is preferred)
$PRIME_DATA_DIR = __DIR__ . DIRECTORY_SEPARATOR . 'prime-cursos-data';

// PayPal settings: use 'sandbox' for local testing. Replace CLIENT/SECRET with
// your PayPal sandbox App credentials (from developer.paypal.com).
$PAYPAL_ENV = 'sandbox';
$PAYPAL_CLIENT = 'REPLACE_WITH_YOUR_SANDBOX_CLIENT_ID';
$PAYPAL_SECRET = 'REPLACE_WITH_YOUR_SANDBOX_SECRET';

return true;
