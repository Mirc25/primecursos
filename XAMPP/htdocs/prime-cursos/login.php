<?php
session_start();
header('Content-Type: application/json');

function read_json($path){ if(!file_exists($path)) return []; $raw=file_get_contents($path); $j=json_decode($raw,true); return is_array($j)?$j:[]; }

$data = json_decode(file_get_contents('php://input'), true);
if(!$data){
    echo json_encode(['ok'=>false,'error'=>'json_invalido','mensaje'=>'JSON inválido']);
    exit;
}

$type = $data['type'] ?? 'email';
$users = read_json(__DIR__.'/data/users.json');

if($type === 'email'){
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    if(!$email || !$password){ echo json_encode(['ok'=>false,'error'=>'falta_campos','mensaje'=>'Email y contraseña requeridos']); exit; }
    foreach($users as $u){
        if(strtolower($u['email']) === strtolower($email) && isset($u['password_hash'])){
            if(password_verify($password, $u['password_hash'])){
                // login ok
                session_regenerate_id(true);
                $_SESSION['user_id'] = $u['id'];
                $_SESSION['email'] = $u['email'];
                echo json_encode(['ok'=>true,'userId'=>$u['id']]);
                exit;
            } else { echo json_encode(['ok'=>false,'error'=>'credenciales_invalidas','mensaje'=>'Credenciales inválidas']); exit; }
        }
    }
    echo json_encode(['ok'=>false,'error'=>'usuario_no_encontrado','mensaje'=>'Usuario no encontrado o sin contraseña']);
    exit;
}

if($type === 'google'){
    $id_token = $data['id_token'] ?? '';
    if(!$id_token){ echo json_encode(['ok'=>false,'error'=>'falta_id_token','mensaje'=>'Falta id_token']); exit; }
    $verify = @file_get_contents('https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($id_token));
    if(!$verify){ echo json_encode(['ok'=>false,'error'=>'verificacion_google_fallida','mensaje'=>'No se pudo verificar token Google']); exit; }
    $info = json_decode($verify, true);
    if(!isset($info['email'])){ echo json_encode(['ok'=>false,'error'=>'google_sin_email','mensaje'=>'Google no devolvió email']); exit; }
    $email = $info['email'];
    foreach($users as $u){ if(strtolower($u['email']) === strtolower($email)){ session_regenerate_id(true); $_SESSION['user_id']=$u['id']; $_SESSION['email']=$u['email']; echo json_encode(['ok'=>true,'userId'=>$u['id']]); exit; } }
    echo json_encode(['ok'=>false,'error'=>'usuario_no_registrado','mensaje'=>'Usuario no registrado, por favor regístrate primero']);
    exit;
}

echo json_encode(['ok'=>false,'error'=>'tipo_desconocido','mensaje'=>'Tipo de login desconocido']);

?>
