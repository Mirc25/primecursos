<?php
// create_user_local.php (todo_web copy)
header('Content-Type: text/plain; charset=utf-8');
if(php_sapi_name() === 'cli'){ echo "Ejecuta desde navegador en entorno local.\n"; exit; }
$email = 'pablooviedo58@gmail.com';
$password = 'Stefano49228080';
$name = 'Pablo Oviedo';
$dataDir = __DIR__ . '/data'; if(!is_dir($dataDir)) @mkdir($dataDir,0755,true);
$usersPath = $dataDir.'/users.json'; $users = [];
if(file_exists($usersPath)){ $raw=@file_get_contents($usersPath); $j=$raw?@json_decode($raw,true):null; if(is_array($j)) $users=$j; }
foreach($users as $u){ if(isset($u['email']) && strtolower($u['email'])===strtolower($email)){ echo "Usuario ya existe: {$email}\n"; exit; } }
$hash = password_hash($password, PASSWORD_DEFAULT);
$new = ['id'=>'user_'.bin2hex(random_bytes(6)),'email'=>$email,'name'=>$name,'password_hash'=>$hash,'created_at'=>date('c'),'via'=>'email'];
$users[]=$new; $tmp=$usersPath.'.'.uniqid('tmp',true); file_put_contents($tmp,json_encode($users,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE)); rename($tmp,$usersPath);
echo "Usuario creado localmente (todo_web):\n email: {$email}\n password: {$password}\n archivo: {$usersPath}\n";
?>
