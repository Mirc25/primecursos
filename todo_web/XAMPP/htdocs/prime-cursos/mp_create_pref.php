<?php
// mp_create_pref.php (todo_web copy)
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/inc_mercadopago.php';
if($_SERVER['REQUEST_METHOD'] !== 'POST'){ http_response_code(405); echo json_encode(['ok'=>false,'error'=>'method_not_allowed']); exit; }
$raw = file_get_contents('php://input'); $data = $raw ? json_decode($raw, true) : null;
if(!$data || !isset($data['items']) || !is_array($data['items'])){ http_response_code(400); echo json_encode(['ok'=>false,'error'=>'invalid_payload']); exit; }
$items=[]; foreach($data['items'] as $it){ $title = isset($it['title'])?(string)$it['title']:'Producto'; $qty = isset($it['qty'])?intval($it['qty']):(isset($it['quantity'])?intval($it['quantity']):1); $price = isset($it['unit_price'])?floatval($it['unit_price']):(isset($it['price'])?floatval($it['price']):0.0); $currency = isset($it['currency_id'])?$it['currency_id']:(isset($it['currency'])?$it['currency']:'ARS'); $items[]=['title'=>$title,'quantity'=>$qty,'unit_price'=>$price,'currency_id'=>$currency]; }
$back = (isset($data['back_urls'])&&is_array($data['back_urls']))?$data['back_urls']:[];
$res = mp_create_preference($items,$back); if(!$res['ok']){ http_response_code(500); echo json_encode($res); exit; }
$d=$res['data']; $redirect=null; if(isset($d['sandbox_init_point'])) $redirect=$d['sandbox_init_point']; elseif(isset($d['init_point'])) $redirect=$d['init_point']; elseif(isset($d['short_url'])) $redirect=$d['short_url'];
echo json_encode(['ok'=>true,'preference'=>$d,'redirectUrl'=>$redirect]); exit;
?>
