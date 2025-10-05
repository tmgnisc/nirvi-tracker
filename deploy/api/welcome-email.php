<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once 'email-service.php';

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['memberName'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'memberName is required']);
    exit();
}

$memberName = $input['memberName'];

$service = new EmailService();
$result = $service->sendWelcomeEmail($memberName);
echo json_encode($result);
?>


