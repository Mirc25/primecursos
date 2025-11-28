<?php
// Hotmart postback receiver (demo).
// This endpoint receives Hotmart server->server notifications (postbacks).
// You must configure Hotmart to call this URL in your product settings.
// IMPORTANT: Validate the postback signature according to Hotmart docs before trusting payloads.

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

// Read raw postback body
$raw = file_get_contents('php://input');
$payload = json_decode($raw, true);

// For demo, accept JSON or form-encoded. In real usage verify signature.
if(!$payload) $payload = $_POST;

// Expected: payload contains 'external_reference' (our localOrderId) and transaction status
$localRef = $payload['external_reference'] ?? $payload['custom'] ?? null;
$status = $payload['status'] ?? $payload['transactionStatus'] ?? $payload['transaction_status'] ?? null;
$hotmartTx = $payload['transaction'] ?? $payload['transaction_id'] ?? $payload['transaction_id_v2'] ?? null;

if(!$localRef){
    // no se puede correlacionar
    http_response_code(400);
    echo json_encode(['ok'=>false,'error'=>'falta_referencia_externa','mensaje'=>'Falta external_reference (localOrderId)','received'=>$payload]);
    exit;
}

$ordersPath = __DIR__.'/data/orders.json';
$orders = read_json($ordersPath);
$found = false;
foreach($orders as &$o){
    if(isset($o['localOrderId']) && $o['localOrderId'] == $localRef){
        $found = true;
        // Mark paid if status indicates success
        // Hotmart statuses vary; use the appropriate field (example: 'approved')
        $isPaid = false;
        $s = strtolower((string)$status);
        if(in_array($s, ['approved','completed','paid','paid_completed','confirmed'])) $isPaid = true;
        if($isPaid){
            $o['status'] = 'paid';
            $o['hotmart_transaction'] = $hotmartTx;
            $o['paid_at'] = date('c');

            // Create/ensure user and grant access
            $usersPath = __DIR__.'/data/users.json';
            $users = read_json($usersPath);
            $userFound = false;
            foreach($users as &$u){ if($u['email'] === $o['email']){ $userFound = true; $user = &$u; break; } }
            if(!$userFound){
                $newUser = [
                    'id' => 'user_'.bin2hex(random_bytes(6)),
                    'email' => $o['email'],
                    'created_at' => date('c'),
                    'magic_token' => bin2hex(random_bytes(12)),
                    'magic_token_expires' => date('c', time()+60*60*24)
                ];
                $users[] = $newUser;
                $user = $newUser;
            }
            // grant access
            $accessPath = __DIR__.'/data/course_access.json';
            $access = read_json($accessPath);
            $access[] = [
                'user_id' => $user['id'],
                'course_id' => $o['courseId'],
                'granted_at' => date('c')
            ];
            write_json_atomic($accessPath, $access);

            // persist users
            write_json_atomic($usersPath, $users);
        } else {
            // mark other statuses
            $o['status'] = $status;
            $o['hotmart_transaction'] = $hotmartTx;
        }
        break;
    }
}

if($found){
    write_json_atomic($ordersPath, $orders);
    // Registrar payload crudo para auditoría
    $logPath = __DIR__.'/data/hotmart_postbacks.log';
    file_put_contents($logPath, date('c') . " " . $localRef . " " . json_encode($payload) . "\n", FILE_APPEND);
    echo json_encode(['ok'=>true,'procesado'=>$localRef,'mensaje'=>'Postback procesado']);
} else {
    http_response_code(404);
    echo json_encode(['ok'=>false,'error'=>'orden_no_encontrada','mensaje'=>'Orden local no encontrada','ref'=>$localRef]);
}

?>
