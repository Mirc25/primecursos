<?php
// save_course.php
// Robust single handler: acepta payloads tanto con campos top-level
// ({"title":"...","price":...}) como con la forma {"course": {...}}
// Persiste en `courses.json` usando `inc_helpers::write_json_atomic`.

header('Content-Type: application/json; charset=utf-8');
session_start();
require_once __DIR__ . '/inc_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST'){
    http_response_code(405);
    echo json_encode(['success'=>false,'message'=>'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
if (!$raw){ http_response_code(400); echo json_encode(['success'=>false,'message'=>'Empty body']); exit; }

$data = json_decode($raw, true);
if (!is_array($data)) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'Invalid JSON']); exit; }

// Support both shapes: { course: {...} } or top-level fields
if (isset($data['course']) && is_array($data['course'])){
    $course = $data['course'];
} else {
    // treat $data as the course object
    $course = $data;
}

// Basic validation: title required
$title = isset($course['title']) ? trim((string)$course['title']) : '';
if ($title === ''){ http_response_code(400); echo json_encode(['success'=>false,'message'=>'title required']); exit; }

// Ensure id exists; keep numeric id behavior when existing dataset uses numeric ids
$coursesPath = __DIR__ . '/courses.json';
$courses = read_json($coursesPath);
if(!is_array($courses)) $courses = [];

// Normalize course fields
$course['title'] = $title;
if (isset($course['price'])) $course['price'] = is_numeric($course['price']) ? floatval($course['price']) : 0;
if (!isset($course['created_at'])) $course['created_at'] = date('c');

// Determine id strategy
$useNumeric = true;
foreach($courses as $c){ if(!isset($c['id']) || !is_numeric($c['id'])){ $useNumeric = false; break; } }
if (!isset($course['id']) || $course['id'] === ''){
    if ($useNumeric){ $max = 0; foreach($courses as $c){ $max = max($max, intval($c['id'])); } $course['id'] = $max + 1; }
    else {
        try{ $course['id'] = 'c_'.bin2hex(random_bytes(6)); }catch(Exception $e){ $course['id'] = 'c_'.dechex(mt_rand(100000,999999)); }
    }
}

// Replace existing by id or append
$found = false;
for($i=0;$i<count($courses);$i++){
    if (isset($courses[$i]['id']) && strval($courses[$i]['id']) === strval($course['id'])){
        $courses[$i] = $course; $found = true; break;
    }
}
if (!$found) $courses[] = $course;

// Persist using helper (respects PRIME_DATA_DIR override)
try{
    write_json_atomic($coursesPath, $courses);
}catch(Exception $e){ http_response_code(500); echo json_encode(['success'=>false,'message'=>'write_failed','detail'=>$e->getMessage()]); exit; }

// Return saved course and basic stats so the admin UI can confirm what was persisted
echo json_encode(['success'=>true,'saved'=> $course['id'], 'course' => $course, 'total_courses' => count($courses)]);
exit;

?>
