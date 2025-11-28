<?php
header('Content-Type: application/json');
require_once __DIR__ . '/inc_helpers.php';

$data = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');
if(!$email){ echo json_encode(['ok'=>false,'mensaje'=>'Email requerido']); exit; }

$users = read_json(__DIR__.'/data/users.json');
$found = null;
foreach($users as $u){ if(strtolower($u['email'])===strtolower($email)){ $found=$u; break; } }
if(!$found){ echo json_encode(['ok'=>false,'mensaje'=>'Email no registrado']); exit; }

$tokens = read_json(__DIR__.'/data/password_reset_tokens.json');
$token = bin2hex(random_bytes(16));
$expires = time() + 3600; // 1 hour
$tokens[] = ['token'=>$token,'user_id'=>$found['id'],'expires'=>$expires];
write_json_atomic(__DIR__.'/data/password_reset_tokens.json', $tokens);

// For demo we'll return the token (in prod send email)
echo json_encode(['ok'=>true,'mensaje'=>'Token creado','token'=>$token,'expires'=>$expires]);

?>
