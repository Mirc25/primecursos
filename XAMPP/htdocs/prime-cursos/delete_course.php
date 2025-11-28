<?php
// delete_course.php
// Elimina un curso por `id` del archivo `courses.json` (usa write_json_atomic)
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/inc_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST'){
    http_response_code(405);
    echo json_encode(['success'=>false,'message'=>'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
if (!$raw){ http_response_code(400); echo json_encode(['success'=>false,'message'=>'Empty body']); exit; }

$data = json_decode($raw, true);
if (!is_array($data) || !isset($data['id'])){ http_response_code(400); echo json_encode(['success'=>false,'message'=>'Invalid payload - id required']); exit; }

$id = (string)$data['id'];
$coursesPath = __DIR__ . '/courses.json';
$courses = read_json($coursesPath);
if(!is_array($courses)) $courses = [];

$found = false;
$out = [];
foreach($courses as $c){ if(isset($c['id']) && strval($c['id']) === $id){ $found = true; continue; } $out[] = $c; }

if(!$found){ echo json_encode(['success'=>false,'message'=>'not_found']); exit; }

try{
    write_json_atomic($coursesPath, $out);
}catch(Exception $e){ http_response_code(500); echo json_encode(['success'=>false,'message'=>'write_failed','detail'=>$e->getMessage()]); exit; }

echo json_encode(['success'=>true,'deleted'=>$id]);
exit;

?>