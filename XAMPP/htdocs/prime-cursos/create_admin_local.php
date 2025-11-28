<?php
// create_admin_local.php
// Crea/actualiza la contraseña admin para acceso local al admin.
header('Content-Type: text/plain; charset=utf-8');
if(php_sapi_name() === 'cli'){
    echo "Ejecuta este script desde el navegador en entorno local.\n";
    exit;
}
$password = 'Stefano49228080';
$dataDir = __DIR__ . '/data';
if(!is_dir($dataDir)) @mkdir($dataDir, 0755, true);
$adminPath = $dataDir . '/admin.json';
$hash = password_hash($password, PASSWORD_DEFAULT);
$obj = ['admin_password_hash' => $hash, 'created_at'=>date('c')];
$tmp = $adminPath . '.' . uniqid('tmp', true);
file_put_contents($tmp, json_encode($obj, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE));
rename($tmp, $adminPath);
echo "Admin creado/actualizado localmente.\n";
echo "  password: {$password}\n";
echo "  archivo: {$adminPath}\n";
?>
