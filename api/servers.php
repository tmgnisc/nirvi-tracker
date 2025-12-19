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

$result = $conn->query('SELECT * FROM servers ORDER BY id ASC');
if (!$result) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to fetch servers: ' . $conn->error]);
    exit();
}

$servers = [];
while ($row = $result->fetch_assoc()) {
    $servers[] = [
        'name'       => $row['name'],
        'ip'         => $row['ip'],
        'url'        => $row['url'],
        'nameservers'=> $row['nameservers'] ? (json_decode($row['nameservers'], true) ?: []) : [],
        'websites'   => $row['websites'] ? (json_decode($row['websites'], true) ?: []) : [],
    ];
}

echo json_encode(['success' => true, 'data' => $servers]);


