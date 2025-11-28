<?php
// prime-cursos-config.php
// Fill in your real API keys before deploying. This file may be
// placed inside the project for convenience during upload, but for
// security it's recommended to place it outside the webroot on the server.

return [
    'PRIME_DATA_DIR' => __DIR__ . '/data',
    'PAYPAL_ENV'     => 'sandbox',
    'PAYPAL_CLIENT'  => 'REPLACE_WITH_PAYPAL_CLIENT_ID',
    'PAYPAL_SECRET'  => 'REPLACE_WITH_PAYPAL_SECRET',
    'MERCADOPAGO_COUNTRY' => 'AR',
    'MERCADOPAGO_PUBLIC_KEY' => 'REPLACE_WITH_MP_PUBLIC_KEY',
    'MERCADOPAGO_ACCESS_TOKEN' => 'REPLACE_WITH_MP_ACCESS_TOKEN'
];
