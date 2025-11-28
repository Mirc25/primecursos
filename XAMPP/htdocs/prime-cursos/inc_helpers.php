<?php
function read_json($path){
	// If an external data dir is configured, prefer files there when the requested path is inside the local data/ folder
	global $PRIME_DATA_DIR;
	if(!empty($PRIME_DATA_DIR)){
		// detect a path that ends with '/data/<file>' relative to this project
		$m = null;
		if(preg_match('#/data/(.+)$#', str_replace('\\','/',$path), $m)){
			$alt = rtrim($PRIME_DATA_DIR, '\\/') . '/' . $m[1];
			if(file_exists($alt)){
				$raw = @file_get_contents($alt);
				$j = $raw ? json_decode($raw, true) : null;
				return is_array($j) ? $j : [];
			}
		}
	}
	if(!file_exists($path)) return [];
	$raw = @file_get_contents($path);
	$j = $raw ? json_decode($raw, true) : null;
	return is_array($j) ? $j : [];
}

function write_json_atomic($path, $data){
	global $PRIME_DATA_DIR;
	// If external data dir configured and path is inside local data/, write to that dir instead
	if(!empty($PRIME_DATA_DIR) && preg_match('#/data/(.+)$#', str_replace('\\','/',$path), $m)){
		$alt = rtrim($PRIME_DATA_DIR, '\\/') . '/' . $m[1];
		$dir = dirname($alt);
		if(!is_dir($dir)) @mkdir($dir, 0755, true);
		$tmp = $alt . '.tmp';
		file_put_contents($tmp, json_encode($data, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE));
		rename($tmp, $alt);
		return;
	}
	$tmp = $path . '.tmp';
	file_put_contents($tmp, json_encode($data, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE));
	rename($tmp, $path);
}

function read_courses(){ $p = __DIR__.'/courses.json'; return read_json($p); }

?>
