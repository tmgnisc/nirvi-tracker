<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Include email service
require_once 'email-service.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$dataFile = '../src/data/data.json';
$upcomingProjectsFile = '../data/upcoming-projects.json';

// Helper function to read JSON data
function readJsonData($file) {
    if (!file_exists($file)) {
        return [];
    }
    $content = file_get_contents($file);
    return json_decode($content, true) ?: [];
}

// Helper function to write JSON data
function writeJsonData($file, $data) {
    $json = json_encode($data, JSON_PRETTY_PRINT);
    return file_put_contents($file, $json) !== false;
}

// Helper function to generate new ID
function generateId($projects, $prefix = 'UP') {
    $maxNum = 0;
    foreach ($projects as $project) {
        if (preg_match('/^' . $prefix . '(\d+)$/', $project['id'], $matches)) {
            $maxNum = max($maxNum, intval($matches[1]));
        }
    }
    return $prefix . str_pad($maxNum + 1, 3, '0', STR_PAD_LEFT);
}

// Helper function to validate upcoming project data
function validateUpcomingProject($data, $isUpdate = false) {
    $required = ['name', 'client', 'description', 'deadline', 'techStack', 'status', 'assignedTo'];
    
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            return "Missing required field: $field";
        }
    }
    
    // Validate deadline
    if (!strtotime($data['deadline'])) {
        return "Invalid deadline format";
    }
    
    // Validate status
    $validStatuses = ['Upcoming', 'Under Development', 'Planning', 'Cancelled', 'Completed'];
    if (!in_array($data['status'], $validStatuses)) {
        return "Invalid status. Must be one of: " . implode(', ', $validStatuses);
    }
    
    // Validate assignedTo is array
    if (!is_array($data['assignedTo'])) {
        return "assignedTo must be an array";
    }
    
    return true;
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        $upcomingProjects = readJsonData($upcomingProjectsFile);
        echo json_encode(['success' => true, 'data' => $upcomingProjects]);
        break;
        
    case 'POST':
        $validation = validateUpcomingProject($input);
        if ($validation !== true) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $validation]);
            break;
        }
        
        $upcomingProjects = readJsonData($upcomingProjectsFile);
        $input['id'] = generateId($upcomingProjects);
        $input['createdAt'] = date('Y-m-d H:i:s');
        $input['updatedAt'] = date('Y-m-d H:i:s');
        
        $upcomingProjects[] = $input;
        
        if (writeJsonData($upcomingProjectsFile, $upcomingProjects)) {
            // Send email notifications to assigned team members
            sendProjectAssignmentEmails($input);
            
            echo json_encode(['success' => true, 'data' => $input]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to save upcoming project']);
        }
        break;
        
    case 'PUT':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Project ID is required']);
            break;
        }
        
        $projectId = $_GET['id'];
        $upcomingProjects = readJsonData($upcomingProjectsFile);
        
        $projectIndex = -1;
        foreach ($upcomingProjects as $index => $project) {
            if ($project['id'] === $projectId) {
                $projectIndex = $index;
                break;
            }
        }
        
        if ($projectIndex === -1) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Upcoming project not found']);
            break;
        }
        
        $validation = validateUpcomingProject($input, true);
        if ($validation !== true) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $validation]);
            break;
        }
        
        $input['id'] = $projectId; // Ensure ID doesn't change
        $input['updatedAt'] = date('Y-m-d H:i:s');
        
        // Preserve created date if it exists
        if (isset($upcomingProjects[$projectIndex]['createdAt'])) {
            $input['createdAt'] = $upcomingProjects[$projectIndex]['createdAt'];
        }
        
        $upcomingProjects[$projectIndex] = $input;
        
        if (writeJsonData($upcomingProjectsFile, $upcomingProjects)) {
            // Send email notifications to assigned team members
            sendProjectAssignmentEmails($input);
            
            echo json_encode(['success' => true, 'data' => $input]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to update upcoming project']);
        }
        break;
        
    case 'DELETE':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Project ID is required']);
            break;
        }
        
        $projectId = $_GET['id'];
        $upcomingProjects = readJsonData($upcomingProjectsFile);
        
        $projectIndex = -1;
        foreach ($upcomingProjects as $index => $project) {
            if ($project['id'] === $projectId) {
                $projectIndex = $index;
                break;
            }
        }
        
        if ($projectIndex === -1) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Upcoming project not found']);
            break;
        }
        
        $deletedProject = array_splice($upcomingProjects, $projectIndex, 1)[0];
        
        if (writeJsonData($upcomingProjectsFile, $upcomingProjects)) {
            echo json_encode(['success' => true, 'data' => $deletedProject]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to delete upcoming project']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        break;
}

/**
 * Send email notifications to assigned team members
 */
function sendProjectAssignmentEmails($projectData) {
    if (!isset($projectData['assignedTo']) || empty($projectData['assignedTo'])) {
        return; // No team members assigned
    }
    
    $emailService = new EmailService();
    
    // Send emails to all assigned team members
    $results = $emailService->sendBulkProjectAssignmentEmails($projectData['assignedTo'], $projectData);
    
    // Log email results (optional - you can remove this if not needed)
    error_log("Email notification results for project '{$projectData['name']}': " . json_encode($results));
}
?>
