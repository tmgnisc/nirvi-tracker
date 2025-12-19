<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$conn = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        $sql = "SELECT * FROM projects ORDER BY id DESC";
        $result = $conn->query($sql);

        if (!$result) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to fetch projects: ' . $conn->error]);
            exit;
        }

        $projects = [];
        while ($row = $result->fetch_assoc()) {
            $projects[] = $row;
        }

        echo json_encode(['success' => true, 'data' => $projects]);
        break;

    case 'POST':
        if (!$input || !isset($input['name']) || trim($input['name']) === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing required field: name']);
            exit;
        }

        $name        = $conn->real_escape_string($input['name']);
        $url         = isset($input['url']) ? $conn->real_escape_string($input['url']) : null;
        $type        = isset($input['type']) ? $conn->real_escape_string($input['type']) : null;
        $techStack   = isset($input['tech_stack']) ? $conn->real_escape_string($input['tech_stack']) : null;
        $handledBy   = isset($input['handled_by']) ? $conn->real_escape_string($input['handled_by']) : null;
        $renewalDate = isset($input['renewal_date']) ? $conn->real_escape_string($input['renewal_date']) : null;
        $status      = isset($input['status']) ? $conn->real_escape_string($input['status']) : 'Active';
        $client      = isset($input['client']) ? $conn->real_escape_string($input['client']) : null;
        $description = isset($input['description']) ? $conn->real_escape_string($input['description']) : null;
        $assignedTo  = isset($input['assigned_to']) ? $conn->real_escape_string($input['assigned_to']) : null;
        $deadline    = isset($input['deadline']) ? $conn->real_escape_string($input['deadline']) : null;

        $sql = "
            INSERT INTO projects
                (name, url, type, tech_stack, handled_by, renewal_date, status, client, description, assigned_to, deadline)
            VALUES
                ('$name', " .
                ($url !== null ? "'$url'" : "NULL") . ", " .
                ($type !== null ? "'$type'" : "NULL") . ", " .
                ($techStack !== null ? "'$techStack'" : "NULL") . ", " .
                ($handledBy !== null ? "'$handledBy'" : "NULL") . ", " .
                ($renewalDate !== null ? "'$renewalDate'" : "NULL") . ", " .
                "'$status', " .
                ($client !== null ? "'$client'" : "NULL") . ", " .
                ($description !== null ? "'$description'" : "NULL") . ", " .
                ($assignedTo !== null ? "'$assignedTo'" : "NULL") . ", " .
                ($deadline !== null ? "'$deadline'" : "NULL") .
            ")
        ";

        if ($conn->query($sql)) {
            echo json_encode(['success' => true, 'data' => ['id' => $conn->insert_id]]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to create project: ' . $conn->error]);
        }
        break;

    case 'PUT':
        parse_str($_SERVER['QUERY_STRING'] ?? '', $query);
        if (!isset($query['id']) || !is_numeric($query['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Project id is required']);
            exit;
        }
        $id = (int) $query['id'];

        $fields = [];
        foreach ([
            'name', 'url', 'type', 'tech_stack',
            'handled_by', 'renewal_date', 'status',
            'client', 'description', 'assigned_to', 'deadline'
        ] as $field) {
            if (isset($input[$field])) {
                $value = $conn->real_escape_string($input[$field]);
                $fields[] = "$field = '$value'";
            }
        }

        if (empty($fields)) {
            echo json_encode(['success' => false, 'error' => 'No fields to update']);
            exit;
        }

        $sql = "UPDATE projects SET " . implode(', ', $fields) . " WHERE id = $id";

        if ($conn->query($sql)) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to update project: ' . $conn->error]);
        }
        break;

    case 'DELETE':
        parse_str($_SERVER['QUERY_STRING'] ?? '', $query);
        if (!isset($query['id']) || !is_numeric($query['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Project id is required']);
            exit;
        }
        $id = (int) $query['id'];

        $sql = "DELETE FROM projects WHERE id = $id";
        if ($conn->query($sql)) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to delete project: ' . $conn->error]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        break;
}

?>


