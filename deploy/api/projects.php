<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once 'email-service.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$deployDataFile = '../src-data/data.json'; // for production deploy
$devDataFile = '../../src/data/data.json';  // for local dev

function readJsonData($file) {
    if (!file_exists($file)) {
        return [];
    }
    $content = file_get_contents($file);
    return json_decode($content, true) ?: [];
}

function writeJsonData($file, $data) {
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    return file_put_contents($file, $json) !== false;
}

function loadData() {
    global $deployDataFile, $devDataFile;
    // Prefer deploy file if exists, fall back to dev
    $data = readJsonData($deployDataFile);
    if (empty($data)) {
        $data = readJsonData($devDataFile);
    }
    if (!isset($data['projects'])) {
        $data['projects'] = [];
    }
    return $data;
}

function persistData($data) {
    global $deployDataFile, $devDataFile;
    $ok1 = writeJsonData($deployDataFile, $data);
    $ok2 = writeJsonData($devDataFile, $data);
    return $ok1 && $ok2;
}

function normalizeProject($p) {
    // Ensure consistent fields
    $defaults = [
        'name' => '',
        'url' => '',
        'type' => '',
        'techStack' => [], // array
        'handledBy' => '',
        'renewalDate' => '',
        'status' => 'Active',
        // Optional metadata
        'client' => '',
        'description' => '',
        'assignedTo' => [],
        'deadline' => '',
    ];
    $merged = array_merge($defaults, $p ?: []);
    // Coerce techStack to array if string provided
    if (is_string($merged['techStack'])) {
        $merged['techStack'] = array_values(array_filter(array_map('trim', explode(',', (string)$merged['techStack']))));
    }
    if (!is_array($merged['techStack'])) {
        $merged['techStack'] = [];
    }
    if (!isset($merged['assignedTo']) || !is_array($merged['assignedTo'])) {
        $merged['assignedTo'] = [];
    }
    return $merged;
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        $data = loadData();
        echo json_encode(['success' => true, 'data' => $data['projects']]);
        break;

    case 'POST':
        if (!$input || !isset($input['name']) || trim($input['name']) === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing required field: name']);
            break;
        }
        $data = loadData();
        // Prevent duplicate by name
        foreach ($data['projects'] as $proj) {
            if (isset($proj['name']) && strtolower($proj['name']) === strtolower($input['name'])) {
                http_response_code(409);
                echo json_encode(['success' => false, 'error' => 'Project with this name already exists']);
                exit;
            }
        }
        $project = normalizeProject($input);
        $data['projects'][] = $project;
        if (persistData($data)) {
            if (!empty($project['assignedTo'])) {
                $emailService = new EmailService();
                $emailService->sendBulkProjectAssignmentEmails($project['assignedTo'], $project);
            }
            echo json_encode(['success' => true, 'data' => $project]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to save project']);
        }
        break;

    case 'PUT':
        if (!isset($_GET['name']) || trim($_GET['name']) === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Project name is required']);
            break;
        }
        $targetName = $_GET['name'];
        $data = loadData();
        $index = -1;
        foreach ($data['projects'] as $i => $proj) {
            if (isset($proj['name']) && strtolower($proj['name']) === strtolower($targetName)) {
                $index = $i;
                break;
            }
        }
        if ($index === -1) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Project not found']);
            break;
        }
        $updated = array_merge($data['projects'][$index], $input ?: []);
        $updated = normalizeProject($updated);
        // Enforce name immutability unless explicitly changing via input
        if (!isset($input['name']) || trim($input['name']) === '') {
            $updated['name'] = $data['projects'][$index]['name'];
        }
        $data['projects'][$index] = $updated;
        if (persistData($data)) {
            if (!empty($updated['assignedTo'])) {
                $emailService = new EmailService();
                $emailService->sendBulkProjectAssignmentEmails($updated['assignedTo'], $updated);
            }
            echo json_encode(['success' => true, 'data' => $updated]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to update project']);
        }
        break;

    case 'DELETE':
        if (!isset($_GET['name']) || trim($_GET['name']) === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Project name is required']);
            break;
        }
        $targetName = $_GET['name'];
        $data = loadData();
        $index = -1;
        foreach ($data['projects'] as $i => $proj) {
            if (isset($proj['name']) && strtolower($proj['name']) === strtolower($targetName)) {
                $index = $i;
                break;
            }
        }
        if ($index === -1) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Project not found']);
            break;
        }
        $deleted = array_splice($data['projects'], $index, 1)[0];
        if (persistData($data)) {
            echo json_encode(['success' => true, 'data' => $deleted]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to delete project']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        break;
}
?>


