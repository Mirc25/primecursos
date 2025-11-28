<?php
session_start();
require_once __DIR__ . '/inc_helpers.php';

$id = $_GET['id'] ?? null;
if(!$id){ http_response_code(400); echo 'Curso no especificado'; exit; }

$courses = read_courses();
$course = null;
foreach($courses as $c){ if((string)$c['id'] === (string)$id){ $course=$c; break; } }
if(!$course){ http_response_code(404); echo 'Curso no encontrado'; exit; }

// require login
if(!isset($_SESSION['user_id'])){
    // show public view with limited info and link to login/register
    $public = true;
} else {
    $public = false;
}

// check access if not public
$hasAccess = false;
if(!$public){
    $access = read_json(__DIR__.'/data/course_access.json');
    foreach($access as $a){ if($a['user_id']===$_SESSION['user_id'] && $a['course_id']===$course['id']){ $hasAccess=true; break; } }
}

?><!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title><?php echo htmlspecialchars($course['title']); ?></title>
  <link rel="stylesheet" href="/prime-cursos/assets/styles.css">
</head>
<body>
<div class="container">
  <a href="/prime-cursos/index.html">← Volver</a>
  <h1><?php echo htmlspecialchars($course['title']); ?></h1>
  <?php if(!empty($course['image'])): ?><img src="<?php echo htmlspecialchars($course['image']); ?>" alt="" style="max-width:420px;display:block;margin-bottom:1rem;" /><?php endif; ?>
  <p><strong>Precio:</strong> <?php echo htmlspecialchars($course['price'] ?? 'Gratis'); ?></p>
  <?php if(!$hasAccess): ?>
    <?php if($public && !isset($_SESSION['user_id'])): ?>
      <p>Debes <a href="/prime-cursos/login.html">iniciar sesión o registrarte</a> para gestionar tu cuenta. Aun así puedes comprar sin cuenta mediante PayPal y se creará una cuenta automáticamente usando el email del pagador.</p>
    <?php endif; ?>

    <div class="payment-actions">
      <div class="btn-row">
        <button id="paypalBuy" class="payment-img-button" title="Pagar con PayPal"><img src="/prime-cursos/assets/img/paypal.svg" alt="PayPal"></button>
        <span style="align-self:center;color:#cbd5e1">o</span>
        <form id="hotmartForm" style="display:inline-block">
          <input type="hidden" name="course_id" value="<?php echo htmlspecialchars($course['id']); ?>">
          <label style="display:none">Email para Hotmart: <input name="email" type="email"></label>
          <button type="submit" class="payment-img-button" title="Comprar en Hotmart"><img src="/prime-cursos/assets/img/hotmart.svg" alt="Hotmart"></button>
        </form>
        <button id="mpBuy" class="payment-img-button" title="Pagar con Mercado Pago"><img src="/prime-cursos/assets/img/mercadopago.svg" alt="Mercado Pago"></button>
        <button id="addToCartBtn" class="payment-img-button" title="Agregar al carrito"><img src="/prime-cursos/assets/img/cart.svg" alt="Agregar al carrito"></button>
      </div>

      <div class="payment-logos" aria-hidden="true">
        <div class="logo">
          <img class="pay-logo" src="/prime-cursos/assets/img/paypal.svg" alt="PayPal">
          <div class="text">Paga con tarjeta o cuenta PayPal</div>
        </div>
        <div class="logo">
          <img class="pay-logo" src="/prime-cursos/assets/img/mercadopago.svg" alt="Mercado Pago">
          <div class="text">Tarjetas, transferencias y más (sandbox)</div>
        </div>

        <div style="width:8px"></div>
        <div class="logo card-icons" style="gap:6px">
          <img src="/prime-cursos/assets/img/visa.svg" alt="Visa">
          <img src="/prime-cursos/assets/img/mastercard.svg" alt="Mastercard">
          <img src="/prime-cursos/assets/img/amex.svg" alt="Amex">
          <img src="/prime-cursos/assets/img/maestro.svg" alt="Maestro">
        </div>
      </div>
    </div>

    <script>
    (function(){
      var btn = document.getElementById('paypalBuy');
      var courseId = <?php echo json_encode($course['id']); ?>;
      var coursePrice = <?php echo json_encode(isset($course['price']) ? $course['price'] : 0); ?>;
      var courseDiscount = <?php echo json_encode(isset($course['discount_pct']) ? $course['discount_pct'] : 0); ?>;
      var courseTitle = <?php echo json_encode($course['title']); ?>;
      if(btn){ btn.addEventListener('click', function(){
        btn.dataset.orig = btn.dataset.orig || btn.innerHTML; btn.disabled = true; btn.innerHTML = 'Creando orden...';
        var payload = { items: [ { id: courseId, price: coursePrice, qty: 1, discount_pct: Number(courseDiscount||0), title: courseTitle } ] };
        fetch('/prime-cursos/paypal_create_order.php', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) })
        .then(function(r){ return r.json(); }).then(function(j){
          if(!j || !j.ok){ alert('Error creando orden PayPal'); console.error(j); btn.disabled=false; if(btn.dataset.orig) btn.innerHTML = btn.dataset.orig; return; }
          if(j.redirectUrl){ window.location = j.redirectUrl; } else { alert('No se obtuvo URL de aprobación.'); btn.disabled=false; if(btn.dataset.orig) btn.innerHTML = btn.dataset.orig; }
        }).catch(function(err){ console.error(err); alert('Error de red al contactar el servidor'); btn.disabled=false; if(btn.dataset.orig) btn.innerHTML = btn.dataset.orig; });
      }); }

      // Hotmart form handler (keep existing behaviour)
      var hf = document.getElementById('hotmartForm'); if(hf){ hf.addEventListener('submit', function(e){ e.preventDefault(); var fd = new FormData(); fd.append('course_id', courseId); fetch('/prime-cursos/hotmart_create_session.php',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ courseId: courseId, email: (hf.email && hf.email.value) || '' }) }).then(r=>r.json()).then(function(j){ if(j && j.ok && j.redirectUrl){ window.location = j.redirectUrl; } else { alert('Error creando sesión Hotmart'); console.error(j); } }).catch(function(err){ console.error(err); alert('Error contactando Hotmart'); }); }); }
      // Mercado Pago buy button (creates preference and redirects)
      var mpb = document.getElementById('mpBuy'); if(mpb){ mpb.addEventListener('click', function(){ mpb.dataset.orig = mpb.dataset.orig || mpb.innerHTML; mpb.disabled=true; mpb.innerHTML='Creando preferencia...'; var unit = (Number(courseDiscount||0)>0) ? (Number(coursePrice||0) * (1 - (Number(courseDiscount||0)/100))) : Number(coursePrice||0); var item = [{ title: courseTitle, quantity: 1, unit_price: Number(unit.toFixed(2)), currency_id: 'ARS' }]; var back = { success: window.location.href, failure: window.location.href }; fetch('/prime-cursos/mp_create_pref.php', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ items: item, back_urls: back }) }).then(function(r){ return r.json(); }).then(function(j){ if(!j || !j.ok){ alert('Error creando preferencia Mercado Pago'); console.error(j); mpb.disabled=false; if(mpb.dataset.orig) mpb.innerHTML = mpb.dataset.orig; return; } if(j.redirectUrl){ window.location = j.redirectUrl; } else { alert('No se obtuvo URL de redirección'); mpb.disabled=false; if(mpb.dataset.orig) mpb.innerHTML = mpb.dataset.orig; } }).catch(function(err){ console.error(err); alert('Error de red'); mpb.disabled=false; if(mpb.dataset.orig) mpb.innerHTML = mpb.dataset.orig; }); }); }

      // Add to cart button (uses localStorage prime_cart)
      var atc = document.getElementById('addToCartBtn'); if(atc){ atc.addEventListener('click', function(){ try{ var cart = JSON.parse(localStorage.getItem('prime_cart')||'[]'); // check if exists
        var exists=false; for(var i=0;i<cart.length;i++){ if(String(cart[i].id) === String(courseId)){ cart[i].qty = (cart[i].qty||1) + 1; exists=true; break; } }
        if(!exists){ cart.push({ id: courseId, title: courseTitle, price: Number(coursePrice||0), discount_pct: Number(courseDiscount||0), qty:1 }); }
        localStorage.setItem('prime_cart', JSON.stringify(cart)); alert('Curso agregado al carrito'); }catch(e){ console.error(e); alert('No se pudo agregar al carrito'); } }); }
    })();
    </script>
  <?php else: ?>
    <h2>Has comprado este curso — Contenido</h2>
    <div><?php echo nl2br(htmlspecialchars($course['description'] ?? '')); ?></div>
  <?php endif; ?>
</div>
</body>
</html>
