<?php
// Repair courses.json entries that have labeled data inside the title field.
// Backup is created before modifying.

$dir = __DIR__;
$file = $dir . DIRECTORY_SEPARATOR . 'courses.json';
if (!file_exists($file)) {
    echo "courses.json not found\n";
    exit;
}

$txt = file_get_contents($file);
$arr = json_decode($txt, true);
if (!is_array($arr)) {
    echo "Invalid JSON in courses.json\n";
    exit;
}

$bak = $file . '.' . date('Ymd_His') . '.bak';
copy($file, $bak);
echo "Backup created: " . basename($bak) . "\n";

$changed = 0;
foreach ($arr as $i => $c) {
    if (!isset($c['title'])) continue;
    $t = $c['title'];
    if (preg_match('/\bCATEGORIA:|\bDESCRIPCION:|\bPRECIO:/i', $t)) {
        // Attempt to extract labeled blocks
        $res = [];
        // Extract TITLE (text before first labeled token)
        $m = preg_split('/\b(CATEGORIA:|DESCRIPCION_CORTA:|DESCRIPCION:|PRECIO:)/i', $t);
        $plainTitle = trim($m[0]);
        if ($plainTitle) $arr[$i]['title'] = $plainTitle;

        // CATEGORY
        if (preg_match('/CATEGORIA:\s*([^\n\r]*?)(?:\s{2,}|\n|DESCRIPCION_CORTA:|DESCRIPCION:|PRECIO:|$)/is', $t, $mm)) {
            $arr[$i]['category'] = trim($mm[1]);
        }
        // SHORT DESCRIPTION
        if (preg_match('/DESCRIPCION_CORTA:\s*([^\n\r]*?)(?:\s{2,}|\n|DESCRIPCION:|PRECIO:|$)/is', $t, $mm)) {
            $arr[$i]['short_description'] = trim($mm[1]);
        }
        // DESCRIPTION (possibly long)
        if (preg_match('/DESCRIPCION:\s*([^\n\r]*?)(?:\s{2,}|\n|PRECIO:|$)/is', $t, $mm)) {
            $arr[$i]['description'] = trim($mm[1]);
        }
        // PRICE
        if (preg_match('/PRECIO:\s*([0-9.,]+)/i', $t, $mm)) {
            $p = str_replace(',', '.', $mm[1]);
            $arr[$i]['price'] = is_numeric($p) ? (float)$p : $arr[$i]['price'];
        }

        // Ensure frontend-friendly aliases
        if (isset($arr[$i]['image']) && !isset($arr[$i]['img'])) $arr[$i]['img'] = $arr[$i]['image'];
        if (!isset($arr[$i]['desc'])) $arr[$i]['desc'] = (isset($arr[$i]['short_description']) && $arr[$i]['short_description']) ? $arr[$i]['short_description'] : (isset($arr[$i]['description']) ? $arr[$i]['description'] : '');
        if (!isset($arr[$i]['price'])) $arr[$i]['price'] = isset($arr[$i]['price']) ? $arr[$i]['price'] : 0;

        $changed++;
    }
}

if ($changed > 0) {
    $tmp = $file . '.tmp';
    if (file_put_contents($tmp, json_encode($arr, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) !== false) {
        if (rename($tmp, $file)) {
            echo "Repaired $changed entries. Wrote updated courses.json\n";
            exit;
        }
    }
    echo "Failed to write updated file. Check permissions.\n";
} else {
    echo "No labeled-title entries found to repair.\n";
}

?>
