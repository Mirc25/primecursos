<?php
header('Content-Type: application/json');
require_once __DIR__ . '/inc_helpers.php';

$data = json_decode(file_get_contents('php://input'), true);
$token = $data['token'] ?? '';
$new = $data['password'] ?? '';
if(!$token || !$new){ echo json_encode(['ok'=>false,'mensaje'=>'Token y nueva contraseña requeridos']); exit; }

$tokens = read_json(__DIR__.'/data/password_reset_tokens.json');
$found = null; $idx = null;
foreach($tokens as $i=>$t){ if($t['token'] === $token){ $found=$t; $idx=$i; break; } }
if(!$found){ echo json_encode(['ok'=>false,'mensaje'=>'Token inválido']); exit; }
if($found['expires'] < time()){ echo json_encode(['ok'=>false,'mensaje'=>'Token expirado']); exit; }

$users = read_json(__DIR__.'/data/users.json');
foreach($users as $i=>$u){ if($u['id'] === $found['user_id']){ $users[$i]['password_hash'] = password_hash($new, PASSWORD_DEFAULT); write_json_atomic(__DIR__.'/data/users.json',$users); // remove token
    array_splice($tokens,$idx,1); write_json_atomic(__DIR__.'/data/password_reset_tokens.json',$tokens);
    echo json_encode(['ok'=>true,'mensaje'=>'Contraseña actualizada']); exit; } }

echo json_encode(['ok'=>false,'mensaje'=>'Usuario no encontrado']);

?>
