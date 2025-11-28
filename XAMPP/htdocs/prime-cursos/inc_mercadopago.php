<?php
// inc_mercadopago.php
// Minimal Mercado Pago helper for creating preferences (sandbox/test)

$__pc_external_conf = dirname(__FILE__) . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'prime-cursos-config.php';
if(file_exists($__pc_external_conf)){
    include $__pc_external_conf; // may define $MERCADOPAGO_ACCESS_TOKEN, $MERCADOPAGO_PUBLIC_KEY, $MERCADOPAGO_COUNTRY
}

if(!isset($MERCADOPAGO_COUNTRY)) $MERCADOPAGO_COUNTRY = 'AR';
if(!isset($MERCADOPAGO_PUBLIC_KEY)) $MERCADOPAGO_PUBLIC_KEY = null;
if(!isset($MERCADOPAGO_ACCESS_TOKEN)) $MERCADOPAGO_ACCESS_TOKEN = null;

function mp_api_base(){
    // Mercado Pago uses same base for sandbox and production; sandbox tokens identify test mode
    return 'https://api.mercadopago.com';
}

function mp_get_public_key(){ global $MERCADOPAGO_PUBLIC_KEY; return $MERCADOPAGO_PUBLIC_KEY; }
function mp_get_access_token(){ global $MERCADOPAGO_ACCESS_TOKEN; return $MERCADOPAGO_ACCESS_TOKEN; }

// Create a preference. $items should be an array of items with keys: title, quantity, currency_id, unit_price
function mp_create_preference($items, $back_urls = []){
    $token = mp_get_access_token();
    if(!$token) return ['ok'=>false,'error'=>'no_access_token'];

    $url = mp_api_base() . '/checkout/preferences';
    $body = ['items' => array_values($items)];
    if(!empty($back_urls) && is_array($back_urls)){
        $body['back_urls'] = $back_urls;
    }

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $token
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    $resp = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);

    if(!$resp) return ['ok'=>false,'error'=>'no_response','detail'=>$err];
    $j = json_decode($resp, true);
    if(!$j) return ['ok'=>false,'error'=>'invalid_json','raw'=>$resp];
    return ['ok'=>true,'data'=>$j];
}

?>
