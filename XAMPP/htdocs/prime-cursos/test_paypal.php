<?php
// test_paypal.php — quick test to obtain PayPal token using inc_paypal.php
require __DIR__ . '/inc_paypal.php';
header('Content-Type: text/plain; charset=utf-8');
$t = pp_get_token();
if(!$t){ echo "pp_get_token() returned null — check prime-cursos-config.php and network access.\n"; exit(1); }
echo "Token OK: ".substr($t,0,16)."...\n";
// optional: try to create a small order (uncomment to test)
// $r = pp_create_order(1.00,'local-test-ref','http://localhost/','http://localhost/'); var_export($r);
