<?php
// Lightweight endpoint to save a course JSON to disk (prime-cursos/courses.json)
// Usage: POST JSON { course: { ... } }

header('Content-Type: application/json; charset=utf-8');

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
if (!$raw) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Empty body']);
    exit;
}

$data = json_decode($raw, true);
if (!is_array($data) || !isset($data['course']) || !is_array($data['course'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid payload']);
    exit;
}

$course = $data['course'];
// Basic validation
if (empty($course['title']) || !isset($course['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Course must include id and title']);
    exit;
}

$dir = __DIR__;
$file = $dir . DIRECTORY_SEPARATOR . 'courses.json';
$existing = [];
if (file_exists($file)) {
    $txt = file_get_contents($file);
    $j = json_decode($txt, true);
    if (is_array($j)) $existing = $j;
}

// Replace or add by id
$found = false;
foreach ($existing as $k => $c) {
    if (isset($c['id']) && strval($c['id']) === strval($course['id'])) {
        $existing[$k] = $course;
        $found = true;
        break;
    }
}
if (!$found) $existing[] = $course;

// Write atomically
$tmp = $file . '.tmp';
if (file_put_contents($tmp, json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to write file']);
    exit;
}
if (!rename($tmp, $file)) {
    // Try to fallback
    if (!copy($tmp, $file)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to commit file']);
        exit;
    }
    @unlink($tmp);
}

echo json_encode(['success' => true, 'saved' => $course['id']]);
exit;

?>
