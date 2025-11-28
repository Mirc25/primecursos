<?php
// test_mp.php (todo_web copy)
require_once __DIR__ . '/inc_mercadopago.php';
$items = [ [ 'title' => 'Curso de prueba', 'quantity' => 1, 'unit_price' => 1.00, 'currency_id' => 'ARS' ] ];
$res = mp_create_preference($items, ['success' => 'http://localhost/prime-cursos/', 'failure' => 'http://localhost/prime-cursos/']);
header('Content-Type: application/json; charset=utf-8');
echo json_encode($res, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE);
?>
