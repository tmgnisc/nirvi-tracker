<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$conn = getDbConnection();

$result = $conn->query('SELECT * FROM team ORDER BY id ASC');
if (!$result) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to fetch team: ' . $conn->error]);
    exit();
}

$team = [];
while ($row = $result->fetch_assoc()) {
    $team[] = [
        'name'   => $row['name'],
        'role'   => $row['role'],
        'email'  => $row['email'],
        'skills' => $row['skills'] ? (json_decode($row['skills'], true) ?: []) : [],
        'avatar' => $row['avatar'],
    ];
}

echo json_encode(['success' => true, 'data' => $team]);


