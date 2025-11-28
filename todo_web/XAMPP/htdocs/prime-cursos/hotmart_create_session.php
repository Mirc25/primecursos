<?php
// Simple Hotmart session creator (demo).
// Creates a local order and returns a redirect URL to Hotmart checkout.
// IMPORTANT: This is a starter implementation. You MUST replace the HOTMART_PRODUCT_URL
// with your actual Hotmart checkout URL and implement request signing/validation
// according to Hotmart documentation before using in production.

header('Content-Type: application/json');

function read_json($path){
    if(!file_exists($path)) return [];
    $raw = file_get_contents($path);
    $j = json_decode($raw, true);
    return is_array($j) ? $j : [];
}

function write_json_atomic($path, $data){
    $tmp = $path . '.' . uniqid('tmp', true);
    file_put_contents($tmp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    rename($tmp, $path);
}

// Read input
$input = json_decode(file_get_contents('php://input'), true);
if(!$input){ echo json_encode(['ok'=>false,'error'=>'json_invalido','mensaje'=>'JSON inválido']); exit; }

$courseId = isset($input['courseId']) ? trim($input['courseId']) : '';
$email = isset($input['email']) ? trim($input['email']) : '';

if(!$courseId || !$email){ echo json_encode(['ok'=>false,'error'=>'falta_curso_o_email','mensaje'=>'Falta id del curso o email']); exit; }

// Load courses to find price (optional)
$coursesPath = __DIR__ . '/courses.json';
$courses = read_json($coursesPath);
$price = null;
foreach($courses as $c){
    if((string)($c['id'] ?? $c['slug'] ?? $c['title'] ?? '') === (string)$courseId){
        $price = isset($c['price']) ? floatval($c['price']) : null; break;
    }
}

// fallback price if provided by client
if($price === null && isset($input['price'])){ $price = floatval($input['price']); }

// create local order id
$localOrderId = 'order_' . bin2hex(random_bytes(8));
$ordersPath = __DIR__ . '/data/orders.json';
$orders = read_json($ordersPath);

$order = [
    'localOrderId' => $localOrderId,
    'courseId' => $courseId,
    'email' => $email,
    'status' => 'pending',
    'amount' => $price,
    'created_at' => date('c')
];
$orders[] = $order;
// ensure data dir exists
if(!is_dir(__DIR__.'/data')) @mkdir(__DIR__.'/data', 0755, true);
write_json_atomic($ordersPath, $orders);

// Build Hotmart checkout URL (replace with your product's URL and params)
$hotmart_product_url = 'https://pay.hotmart.com/XXXXXXXX?external_reference=' . urlencode($localOrderId);

// Response: client should redirect user to this URL
echo json_encode(['ok'=>true, 'localOrderId'=>$localOrderId, 'redirectUrl'=>$hotmart_product_url]);

// Note: Hotmart will call your configured postback URL (server->server) with transaction info.
// Implement `hotmart_postback.php` to verify and mark orders as paid, create users and grant access.
?>
