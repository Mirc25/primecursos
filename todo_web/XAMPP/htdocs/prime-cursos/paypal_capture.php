<?php
session_start();
require_once __DIR__ . '/inc_helpers.php';
require_once __DIR__ . '/inc_paypal.php';

// PayPal redirects back with token (order id). Capture it and persist order + grant access
$orderId = $_GET['token'] ?? $_GET['orderId'] ?? null;
if(!$orderId){ echo "Missing order id"; exit; }

$cap = pp_capture_order($orderId);
if(!$cap['ok']){
    echo "Error capturing order: " . htmlspecialchars(json_encode($cap)); exit;
}

$d = $cap['data'];
// determine payer email
$payerEmail = $d['payer']['email_address'] ?? ($d['payer']['email'] ?? null);

// determine purchased course ids from purchase_units[0].reference_id (comma separated)
$courseIds = [];
if(isset($d['purchase_units'][0]['reference_id'])){
    $ref = $d['purchase_units'][0]['reference_id'];
    $courseIds = array_filter(array_map('trim', explode(',', $ref)));
}

// ensure data dir
if(!is_dir(__DIR__.'/data')) @mkdir(__DIR__.'/data',0755,true);

// find or create user
$usersPath = __DIR__.'/data/users.json';
$users = read_json($usersPath);
$userId = null;
if(isset($_SESSION['user_id'])){ $userId = $_SESSION['user_id']; }
else if($payerEmail){
    foreach($users as $u){ if(strtolower($u['email']) === strtolower($payerEmail)){ $userId = $u['id']; break; } }
    if(!$userId){
        // create a new user (demo) with random password
        $pw = bin2hex(random_bytes(5));
        $hash = password_hash($pw, PASSWORD_DEFAULT);
        $new = ['id'=>'user_'.bin2hex(random_bytes(6)),'email'=>$payerEmail,'name'=>'','password_hash'=>$hash,'created_at'=>date('c'),'via'=>'paypal'];
        $users[] = $new; write_json_atomic($usersPath, $users); $userId = $new['id'];
        // set session so the user is logged in after purchase
        $_SESSION['user_id'] = $userId;
    }
}

// Persist order
$ordersPath = __DIR__.'/data/orders.json'; $orders = read_json($ordersPath);
$orderRecord = ['id'=>$orderId,'user_id'=>$userId,'payer_email'=>$payerEmail,'raw'=>$d,'course_ids'=>$courseIds,'captured_at'=>date('c')];
$orders[] = $orderRecord; write_json_atomic($ordersPath, $orders);

// Grant access to purchased courses for the user
if($userId && count($courseIds)){
    $accessPath = __DIR__.'/data/course_access.json'; $access = read_json($accessPath);
    foreach($courseIds as $cid){
        $found = false; foreach($access as $a){ if(isset($a['user_id']) && $a['user_id']===$userId && isset($a['course_id']) && $a['course_id']===$cid){ $found = true; break; } }
        if(!$found){ $access[] = ['user_id'=>$userId,'course_id'=>$cid,'granted_at'=>date('c'),'via'=>'paypal']; }
    }
    write_json_atomic($accessPath, $access);
}

// Redirect user to a confirmation page or show simple message
header('Content-Type: text/html; charset=utf-8');
echo '<!doctype html><html><head><meta charset="utf-8"><title>Pago completado</title></head><body>';
echo '<h2>Pago completado</h2>';
echo '<p>Gracias. Tu pago ha sido procesado.';
if($userId) echo ' Se ha creado/sesión iniciada con el usuario: '.htmlspecialchars($userId);
echo '</p>';
echo '<p><a href="/prime-cursos/index.html">Volver al catálogo</a> | <a href="/prime-cursos/course_view.php?id='.urlencode($courseIds[0] ?? '').'">Ir al curso comprado</a></p>';
echo '</body></html>';

?>
