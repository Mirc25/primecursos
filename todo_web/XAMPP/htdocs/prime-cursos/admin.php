<?php
session_start();
$adminFile = __DIR__.'/data/admin.json';
if(!empty($_SESSION['prime_admin_authenticated']) && $_SESSION['prime_admin_authenticated']===true){ readfile(__DIR__.'/admin.fixed2.html'); exit; }
if($_SERVER['REQUEST_METHOD']==='POST'){
    $pw = $_POST['password'] ?? '';
    if(!$pw) $error='Contraseña vacía';
    else if(!file_exists($adminFile)) $error='Admin no configurado. Ejecuta create_admin_local.php';
    else { $raw=@file_get_contents($adminFile); $j=$raw?@json_decode($raw,true):null; $hash=$j['admin_password_hash']??null; if(!$hash) $error='Hash admin no encontrado'; else if(password_verify($pw,$hash)){ $_SESSION['prime_admin_authenticated']=true; header('Location: '.$_SERVER['PHP_SELF']); exit; } else $error='Credenciales inválidas'; }
}
?>
<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Login — Admin (local)</title></head><body style="font-family:Arial,Inter,system-ui;background:#071427;color:#e6eef8;padding:20px">
<h2>Acceso Admin — Prime Cursos (local)</h2>
<?php if(!empty($error)) echo '<div style="color:#ffb4b4;margin-bottom:12px">'.htmlspecialchars($error)."</div>"; ?>
<form method="post"><label>Contraseña:</label><input type="password" name="password" style="display:block;padding:8px;margin:8px 0;width:320px"><button style="padding:8px 12px;background:#0b79d0;color:#fff;border:0;border-radius:6px">Ingresar</button></form>
<p style="color:#9aa6b3">Si no configurado, abre <code>/prime-cursos/create_admin_local.php</code></p></body></html>
