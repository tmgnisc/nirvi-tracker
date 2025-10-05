<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'email-service.php';

// Test email functionality
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
        exit;
    }
    
    $emailService = new EmailService();
    
    // Test project data
    $testProject = [
        'name' => $input['projectName'] ?? 'Test Project',
        'client' => $input['client'] ?? 'Test Client',
        'description' => $input['description'] ?? 'This is a test project assignment to verify email functionality.',
        'techStack' => $input['techStack'] ?? ['PHP', 'React', 'MySQL'],
        'status' => $input['status'] ?? 'Upcoming',
        'deadline' => $input['deadline'] ?? '2024-12-31'
    ];
    
    $testMember = $input['memberName'] ?? 'Nischal Tamang';
    
    $result = $emailService->sendProjectAssignmentEmail($testMember, $testProject);
    
    echo json_encode($result);
} else {
    // Show test form
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>Email Test</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .form-group { margin: 15px 0; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input, textarea, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
            button { background: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background: #1d4ed8; }
            .result { margin-top: 20px; padding: 15px; border-radius: 4px; }
            .success { background: #d1fae5; border: 1px solid #10b981; color: #065f46; }
            .error { background: #fee2e2; border: 1px solid #ef4444; color: #991b1b; }
        </style>
    </head>
    <body>
        <h1>🧪 Email Notification Test</h1>
        <p>Test the email functionality by sending a project assignment email to a team member.</p>
        
        <form id="testForm">
            <div class="form-group">
                <label for="memberName">Team Member:</label>
                <select id="memberName" name="memberName" required>
                    <option value="Nischal Tamang">Nischal Tamang</option>
                    <option value="Sanjiv Magar">Sanjiv Magar</option>
                    <option value="Sudip Pradhan">Sudip Pradhan</option>
                    <option value="Saurav Shrestha">Saurav Shrestha</option>
                    <option value="Sonu Thapa Magar">Sonu Thapa Magar</option>
                    <option value="Sajesh Bajracharya">Sajesh Bajracharya</option>
                    <option value="Gaurab Bahadur Magar">Gaurab Bahadur Magar</option>
                    <option value="Dibin Pariyar">Dibin Pariyar</option>
                    <option value="Anil Buda Magar">Anil Buda Magar</option>
                    <option value="Dipsan Dhital">Dipsan Dhital</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="projectName">Project Name:</label>
                <input type="text" id="projectName" name="projectName" value="Email Test Project" required>
            </div>
            
            <div class="form-group">
                <label for="client">Client:</label>
                <input type="text" id="client" name="client" value="Test Client Inc." required>
            </div>
            
            <div class="form-group">
                <label for="description">Description:</label>
                <textarea id="description" name="description" rows="3">This is a test project assignment to verify that the email notification system is working correctly. Please confirm receipt of this email.</textarea>
            </div>
            
            <div class="form-group">
                <label for="techStack">Tech Stack (comma-separated):</label>
                <input type="text" id="techStack" name="techStack" value="PHP, React, MySQL, Email Testing" required>
            </div>
            
            <div class="form-group">
                <label for="status">Status:</label>
                <select id="status" name="status">
                    <option value="Upcoming">Upcoming</option>
                    <option value="Under Development">Under Development</option>
                    <option value="Planning">Planning</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="deadline">Deadline:</label>
                <input type="date" id="deadline" name="deadline" value="2024-12-31" required>
            </div>
            
            <button type="submit">Send Test Email</button>
        </form>
        
        <div id="result"></div>
        
        <script>
            document.getElementById('testForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const data = {
                    memberName: formData.get('memberName'),
                    projectName: formData.get('projectName'),
                    client: formData.get('client'),
                    description: formData.get('description'),
                    techStack: formData.get('techStack').split(',').map(s => s.trim()),
                    status: formData.get('status'),
                    deadline: formData.get('deadline')
                };
                
                try {
                    const response = await fetch('test-email.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    });
                    
                    const result = await response.json();
                    const resultDiv = document.getElementById('result');
                    
                    if (result.success) {
                        resultDiv.className = 'result success';
                        resultDiv.innerHTML = `<strong>✅ Success!</strong><br>${result.message}`;
                    } else {
                        resultDiv.className = 'result error';
                        resultDiv.innerHTML = `<strong>❌ Error:</strong><br>${result.message}`;
                    }
                } catch (error) {
                    const resultDiv = document.getElementById('result');
                    resultDiv.className = 'result error';
                    resultDiv.innerHTML = `<strong>❌ Error:</strong><br>Failed to send test email: ${error.message}`;
                }
            });
        </script>
        
        <div style="margin-top: 30px; padding: 20px; background: #f3f4f6; border-radius: 8px;">
            <h3>📋 How to Test:</h3>
            <ol>
                <li>Select a team member from the dropdown</li>
                <li>Fill in the project details (or use the defaults)</li>
                <li>Click "Send Test Email"</li>
                <li>Check the team member's email inbox</li>
            </ol>
            
            <h3>⚠️ Important Notes:</h3>
            <ul>
                <li>Make sure your server has PHP mail() function enabled</li>
                <li>For production, configure SMTP settings in the EmailService class</li>
                <li>Check server logs if emails are not being sent</li>
            </ul>
        </div>
    </body>
    </html>
    <?php
}
?>
