// `courses` and `categories` are provided by `assets/data.js`

// allow overriding courses with saved ones in localStorage (admin creates courses)
function loadStoredCourses(){
  try{
    var s = localStorage.getItem('prime_courses');
    if(s){ var parsed = JSON.parse(s); if(Array.isArray(parsed) && parsed.length>0) return parsed; }
  }catch(e){}
  return courses; // fallback to default
}
// replace courses variable with stored copy if available
// use a local `courseList` that prefers stored courses but falls back to the default `courses`
var courseList = loadStoredCourses();

// Clean and shorten titles for listing (remove HTML, collapse whitespace, truncate)
function cleanTitle(raw){
  try{
    var t = String(raw||'');
    // remove HTML tags if any
    t = t.replace(/<[^>]*>/g,'');
    // collapse whitespace and newlines
    t = t.replace(/\s+/g,' ').trim();
    if(t.length > 80) t = t.slice(0,80) + '…';
    return t;
  }catch(e){ return String(raw||'').slice(0,80); }
}

const $ = id => document.getElementById(id);
const coursesEl = $('courses');
const cartBtn = $('cartBtn');
const cartModal = $('cartModal');
const closeCart = $('closeCart');
const cartItemsEl = $('cartItems');
const cartCount = $('cartCount');
const cartTotal = $('cartTotal');
const searchInput = $('searchInput');
const categoriesEl = $('categories');
const sliderTrack = $('sliderTrack');
const prevSlide = $('prevSlide');
const nextSlide = $('nextSlide');

let sliderIndex = 0;
let sliderTimer = null;

let cart = JSON.parse(localStorage.getItem('prime_cart')||'[]');

function renderCategories(){
  if(!categoriesEl) return;
  categoriesEl.innerHTML = '';
  categories.forEach(cat=>{
    const btn = document.createElement('button');
    btn.textContent = cat; btn.dataset.cat = cat; btn.className='catBtn';
    btn.addEventListener('click',()=>{ filterByCategory(cat); });
    categoriesEl.appendChild(btn);
  });
}

function renderSlider(){
  if(!sliderTrack) return;
  const featured = courseList.filter(c=>c.featured).slice(0,5);
  sliderTrack.innerHTML = '';
  featured.forEach((c, i)=>{
    const s = document.createElement('div'); s.className='slide';
    var titleTxt = cleanTitle(c.title || c.short_description || '');
    var imgHtml = '';
    if(c.img || c.image){
      imgHtml = '<div class="slide-media">' +
                '<img src="' + (c.img||c.image) + '" alt="' + (c.title||'') + '">' +
                '<div class="overlay-title">' + titleTxt + '</div>' +
                '</div>';
    } else {
      imgHtml = '<div class="slide-info"><h3 style="margin:0">' + titleTxt + '</h3>';
    }
    s.innerHTML = imgHtml + '\n      <div class="slide-info">\n        <div style="margin-top:6px">' + ((c.price!==undefined&&c.price!==null)?Number(c.price).toFixed(2):'') + '</div>\n      </div>\n    ';
    sliderTrack.appendChild(s);
  });
  // reset index
  sliderIndex = 0; updateSlider(); startSliderAuto();
}

function updateSlider(){
  if(!sliderTrack) return;
  const slides = sliderTrack.querySelectorAll('.slide');
  if(!slides.length) return;
  // use offsetLeft to calculate accurate scroll position
  const target = slides[sliderIndex];
  const offset = target.offsetLeft - sliderTrack.offsetLeft;
  sliderTrack.scrollTo({left: offset, behavior: 'smooth'});
}

function startSliderAuto(){
  stopSliderAuto();
  sliderTimer = setInterval(()=>{
    const slides = sliderTrack.querySelectorAll('.slide');
    if(slides.length===0) return;
    sliderIndex = (sliderIndex + 1) % slides.length; updateSlider();
  }, 4000);
}

function stopSliderAuto(){ if(sliderTimer) clearInterval(sliderTimer); sliderTimer = null; }

if(prevSlide) prevSlide.addEventListener('click',()=>{ stopSliderAuto(); const slides = sliderTrack.querySelectorAll('.slide'); if(slides.length===0) return; sliderIndex = (sliderIndex - 1 + slides.length) % slides.length; updateSlider(); startSliderAuto(); });
if(nextSlide) nextSlide.addEventListener('click',()=>{ stopSliderAuto(); const slides = sliderTrack.querySelectorAll('.slide'); if(slides.length===0) return; sliderIndex = (sliderIndex + 1) % slides.length; updateSlider(); startSliderAuto(); });

// Listen for cross-tab course updates (admin save will broadcast)
try{
  if(typeof BroadcastChannel !== 'undefined'){
    var _pc_bc = new BroadcastChannel('prime_courses_channel');
    _pc_bc.addEventListener('message', function(ev){ try{ if(ev && ev.data && ev.data.type === 'updated'){ courseList = loadStoredCourses(); try{ renderCourses(); renderSlider(); updateCartUI(); }catch(err){} } }catch(e){} });
    window.addEventListener('beforeunload', function(){ try{ _pc_bc.close(); }catch(e){} });
  } else {
    // fallback: listen for the small timestamp flag in localStorage
    window.addEventListener('storage', function(e){ if(e && e.key === '__prime_courses_update_ts'){ try{ courseList = loadStoredCourses(); renderCourses(); renderSlider(); updateCartUI(); }catch(err){} } });
  }
}catch(e){}

function renderCourses(filtered){
  const list = filtered || courseList;
  coursesEl.innerHTML = '';
  list.forEach(c=>{
    const card = document.createElement('div'); card.className='card';
    var titleTxt = cleanTitle(c.title || c.short_description || '');
    var imgPart = '';
    if(c.img || c.image){
      imgPart = '<div class="card-media">' +
                '<img class="thumb" src="' + (c.img||c.image) + '" alt="' + (c.title||'') + '">' +
                '<div class="overlay-title">' + titleTxt + '</div>' +
                '</div>';
    } else {
      imgPart = '<h4 class="title">' + titleTxt + '</h4>';
    }
    // Price display with optional discount
    var priceHtml = '';
    if(c.price !== undefined && c.price !== null && !isNaN(Number(c.price))){
      var p = Number(c.price);
      var d = Number(c.discount_pct || 0);
      if(d > 0){
        var finalP = p * (1 - (d/100));
        priceHtml = '<div class="meta"><div class="price"><del style="color:rgba(255,255,255,0.6);margin-right:8px">$' + p.toFixed(2) + '</del><strong>$' + finalP.toFixed(2) + '</strong></div></div>';
      } else {
        priceHtml = '<div class="meta"><div class="price">$' + p.toFixed(2) + '</div></div>';
      }
    }

    card.innerHTML = imgPart + '\n      <div class="card-body">\n        ' + priceHtml + '\n      </div>\n    ';
    coursesEl.appendChild(card);
  });
  // No action buttons on home cards — only image, title and price as required
}

function filterByCategory(cat){
  if(cat==='Todos'){ renderCourses(courses); return; }
  const f = courses.filter(c=>c.category===cat);
  renderCourses(f);
}

function doSearch(q){
  q = (q||'').toLowerCase().trim();
  if(!q){ renderCourses(); return; }
  const f = courseList.filter(c=> ( (c.title||'') + ' ' + (c.desc||c.description||c.short_description||'') ).toLowerCase().includes(q));
  renderCourses(f);
}

function addToCart(id){
  const item = cart.find(x=>x.id===id);
  if(item) item.qty++;
  else { const c=courses.find(x=>x.id===id); cart.push({id:c.id,title:c.title,price:c.price,discount_pct: (c && c.discount_pct) ? c.discount_pct : 0, qty:1}); }
  saveCart();
  updateCartUI();
}

function saveCart(){ localStorage.setItem('prime_cart',JSON.stringify(cart)); }

function updateCartUI(){
  cartCount.textContent = cart.reduce((s,i)=>s+i.qty,0);
}

function showCart(){
  cartModal.setAttribute('aria-hidden','false');
  renderCartItems();
}

function hideCart(){ cartModal.setAttribute('aria-hidden','true'); }

function renderCartItems(){
  cartItemsEl.innerHTML='';
  if(cart.length===0){ cartItemsEl.innerHTML='<p>El carrito está vacío.</p>'; cartTotal.textContent='$0.00'; return; }
  cart.forEach(i=>{
    const div=document.createElement('div');
    div.style.margin='8px 0';
    // Show unit price with discount if available on the cart item
    var unitHtml = '';
    var unitPrice = Number(i.price || 0);
    var itemDiscount = Number(i.discount_pct || 0);
    if(itemDiscount > 0){ var unitFinal = unitPrice * (1 - (itemDiscount/100)); unitHtml = `<del style="color:rgba(0,0,0,0.6);margin-right:6px">$${unitPrice.toFixed(2)}</del> $${unitFinal.toFixed(2)}`; }
    else { unitHtml = `$${unitPrice.toFixed(2)}`; }
    div.innerHTML = `<strong>${i.title}</strong> — ${i.qty} × ${unitHtml} <button data-id='${i.id}' class='rm'>Eliminar</button>`;
    cartItemsEl.appendChild(div);
  });
  cartItemsEl.querySelectorAll('.rm').forEach(b=>b.addEventListener('click',e=>{
    const id=Number(e.currentTarget.dataset.id); cart = cart.filter(x=>x.id!==id); saveCart(); renderCartItems(); updateCartUI();
  }));
  // Compute total applying discounts when present on cart items
  const total = cart.reduce((s,i)=>{
    var p = Number(i.price||0);
    var d = Number(i.discount_pct||0);
    var unit = p * (1 - (d/100));
    return s + (unit * (i.qty||1));
  }, 0);
  cartTotal.textContent = `$${total.toFixed(2)}`;
}

// Checkout (simulado)
function checkout(){
  if(cart.length===0){ alert('El carrito está vacío.'); return; }
  // Ask user which payment method
  var method = prompt("Escribe 'paypal' para PayPal, 'mercadopago' para Mercado Pago, o 'site' para compra directa (sitio):", 'paypal');
  if(!method) return;
  method = String(method).trim().toLowerCase();
  if(method === 'paypal'){
    // send cart to server to create PayPal order and redirect to approval
    fetch('/prime-cursos/paypal_create_order.php', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ items: cart })
    }).then(r=>r.json()).then(function(j){
      if(!j || !j.ok){ alert('Error creando orden PayPal'); console.error(j); return; }
      if(j.redirectUrl){ window.location = j.redirectUrl; }
      else alert('No se obtuvo URL de aprobación');
    }).catch(function(err){ console.error(err); alert('Error contactando al servidor PayPal'); });
    return;
  }
  
  if(method === 'mercadopago'){
    // Prepare items for Mercado Pago
    var mpItems = cart.map(function(i){
      var p = Number(i.price || 0);
      var d = Number(i.discount_pct || 0);
      var unit = (d > 0) ? (p * (1 - (d/100))) : p;
      return { title: i.title || 'Producto', quantity: i.qty || 1, unit_price: Number(unit.toFixed(2)), currency_id: 'ARS' };
    });
    // optional back URLs
    var back = { success: window.location.href, failure: window.location.href };
    fetch('mp_create_pref.php', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ items: mpItems, back_urls: back })
    }).then(function(r){ return r.json(); }).then(function(j){
      if(!j || !j.ok){ alert('Error creando preferencia Mercado Pago'); console.error(j); return; }
      if(j.redirectUrl){ window.location = j.redirectUrl; }
      else alert('No se obtuvo URL de redirección de Mercado Pago');
    }).catch(function(err){ console.error(err); alert('Error contactando al servidor Mercado Pago'); });
    return;
  }
  // fallback: site direct purchase (simulated)
  if(method === 'site'){
    const order = {items:cart, total: cart.reduce((s,i)=>{ var p=Number(i.price||0); var d=Number(i.discount_pct||0); return s + (p*(1-(d/100))*(i.qty||1)); },0), date: new Date().toISOString() };
    const orders = JSON.parse(localStorage.getItem('prime_orders')||'[]'); orders.push(order); localStorage.setItem('prime_orders',JSON.stringify(orders));
    cart = []; saveCart(); updateCartUI(); renderCartItems(); alert('Compra directa completada (simulada).'); hideCart();
    return;
  }
  alert('Método no reconocido. Cancelado.');
}

// init
renderCategories(); renderCourses(); updateCartUI();
if(searchInput){ searchInput.addEventListener('input',e=>doSearch(e.target.value)); }
cartBtn.addEventListener('click',showCart); closeCart.addEventListener('click',hideCart);
$('checkoutBtn').addEventListener('click',checkout);
// Direct Mercado Pago button (bypass prompt)
if($('mpCheckoutBtn')){
  $('mpCheckoutBtn').addEventListener('click', function(){
    // Reuse same logic as the mercadopago branch in checkout()
    if(cart.length===0){ alert('El carrito está vacío.'); return; }
    var mpItems = cart.map(function(i){ var p = Number(i.price || 0); var d = Number(i.discount_pct || 0); var unit = (d > 0) ? (p * (1 - (d/100))) : p; return { title: i.title || 'Producto', quantity: i.qty || 1, unit_price: Number(unit.toFixed(2)), currency_id: 'ARS' }; });
    var back = { success: window.location.href, failure: window.location.href };
    fetch('mp_create_pref.php', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ items: mpItems, back_urls: back }) }).then(function(r){ return r.json(); }).then(function(j){ if(!j || !j.ok){ alert('Error creando preferencia Mercado Pago'); console.error(j); return; } if(j.redirectUrl){ window.location = j.redirectUrl; } else alert('No se obtuvo URL de redirección de Mercado Pago'); }).catch(function(err){ console.error(err); alert('Error contactando al servidor Mercado Pago'); });
  });
}
// Slider init (uses courses from data.js)
// ensure images have loaded before calculating slider positions
window.addEventListener('load', ()=>{
  renderSlider();
});
window.addEventListener('resize', ()=>{ updateSlider(); });
