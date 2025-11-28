<?php
header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/inc_helpers.php';
require_once __DIR__ . '/inc_paypal.php';

$body = json_decode(file_get_contents('php://input'), true);
if(!$body){ echo json_encode(['ok'=>false,'error'=>'json_required']); exit; }

$items = $body['items'] ?? [];
if(!is_array($items) || count($items)===0){ echo json_encode(['ok'=>false,'error'=>'no_items']); exit; }

// compute total server-side to avoid client tampering
$total = 0.0; $courseIds = [];
foreach($items as $it){
    $p = isset($it['price']) ? floatval($it['price']) : 0.0;
    $d = isset($it['discount_pct']) ? floatval($it['discount_pct']) : 0.0;
    $q = isset($it['qty']) ? intval($it['qty']) : 1;
    $unit = $p * (1 - ($d/100));
    $total += ($unit * $q);
    if(isset($it['id'])) $courseIds[] = $it['id'];
}

$ref = implode(',', array_map('strval', $courseIds));
$return = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS']=='on' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . '/prime-cursos/paypal_capture.php';
$cancel = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS']=='on' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . '/prime-cursos/index.html';

$res = pp_create_order($total, $ref, $return, $cancel);
if(!$res['ok']){ echo json_encode(['ok'=>false,'error'=>'pp_failed','detail'=>$res]); exit; }

$data = $res['data'];
$approve = '';
if(isset($data['links']) && is_array($data['links'])){
    foreach($data['links'] as $l){ if(($l['rel'] ?? '') === 'approve'){ $approve = $l['href']; break; } }
}

echo json_encode(['ok'=>true,'order'=>$data,'redirectUrl'=>$approve]);
exit;

?>
