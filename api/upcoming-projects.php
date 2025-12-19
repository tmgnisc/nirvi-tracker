<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once __DIR__ . '/email-service.php';
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$conn = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

function normalizeUpcomingPayload($data): array
{
    $required = ['name', 'client', 'description', 'deadline', 'techStack', 'status', 'assignedTo'];

    foreach ($required as $field) {
        if (!isset($data[$field]) || $data[$field] === '' || $data[$field] === null) {
            throw new InvalidArgumentException("Missing required field: $field");
        }
    }

    if (!strtotime($data['deadline'])) {
        throw new InvalidArgumentException('Invalid deadline format');
    }

    $validStatuses = ['Upcoming', 'Under Development', 'Planning', 'Cancelled', 'Completed'];
    if (!in_array($data['status'], $validStatuses, true)) {
        throw new InvalidArgumentException('Invalid status. Must be one of: ' . implode(', ', $validStatuses));
    }

    if (!is_array($data['techStack'])) {
        $data['techStack'] = [$data['techStack']];
    }
    if (!is_array($data['assignedTo'])) {
        throw new InvalidArgumentException('assignedTo must be an array');
    }

    return $data;
}

function rowToUpcomingProject(array $row): array
{
    return [
        'id'         => $row['code'] ?? '',
        'name'       => $row['name'],
        'client'     => $row['client'],
        'description'=> $row['description'],
        'techStack'  => $row['tech_stack'] ? (json_decode($row['tech_stack'], true) ?: []) : [],
        'status'     => $row['status'],
        'deadline'   => $row['deadline'],
        'assignedTo' => $row['assigned_to'] ? (json_decode($row['assigned_to'], true) ?: []) : [],
        'createdAt'  => $row['created_at'],
        'updatedAt'  => $row['updated_at'],
    ];
}

function sendProjectAssignmentEmailsDb($projectData): void
{
    if (empty($projectData['assignedTo'])) {
        return;
    }
    $emailService = new EmailService();
    $emailService->sendBulkProjectAssignmentEmails($projectData['assignedTo'], $projectData);
}

switch ($method) {
    case 'GET':
        $result = $conn->query('SELECT * FROM upcoming_projects ORDER BY created_at DESC, id DESC');
        if (!$result) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to fetch upcoming projects: ' . $conn->error]);
            exit();
        }
        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $rows[] = rowToUpcomingProject($row);
        }
        echo json_encode(['success' => true, 'data' => $rows]);
        break;

    case 'POST':
        try {
            $data = normalizeUpcomingPayload($input ?? []);
        } catch (InvalidArgumentException $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            break;
        }

        // Generate new code like UP001
        $res = $conn->query("SELECT code FROM upcoming_projects WHERE code LIKE 'UP%' ORDER BY id DESC LIMIT 1");
        $lastCode = null;
        if ($res && $row = $res->fetch_assoc()) {
            $lastCode = $row['code'];
        }
        $nextNum = 1;
        if ($lastCode && preg_match('/^UP(\d+)$/', $lastCode, $m)) {
            $nextNum = (int)$m[1] + 1;
        }
        $code = 'UP' . str_pad($nextNum, 3, '0', STR_PAD_LEFT);

        $stmt = $conn->prepare("
            INSERT INTO upcoming_projects
                (code, name, client, description, tech_stack, status, deadline, assigned_to, created_at, updated_at)
            VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        ");
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to prepare insert: ' . $conn->error]);
            break;
        }

        $techStackJson  = json_encode($data['techStack']);
        $assignedToJson = json_encode($data['assignedTo']);

        $stmt->bind_param(
            'ssssssss',
            $code,
            $data['name'],
            $data['client'],
            $data['description'],
            $techStackJson,
            $data['status'],
            $data['deadline'],
            $assignedToJson
        );

        if (!$stmt->execute()) {
            $stmt->close();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to save upcoming project: ' . $stmt->error]);
            break;
        }
        $stmt->close();

        $id = $conn->insert_id;
        $res = $conn->query("SELECT * FROM upcoming_projects WHERE id = " . (int)$id);
        $row = $res->fetch_assoc();
        $project = rowToUpcomingProject($row);

        sendProjectAssignmentEmailsDb($project);

        echo json_encode(['success' => true, 'data' => $project]);
        break;

    case 'PUT':
        if (!isset($_GET['id']) || $_GET['id'] === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Project ID is required']);
            break;
        }
        $code = $_GET['id'];

        $stmt = $conn->prepare('SELECT * FROM upcoming_projects WHERE code = ?');
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to prepare select: ' . $conn->error]);
            break;
        }
        $stmt->bind_param('s', $code);
        $stmt->execute();
        $res = $stmt->get_result();
        $existing = $res->fetch_assoc();
        $stmt->close();

        if (!$existing) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Upcoming project not found']);
            break;
        }

        $payload = array_merge(
            rowToUpcomingProject($existing),
            $input ?? []
        );

        try {
            $data = normalizeUpcomingPayload($payload);
        } catch (InvalidArgumentException $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            break;
        }

        $stmt = $conn->prepare("
            UPDATE upcoming_projects
            SET name = ?, client = ?, description = ?, tech_stack = ?, status = ?, deadline = ?, assigned_to = ?, updated_at = NOW()
            WHERE code = ?
        ");
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to prepare update: ' . $conn->error]);
            break;
        }

        $techStackJson  = json_encode($data['techStack']);
        $assignedToJson = json_encode($data['assignedTo']);

        $stmt->bind_param(
            'ssssssss',
            $data['name'],
            $data['client'],
            $data['description'],
            $techStackJson,
            $data['status'],
            $data['deadline'],
            $assignedToJson,
            $code
        );

        if (!$stmt->execute()) {
            $stmt->close();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to update upcoming project: ' . $stmt->error]);
            break;
        }
        $stmt->close();

        $res = $conn->query("SELECT * FROM upcoming_projects WHERE code = '" . $conn->real_escape_string($code) . "'");
        $row = $res->fetch_assoc();
        $project = rowToUpcomingProject($row);

        sendProjectAssignmentEmailsDb($project);

        echo json_encode(['success' => true, 'data' => $project]);
        break;

    case 'DELETE':
        if (!isset($_GET['id']) || $_GET['id'] === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Project ID is required']);
            break;
        }
        $code = $_GET['id'];

        $stmt = $conn->prepare('SELECT * FROM upcoming_projects WHERE code = ?');
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to prepare select: ' . $conn->error]);
            break;
        }
        $stmt->bind_param('s', $code);
        $stmt->execute();
        $res = $stmt->get_result();
        $existing = $res->fetch_assoc();
        $stmt->close();

        if (!$existing) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Upcoming project not found']);
            break;
        }

        $stmt = $conn->prepare('DELETE FROM upcoming_projects WHERE code = ?');
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to prepare delete: ' . $conn->error]);
            break;
        }
        $stmt->bind_param('s', $code);
        if (!$stmt->execute()) {
            $stmt->close();
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to delete upcoming project: ' . $stmt->error]);
            break;
        }
        $stmt->close();

        $project = rowToUpcomingProject($existing);
        echo json_encode(['success' => true, 'data' => $project]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        break;
}

?>
