<?php
// show_courses.php - Verifica qué cursos lee el servidor
// Uso:
//  - Abrir en el navegador: show_courses.php  (salida legible)
//  - Abrir show_courses.php?format=json  (salida JSON)

header('Content-Type: text/plain; charset=utf-8');
require_once __DIR__.'/inc_helpers.php';

$courses = read_courses();
$expectedPath = __DIR__ . '/courses.json';

// Detectar si hay configuración de datos externa
$primeDataDir = '';
if(function_exists('realpath')){
    // intentar leer global si existe
    global $PRIME_DATA_DIR;
    if(!empty($PRIME_DATA_DIR)) $primeDataDir = $PRIME_DATA_DIR;
}

if(empty($courses)){
    echo "No se encontraron cursos (courses.json vacío o inaccesible).\n";
    echo "Ruta esperada local: " . $expectedPath . "\n";
    if($primeDataDir) echo "PRIME_DATA_DIR detectado: " . $primeDataDir . "\n";
    echo "\nSugerencias:\n";
    echo " - Comprueba que 'courses.json' exista en la ruta indicada y tenga permisos 644.\n";
    echo " - Si usas una carpeta externa, sube 'courses.json' al directorio apuntado por PRIME_DATA_DIR.\n";
    echo " - Puedes subir un fichero de ejemplo al servidor desde tu máquina con cPanel o SFTP.\n";
    exit;
}

// Permitir salida JSON para consumo automático
$format = strtolower($_GET['format'] ?? '');
if($format === 'json'){
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($courses, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE);
    exit;
}

echo "Se encontraron " . count($courses) . " cursos:\n\n";

// host base para muestras de URL
$host = (isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : ($_SERVER['SERVER_NAME'] ?? 'localhost'));
$proto = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$base = $proto . '://' . $host . dirname($_SERVER['REQUEST_URI']);
$base = rtrim($base, '/') . '/';

foreach($courses as $i => $c){
    $index = $i+1;
    $id = isset($c['id']) ? $c['id'] : '(sin id)';
    $slug = isset($c['slug']) ? $c['slug'] : '';
    $title = isset($c['title']) ? $c['title'] : '(sin title)';
    $price = isset($c['price']) ? $c['price'] : 'Gratis';
    $featured = !empty($c['featured']) ? 'yes' : 'no';
    $discount = isset($c['discount_pct']) ? $c['discount_pct'] : 0;

    echo $index . ". id=" . $id . " | title=" . $title . " | price=" . $price . " | featured=" . $featured . " | discount=" . $discount . "\n";
    echo "    URL por id: " . $base . "course_view.php?id=" . urlencode((string)$id) . "\n";
    echo "    URL por índice: " . $base . "course_view.php?id=" . $index . "\n";
    if($slug) echo "    URL por slug: " . $base . "course_view.php?id=" . urlencode((string)$slug) . "\n";
    echo "\n";
}

echo "Comprobaciones útiles:\n";
echo " - Si el servidor usa PRIME_DATA_DIR, sube 'courses.json' allí en lugar de en public_html.\n";
echo " - Para ver la salida JSON: show_courses.php?format=json\n";
echo " - Después de subir, prueba abrir: course_view.php?id=<id> usando alguno de los ids listados arriba.\n";

exit;

?>
