<?php
header('Content-Type: application/json');

function read_json($path){ if(!file_exists($path)) return []; $raw = file_get_contents($path); $j = json_decode($raw, true); return is_array($j)?$j:[]; }
function write_json_atomic($path, $data){ $tmp = $path . '.' . uniqid('tmp', true); file_put_contents($tmp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)); rename($tmp, $path); }

// leer JSON recibido
$body = json_decode(file_get_contents('php://input'), true);
if(!$body){ echo json_encode(['ok'=>false,'error'=>'json_invalido','mensaje'=>'JSON inválido']); exit; }

// ensure data dir
if(!is_dir(__DIR__.'/data')) @mkdir(__DIR__.'/data', 0755, true);

$usersPath = __DIR__.'/data/users.json';
$users = read_json($usersPath);

if(($body['type'] ?? '') === 'google'){
    $id_token = $body['id_token'] ?? '';
    if(!$id_token){ echo json_encode(['ok'=>false,'error'=>'falta_id_token','mensaje'=>'Falta el token de Google']); exit; }
    // Verificar token usando tokeninfo de Google
    $verify = @file_get_contents('https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($id_token));
    if(!$verify){ echo json_encode(['ok'=>false,'error'=>'verificacion_google_fallida','mensaje'=>'No se pudo verificar el token de Google']); exit; }
    $info = json_decode($verify, true);
    if(!isset($info['email'])){ echo json_encode(['ok'=>false,'error'=>'google_sin_email','mensaje'=>'La cuenta de Google no proporciona email']); exit; }
    $email = $info['email'];
    $name = $info['name'] ?? '';

    // check existing
    foreach($users as $u){ if(strtolower($u['email']) === strtolower($email)){ echo json_encode(['ok'=>true,'userId'=>$u['id'],'existing'=>true,'mensaje'=>'Usuario ya registrado']); exit; } }

    $newUser = [ 'id'=>'user_'.bin2hex(random_bytes(6)), 'email'=>$email, 'name'=>$name, 'created_at'=>date('c'), 'via'=>'google' ];
    $users[] = $newUser;
    write_json_atomic($usersPath, $users);
    echo json_encode(['ok'=>true,'userId'=>$newUser['id']]);
    exit;
}

if(($body['type'] ?? '') === 'email'){
    $email = trim($body['email'] ?? '');
    $password = $body['password'] ?? '';
    $name = trim($body['name'] ?? '');
    if(!$email || !$password){ echo json_encode(['ok'=>false,'error'=>'falta_email_o_contrasena','mensaje'=>'Email y contraseña son obligatorios']); exit; }
    // comprobar existencia
    foreach($users as $u){ if(strtolower($u['email']) === strtolower($email)){ echo json_encode(['ok'=>false,'error'=>'email_ya_registrado','mensaje'=>'El email ya está registrado']); exit; } }
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $newUser = [ 'id'=>'user_'.bin2hex(random_bytes(6)), 'email'=>$email, 'name'=>$name, 'password_hash'=>$passwordHash, 'created_at'=>date('c'), 'via'=>'email' ];
    $users[] = $newUser;
    write_json_atomic($usersPath, $users);
    // TODO: enviar email de verificación / bienvenida
    echo json_encode(['ok'=>true,'userId'=>$newUser['id'],'mensaje'=>'Cuenta creada con éxito']);
    exit;
}

echo json_encode(['ok'=>false,'error'=>'tipo_desconocido','mensaje'=>'Tipo de registro desconocido']);

?>
