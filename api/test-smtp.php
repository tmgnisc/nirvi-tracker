<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'email-service.php';

// Test SMTP connection
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
        exit;
    }
    
    $emailService = new EmailService();
    
    // Test project data
    $testProject = [
        'name' => $input['projectName'] ?? 'SMTP Test Project',
        'client' => $input['client'] ?? 'Test Client',
        'description' => $input['description'] ?? 'This is a test to verify SMTP email functionality is working correctly.',
        'techStack' => $input['techStack'] ?? ['PHP', 'SMTP', 'Email Testing'],
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
        <title>SMTP Email Test</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 700px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
            .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #2563eb; margin: 0; }
            .header p { color: #6b7280; margin: 10px 0 0 0; }
            .form-group { margin: 20px 0; }
            label { display: block; margin-bottom: 8px; font-weight: bold; color: #374151; }
            input, textarea, select { width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 6px; font-size: 14px; }
            input:focus, textarea:focus, select:focus { outline: none; border-color: #2563eb; }
            button { background: #2563eb; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; width: 100%; margin-top: 10px; }
            button:hover { background: #1d4ed8; }
            .result { margin-top: 20px; padding: 15px; border-radius: 6px; }
            .success { background: #d1fae5; border: 2px solid #10b981; color: #065f46; }
            .error { background: #fee2e2; border: 2px solid #ef4444; color: #991b1b; }
            .info { background: #dbeafe; border: 2px solid #3b82f6; color: #1e40af; margin-bottom: 20px; padding: 15px; border-radius: 6px; }
            .config-display { background: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 20px; font-family: monospace; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔧 SMTP Email Test</h1>
                <p>Test your Roundcube email configuration</p>
            </div>
            
            <div class="info">
                <strong>📧 Current Configuration:</strong><br>
                Sender: noreply@nirvixtech.com<br>
                SMTP Host: mail.nirvixtech.com<br>
                SMTP Port: 465 (SSL)<br>
                Authentication: Enabled<br>
                <strong style="color: #10b981;">✅ Ready for testing!</strong>
            </div>
            
            <div class="config-display">
                <strong>📋 Team Members Available for Testing:</strong><br>
                • Nischal Tamang: tamangnischal2018@gmail.com<br>
                • Sanjiv Magar: sanzivmagat80@gmail.com<br>
                • Sudip Pradhan: sudippradhanadgj@gmail.com<br>
                • Saurav Shrestha: sauravstha486@gmail.com<br>
                • Dibin Pariyar: dibinsunam145@gmail.com<br>
                • Anil Buda Magar: magaraneel35@gmail.com<br>
                • Sajesh Bajracharya: sajesh.bajracharya.01@gmail.com<br>
                • Gaurab Bahadur Magar: magargaurav2080@gmail.com<br>
                • Dipsan Dhital: dipsandhital12@gmail.com
            </div>
            
            <form id="testForm">
                <div class="form-group">
                    <label for="memberName">👤 Select Team Member to Test:</label>
                    <select id="memberName" name="memberName" required>
                        <option value="Nischal Tamang">Nischal Tamang (tamangnischal2018@gmail.com)</option>
                        <option value="Sanjiv Magar">Sanjiv Magar (sanzivmagat80@gmail.com)</option>
                        <option value="Sudip Pradhan">Sudip Pradhan (sudippradhanadgj@gmail.com)</option>
                        <option value="Saurav Shrestha">Saurav Shrestha (sauravstha486@gmail.com)</option>
                        <option value="Dibin Pariyar">Dibin Pariyar (dibinsunam145@gmail.com)</option>
                        <option value="Anil Buda Magar">Anil Buda Magar (magaraneel35@gmail.com)</option>
                        <option value="Sajesh Bajracharya">Sajesh Bajracharya (sajesh.bajracharya.01@gmail.com)</option>
                        <option value="Gaurab Bahadur Magar">Gaurab Bahadur Magar (magargaurav2080@gmail.com)</option>
                        <option value="Dipsan Dhital">Dipsan Dhital (dipsandhital12@gmail.com)</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="projectName">📋 Project Name:</label>
                    <input type="text" id="projectName" name="projectName" value="SMTP Email Test Project" required>
                </div>
                
                <div class="form-group">
                    <label for="client">🏢 Client:</label>
                    <input type="text" id="client" name="client" value="Nirvix Tech" required>
                </div>
                
                <div class="form-group">
                    <label for="description">📝 Description:</label>
                    <textarea id="description" name="description" rows="3" required>This is a test email to verify that the SMTP configuration is working correctly. If you receive this email, the email notification system is fully operational!</textarea>
                </div>
                
                <div class="form-group">
                    <label for="techStack">⚙️ Tech Stack (comma-separated):</label>
                    <input type="text" id="techStack" name="techStack" value="PHP, SMTP, Email Testing, Roundcube" required>
                </div>
                
                <div class="form-group">
                    <label for="status">📊 Status:</label>
                    <select id="status" name="status">
                        <option value="Upcoming">Upcoming</option>
                        <option value="Under Development">Under Development</option>
                        <option value="Planning">Planning</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="deadline">📅 Deadline:</label>
                    <input type="date" id="deadline" name="deadline" value="2024-12-31" required>
                </div>
                
                <button type="submit">🚀 Send SMTP Test Email</button>
            </form>
            
            <div id="result"></div>
            
            <div style="margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px;">
                <h3>🔍 What This Test Does:</h3>
                <ul>
                    <li>✅ Tests SMTP connection to mail.nirvixtech.com:587</li>
                    <li>✅ Verifies authentication with your credentials</li>
                    <li>✅ Sends a professional HTML email</li>
                    <li>✅ Delivers to the selected team member's Gmail</li>
                </ul>
                
                <h3>⚠️ Troubleshooting:</h3>
                <ul>
                    <li>If test fails, check your SMTP server settings</li>
                    <li>Verify your email password is correct</li>
                    <li>Check if your hosting provider allows SMTP connections</li>
                    <li>Try alternative ports (465 for SSL) if 587 doesn't work</li>
                </ul>
            </div>
        </div>
        
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
                    const response = await fetch('test-smtp.php', {
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
                        resultDiv.innerHTML = `<strong>✅ Success!</strong><br>${result.message}<br><br><strong>📧 Check the team member's Gmail inbox!</strong>`;
                    } else {
                        resultDiv.className = 'result error';
                        resultDiv.innerHTML = `<strong>❌ SMTP Error:</strong><br>${result.message}<br><br><strong>💡 Try checking your SMTP settings or contact your hosting provider.</strong>`;
                    }
                } catch (error) {
                    const resultDiv = document.getElementById('result');
                    resultDiv.className = 'result error';
                    resultDiv.innerHTML = `<strong>❌ Connection Error:</strong><br>Failed to connect to server: ${error.message}`;
                }
            });
        </script>
    </body>
    </html>
    <?php
}
?>
