<?php
// test_paypal.php — quick test to obtain PayPal token for todo_web copy
require __DIR__ . '/inc_paypal.php';
header('Content-Type: text/plain; charset=utf-8');
$t = pp_get_token();
if(!$t){ echo "pp_get_token() returned null — check prime-cursos-config.php and network access.\n"; exit(1); }
echo "Token OK: ".substr($t,0,16)."...\n";
