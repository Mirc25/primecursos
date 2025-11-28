<?php
// PayPal helper config
// If you place a config file outside of the webroot named
// '../prime-cursos-config.php' (one level above this folder) it will be loaded
// and can contain production secrets. If not found, local defaults below are used.
$__pc_external_conf = dirname(__FILE__) . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'prime-cursos-config.php';
if(file_exists($__pc_external_conf)){
    include $__pc_external_conf; // expected to define $PAYPAL_ENV, $PAYPAL_CLIENT, $PAYPAL_SECRET, $PRIME_DATA_DIR, etc.
}
// Provide safe defaults only if the variables are not already set by an external config
if(!isset($PAYPAL_ENV)) { $PAYPAL_ENV = 'sandbox'; }
if(!isset($PAYPAL_CLIENT)) { $PAYPAL_CLIENT = 'ARhEKwoYQOaJVWII3DRIk...'; }
if(!isset($PAYPAL_SECRET)) { $PAYPAL_SECRET = 'EBIRMgloSRUYCfB8QQe6cjA1K3ufv7CP7HvgFxDqhJxfHMORcyyj5QrncUDIHCXqd3gUrdSGkzvTwF0s'; }

function pp_api_base(){ global $PAYPAL_ENV; return ($PAYPAL_ENV === 'live') ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'; }

function pp_get_token(){ global $PAYPAL_CLIENT, $PAYPAL_SECRET;
    $cacheFile = sys_get_temp_dir() . '/pp_token_cache.json';
    // small cache to avoid requesting token on each call
    if(file_exists($cacheFile)){
        $raw = @file_get_contents($cacheFile);
        if($raw){ $j = json_decode($raw, true); if(isset($j['access_token']) && isset($j['expires_at']) && $j['expires_at'] > time()+30) return $j['access_token']; }
    }
    $url = pp_api_base() . '/v1/oauth2/token';
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERPWD, $PAYPAL_CLIENT . ':' . $PAYPAL_SECRET);
    curl_setopt($ch, CURLOPT_POSTFIELDS, 'grant_type=client_credentials');
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
    $resp = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);
    if(!$resp) return null;
    $j = json_decode($resp, true);
    if(!$j || !isset($j['access_token'])) return null;
    $expires = isset($j['expires_in']) ? (int)$j['expires_in'] : 3000;
    $cache = ['access_token'=>$j['access_token'],'expires_at'=>time()+$expires];
    @file_put_contents($cacheFile, json_encode($cache));
    return $j['access_token'];
}

function pp_create_order($total, $referenceIds = '', $returnUrl = '', $cancelUrl = ''){
    $token = pp_get_token(); if(!$token) return ['ok'=>false,'error'=>'no_token'];
    $url = pp_api_base() . '/v2/checkout/orders';
    $body = [
        'intent' => 'CAPTURE',
        'purchase_units' => [[
            'reference_id' => (string)$referenceIds,
            'amount' => [ 'currency_code' => 'USD', 'value' => number_format($total,2,'.','') ]
        ]]
    ];
    if($returnUrl) $body['application_context'] = ['return_url'=>$returnUrl,'cancel_url'=>$cancelUrl];
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json','Authorization: Bearer '.$token]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    $resp = curl_exec($ch); $err = curl_error($ch); curl_close($ch);
    if(!$resp) return ['ok'=>false,'error'=>'no_response','detail'=>$err];
    $j = json_decode($resp, true); if(!$j) return ['ok'=>false,'error'=>'invalid_json','raw'=>$resp];
    return ['ok'=>true,'data'=>$j];
}

function pp_capture_order($orderId){
    $token = pp_get_token(); if(!$token) return ['ok'=>false,'error'=>'no_token'];
    $url = pp_api_base() . '/v2/checkout/orders/' . urlencode($orderId) . '/capture';
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json','Authorization: Bearer '.$token]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, '{}');
    $resp = curl_exec($ch); $err = curl_error($ch); curl_close($ch);
    if(!$resp) return ['ok'=>false,'error'=>'no_response','detail'=>$err];
    $j = json_decode($resp, true); if(!$j) return ['ok'=>false,'error'=>'invalid_json','raw'=>$resp];
    return ['ok'=>true,'data'=>$j];
}

?>
