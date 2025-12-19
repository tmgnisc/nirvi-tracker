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

$result = $conn->query('SELECT * FROM domains ORDER BY name ASC');
if (!$result) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to fetch domains: ' . $conn->error]);
    exit();
}

$domains = [];
while ($row = $result->fetch_assoc()) {
    $domains[] = [
        'name'        => $row['name'],
        'renewalDate' => $row['renewal_date'],
        'status'      => $row['status'],
    ];
}

echo json_encode(['success' => true, 'data' => $domains]);


