<?php
// prime-cursos-config.php
// LOCAL sandbox configuration for Prime Cursos (todo_web copy)
// WARNING: This file may contain secrets. Do NOT commit or upload to public repos.

// Directory for data files (relative to this file)
$PRIME_DATA_DIR = __DIR__ . DIRECTORY_SEPARATOR . 'prime-cursos-data';

// PayPal settings: use 'sandbox' for local testing. Replace CLIENT/SECRET with
// your PayPal sandbox App credentials (from developer.paypal.com).
$PAYPAL_ENV = 'sandbox';
$PAYPAL_CLIENT = 'REPLACE_WITH_YOUR_SANDBOX_CLIENT_ID';
$PAYPAL_SECRET = 'REPLACE_WITH_YOUR_SANDBOX_SECRET';

// Mercado Pago sandbox credentials (Argentina)
$MERCADOPAGO_COUNTRY = 'AR';
$MERCADOPAGO_PUBLIC_KEY = 'APP_USR-a6dc0a87-7cb8-4cc9-90f3-4d4ddf20f1a8';
$MERCADOPAGO_ACCESS_TOKEN = 'APP_USR-1693563001230809-112617-2824dd6b659f458a1d1eee8cf4c0919e-3019249474';

return true;
