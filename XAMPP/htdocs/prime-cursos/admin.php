<?php
session_start();
$adminFile = __DIR__.'/data/admin.json';
// If already logged in, show admin UI (the static HTML file)
if(!empty($_SESSION['prime_admin_authenticated']) && $_SESSION['prime_admin_authenticated'] === true){
    // output fixed admin HTML
    readfile(__DIR__.'/admin.fixed2.html');
    exit;
}
// Handle POST (login)
if($_SERVER['REQUEST_METHOD'] === 'POST'){
    $pw = $_POST['password'] ?? '';
    if(!$pw){ $error = 'Contraseña vacía'; }
    else if(!file_exists($adminFile)) { $error = 'Admin no configurado. Ejecuta create_admin_local.php'; }
    else {
        $raw = @file_get_contents($adminFile); $j = $raw ? @json_decode($raw, true) : null;
        $hash = $j['admin_password_hash'] ?? null;
        if(!$hash) { $error = 'Hash admin no encontrado'; }
        else if(password_verify($pw, $hash)){
            $_SESSION['prime_admin_authenticated'] = true;
            // redirect to self to show admin
            header('Location: '.$_SERVER['PHP_SELF']); exit;
        } else { $error = 'Credenciales inválidas'; }
    }
}
// Show simple login form
?>
<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Login — Admin</title></head><body style="font-family:Arial,Segoe UI,Inter,system-ui;padding:24px;background:#071427;color:#e6eef8">
<h2>Acceso Admin — Prime Cursos (local)</h2>
<?php if(!empty($error)) echo '<div style="color:#ffb4b4;margin-bottom:12px">'.htmlspecialchars($error)."</div>"; ?>
<form method="post">
  <label style="display:block;margin-bottom:8px">Contraseña:</label>
  <input type="password" name="password" style="padding:8px 10px;border-radius:6px;border:1px solid #ccc;width:280px;display:block;margin-bottom:12px">
  <button style="padding:8px 12px;border-radius:6px;background:#0b79d0;color:#fff;border:0">Ingresar</button>
</form>
<p style="margin-top:16px;color:#9aa6b3">Si admin no está configurado ejecuta <code>/prime-cursos/create_admin_local.php</code> en tu entorno local para crear la contraseña por defecto.</p>
</body></html>
