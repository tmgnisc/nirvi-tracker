<?php

class EmailService {
    private $teamDataFile;
    private $config;
    private $fromEmail;
    private $fromName;

    public function __construct() {
        $this->teamDataFile = '../src/data/data.json';
        
        // Load email configuration
        $this->config = include 'email-config.php';
        $this->fromEmail = $this->config['from_email'];
        $this->fromName = $this->config['from_name'];
    }

    // ===== ADD THIS NEW METHOD HERE =====
    private function logDebug($message) {
        $logFile = __DIR__ . '/email-debug.log';
        $timestamp = date('Y-m-d H:i:s');
        file_put_contents($logFile, "[$timestamp] $message\n", FILE_APPEND);
    }
    // ===== END OF NEW METHOD =====

    /**
     * Get team member email by name
     */
    private function getTeamMemberEmail($memberName) {
        if (!file_exists($this->teamDataFile)) {
            return null;
        }

        $data = json_decode(file_get_contents($this->teamDataFile), true);
        
        if (!$data || !isset($data['team'])) {
            return null;
        }

        foreach ($data['team'] as $member) {
            if ($member['name'] === $memberName && isset($member['email'])) {
                return $member['email'];
            }
        }

        return null;
    }

    /**
     * Send project assignment email to team member
     */
    public function sendProjectAssignmentEmail($memberName, $projectData) {
        $memberEmail = $this->getTeamMemberEmail($memberName);
        
        if (!$memberEmail) {
            return [
                'success' => false,
                'message' => "Email not found for team member: {$memberName}"
            ];
        }

        $subject = $this->config['templates']['project_assignment']['subject_prefix'] . $projectData['name'];
        
        // Create HTML email template
        $htmlBody = $this->createProjectAssignmentTemplate($memberName, $projectData);
        
        // Create plain text version
        $textBody = $this->createProjectAssignmentTextTemplate($memberName, $projectData);

        // Check if SMTP is configured
        if (isset($this->config['smtp']) && !empty($this->config['smtp'])) {
            return $this->sendEmailViaSMTP($memberEmail, $subject, $htmlBody, $textBody);
        } else {
            return $this->sendEmailViaPHPMail($memberEmail, $subject, $htmlBody, $textBody);
        }
    }

    /**
     * Send email using PHP mail() function
     */
    private function sendEmailViaPHPMail($to, $subject, $htmlBody, $textBody) {
        // Set headers for HTML email
        $headers = [
            'From' => "{$this->fromName} <{$this->fromEmail}>",
            'Reply-To' => $this->fromEmail,
            'X-Mailer' => 'PHP/' . phpversion(),
            'MIME-Version' => '1.0',
            'Content-Type' => 'multipart/alternative; boundary="boundary123"'
        ];

        // Create multipart email body
        $emailBody = "--boundary123\r\n";
        $emailBody .= "Content-Type: text/plain; charset=UTF-8\r\n\r\n";
        $emailBody .= $textBody . "\r\n\r\n";
        $emailBody .= "--boundary123\r\n";
        $emailBody .= "Content-Type: text/html; charset=UTF-8\r\n\r\n";
        $emailBody .= $htmlBody . "\r\n\r\n";
        $emailBody .= "--boundary123--";

        // Send email
        $mailSent = mail($to, $subject, $emailBody, implode("\r\n", $headers));

        if ($mailSent) {
            return [
                'success' => true,
                'message' => "Email sent successfully to {$to} (via PHP mail)"
            ];
        } else {
            return [
                'success' => false,
                'message' => "Failed to send email to {$to} (via PHP mail)"
            ];
        }
    }

    /**
     * Send email using SMTP
     * THIS ENTIRE METHOD IS REPLACED WITH DEBUGGING VERSION
     */
    private function sendEmailViaSMTP($to, $subject, $htmlBody, $textBody) {
        $smtp = $this->config['smtp'];
        
        $this->logDebug("=== Starting SMTP Send ===");
        $this->logDebug("To: $to");
        $this->logDebug("Subject: $subject");
        $this->logDebug("SMTP Host: {$smtp['host']}:{$smtp['port']}");
        $this->logDebug("SMTP User: {$smtp['username']}");
        $this->logDebug("SMTP Encryption: {$smtp['encryption']}");
        
        // Create socket connection with SSL context for port 465
        if ($smtp['encryption'] == 'ssl') {
            $context = stream_context_create([
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                ]
            ]);
            
            $socket = stream_socket_client(
                "ssl://{$smtp['host']}:{$smtp['port']}", 
                $errno, 
                $errstr, 
                30, 
                STREAM_CLIENT_CONNECT, 
                $context
            );
        } else {
            // For TLS (port 587)
            $socket = fsockopen($smtp['host'], $smtp['port'], $errno, $errstr, 30);
        }
        
        if (!$socket) {
            $this->logDebug("ERROR: Failed to connect - $errstr ($errno)");
            return [
                'success' => false,
                'message' => "Failed to connect to SMTP server: {$errstr} ({$errno})"
            ];
        }

        $this->logDebug("Socket connected successfully");

        // Read initial response
        $response = fgets($socket);
        $this->logDebug("Initial Response: " . trim($response));
        
        if (substr($response, 0, 3) != '220') {
            fclose($socket);
            $this->logDebug("ERROR: Bad initial response");
            return [
                'success' => false,
                'message' => "SMTP server error: {$response}"
            ];
        }

      // Send EHLO command
$hostname = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost';
fputs($socket, "EHLO {$hostname}\r\n");

// Read ALL EHLO responses (Gmail sends multiple lines)
do {
    $response = fgets($socket);
    $this->logDebug("EHLO Response: " . trim($response));
} while (substr($response, 3, 1) == '-'); // Continue while response has a dash after code

// Start TLS if required (for port 587)
if ($smtp['encryption'] == 'tls') {
    fputs($socket, "STARTTLS\r\n");
    $response = fgets($socket);
    $this->logDebug("STARTTLS Response: " . trim($response));
    
    if (substr($response, 0, 3) != '220') {
        fclose($socket);
        $this->logDebug("ERROR: TLS handshake failed");
        return [
            'success' => false,
            'message' => "TLS handshake failed: {$response}"
        ];
    }
    
    // Enable crypto
    stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
    
    // Send EHLO again after TLS
    fputs($socket, "EHLO {$hostname}\r\n");
    
    // Read ALL EHLO responses again
    do {
        $response = fgets($socket);
        $this->logDebug("EHLO after TLS: " . trim($response));
    } while (substr($response, 3, 1) == '-');
}

        // Authenticate if required
        if ($smtp['auth']) {
            fputs($socket, "AUTH LOGIN\r\n");
            $response = fgets($socket);
            $this->logDebug("AUTH LOGIN Response: " . trim($response));
            
            if (substr($response, 0, 3) == '334') {
                fputs($socket, base64_encode($smtp['username']) . "\r\n");
                $response = fgets($socket);
                $this->logDebug("Username Response: " . trim($response));
                
                if (substr($response, 0, 3) == '334') {
                    fputs($socket, base64_encode($smtp['password']) . "\r\n");
                    $response = fgets($socket);
                    $this->logDebug("Password Response: " . trim($response));
                    
                    if (substr($response, 0, 3) != '235') {
                        fclose($socket);
                        $this->logDebug("ERROR: Authentication failed");
                        return [
                            'success' => false,
                            'message' => "SMTP authentication failed: {$response}"
                        ];
                    }
                }
            }
        }

        $this->logDebug("Authentication successful");

        // Send MAIL FROM
        fputs($socket, "MAIL FROM: <{$this->fromEmail}>\r\n");
        $response = fgets($socket);
        $this->logDebug("MAIL FROM Response: " . trim($response));

        // Send RCPT TO
        fputs($socket, "RCPT TO: <{$to}>\r\n");
        $response = fgets($socket);
        $this->logDebug("RCPT TO Response: " . trim($response));

        // Send DATA
        fputs($socket, "DATA\r\n");
        $response = fgets($socket);
        $this->logDebug("DATA Response: " . trim($response));

        // Send email headers and body
        $emailData = "From: {$this->fromName} <{$this->fromEmail}>\r\n";
        $emailData .= "To: {$to}\r\n";
        $emailData .= "Subject: {$subject}\r\n";
        $emailData .= "MIME-Version: 1.0\r\n";
        $emailData .= "Content-Type: multipart/alternative; boundary=\"boundary123\"\r\n\r\n";
        
        $emailData .= "--boundary123\r\n";
        $emailData .= "Content-Type: text/plain; charset=UTF-8\r\n\r\n";
        $emailData .= $textBody . "\r\n\r\n";
        
        $emailData .= "--boundary123\r\n";
        $emailData .= "Content-Type: text/html; charset=UTF-8\r\n\r\n";
        $emailData .= $htmlBody . "\r\n\r\n";
        $emailData .= "--boundary123--\r\n";
        
        $emailData .= ".\r\n";
        
        fputs($socket, $emailData);
        $response = fgets($socket);
        $this->logDebug("Send Response: " . trim($response));

        // Send QUIT
        fputs($socket, "QUIT\r\n");
        fclose($socket);

        if (substr($response, 0, 3) == '250') {
            $this->logDebug("SUCCESS: Email sent");
            $this->logDebug("=== End SMTP Send ===\n");
            return [
                'success' => true,
                'message' => "Email sent successfully to {$to} (via SMTP SSL)"
            ];
        } else {
            $this->logDebug("ERROR: Send failed - " . trim($response));
            $this->logDebug("=== End SMTP Send ===\n");
            return [
                'success' => false,
                'message' => "SMTP send failed: {$response}"
            ];
        }
    }

    /**
     * Create HTML email template
     */
    private function createProjectAssignmentTemplate($memberName, $projectData) {
        $techStack = is_array($projectData['techStack']) 
            ? implode(', ', $projectData['techStack']) 
            : $projectData['techStack'];

        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Project Assignment</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
                .project-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .project-title { color: #2563eb; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                .project-detail { margin: 10px 0; }
                .label { font-weight: bold; color: #374151; }
                .tech-stack { background: #e5e7eb; padding: 8px 12px; border-radius: 4px; display: inline-block; }
                .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .button { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🚀 New Project Assignment</h1>
                    <p>You've been assigned to a new project!</p>
                </div>
                
                <div class='content'>
                    <p>Hello <strong>{$memberName}</strong>,</p>
                    
                    <p>You have been assigned to a new project. Here are the details:</p>
                    
                    <div class='project-card'>
                        <div class='project-title'>{$projectData['name']}</div>
                        
                        <div class='project-detail'>
                            <span class='label'>Client:</span> {$projectData['client']}
                        </div>
                        
                        <div class='project-detail'>
                            <span class='label'>Status:</span> {$projectData['status']}
                        </div>
                        
                        <div class='project-detail'>
                            <span class='label'>Deadline:</span> {$projectData['deadline']}
                        </div>
                        
                        <div class='project-detail'>
                            <span class='label'>Tech Stack:</span>
                            <span class='tech-stack'>{$techStack}</span>
                        </div>
                        
                        <div class='project-detail'>
                            <span class='label'>Description:</span><br>
                            {$projectData['description']}
                        </div>
                    </div>
                    
                    <p>Please log into the project management system to view more details and start working on this project.</p>
                    
                    <div style='text-align: center;'>
                        <a href='https://nirvi-tracker.nirvixtech.com/' class='button'>View Project Details</a>
                    </div>
                </div>
                
                <div class='footer'>
                    <p>This is an automated message from Nirvix Project Management System.</p>
                    <p>If you have any questions, please contact your project manager.</p>
                </div>
            </div>
        </body>
        </html>";
    }

    /**
     * Create plain text email template
     */
    private function createProjectAssignmentTextTemplate($memberName, $projectData) {
        $techStack = is_array($projectData['techStack']) 
            ? implode(', ', $projectData['techStack']) 
            : $projectData['techStack'];

        return "
NEW PROJECT ASSIGNMENT

Hello {$memberName},

You have been assigned to a new project. Here are the details:

Project: {$projectData['name']}
Client: {$projectData['client']}
Status: {$projectData['status']}
Deadline: {$projectData['deadline']}
Tech Stack: {$techStack}

Description:
{$projectData['description']}

Please log into the project management system to view more details and start working on this project.

This is an automated message from Nirvix Project Management System.
If you have any questions, please contact your project manager.

Best regards,
Nirvix Team
        ";
    }

    /**
     * Send welcome email to a team member
     */
    public function sendWelcomeEmail(string $memberName): array {
        $memberEmail = $this->getTeamMemberEmail($memberName);
        if (!$memberEmail) {
            return [
                'success' => false,
                'message' => "Email not found for team member: {$memberName}"
            ];
        }

        $subject = '🎉 Welcome to Nirvix Technology';
        $htmlBody = $this->createWelcomeEmailTemplate($memberName);
        $textBody = $this->createWelcomeEmailTextTemplate($memberName);

        if (isset($this->config['smtp']) && !empty($this->config['smtp'])) {
            return $this->sendEmailViaSMTP($memberEmail, $subject, $htmlBody, $textBody);
        }
        return $this->sendEmailViaPHPMail($memberEmail, $subject, $htmlBody, $textBody);
    }

    /**
     * Welcome email HTML template
     */
    private function createWelcomeEmailTemplate(string $memberName): string {
        $companyName = $this->config['templates']['project_assignment']['company_name'] ?? 'Nirvix';
        $supportEmail = 'info@nirvixtech.com';
        $dashboardUrl = 'https://nirvi-tracker.nirvixtech.com/';
        $logoUrl = 'https://nirvi-tracker.nirvixtech.com/assets/logo-C4_mMeMf.png';
        $currentYear = date('Y');
        
        return <<<HTML
   <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to {$companyName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #1e293b;
            padding: 40px 20px;
        }
        .email-container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .header { 
            background: #ffffff;
            padding: 48px 32px;
            text-align: center;
        }
        .logo-wrapper {
    background: #ffffff;
    width: 80px;
    height: 80px;
    border-radius: 20px;
    display: flex;  /* Changed from inline-flex */
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;  /* Added auto horizontal margins */
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    overflow: hidden;
}
.logo-wrapper img {
    width: 72px;
    height: 72px;
    object-fit: contain;
}
        .header-title {
            color: #0ea5e9;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            line-height: 1.2;
        }
        .header-subtitle {
            color: #0ea5e9;
            font-size: 16px;
            font-weight: 400;
        }
        .content {
            padding: 48px 32px;
            background: #ffffff;
        }
        .welcome-badge {
            display: inline-block;
            background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
            color: #0369a1;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 24px;
            letter-spacing: 0.5px;
        }
        .greeting {
            font-size: 18px;
            color: #1e293b;
            margin-bottom: 16px;
            line-height: 1.6;
        }
        .greeting strong {
            color: #0ea5e9;
            font-weight: 700;
        }
        .main-text {
            font-size: 16px;
            color: #475569;
            line-height: 1.7;
            margin-bottom: 24px;
        }
        .features-title {
            font-size: 17px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 16px;
        }
        .features-list {
            list-style: none;
            margin: 0 0 32px 0;
            padding: 0;
        }
        .features-list li {
            padding: 12px 0 12px 32px;
            color: #475569;
            font-size: 15px;
            line-height: 1.6;
            position: relative;
            border-bottom: 1px solid #f1f5f9;
        }
        .features-list li:last-child {
            border-bottom: none;
        }
        .features-list li::before {
            content: '✓';
            position: absolute;
            left: 0;
            top: 12px;
            width: 20px;
            height: 20px;
            background: #0ea5e9;
            color: #ffffff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
        }
        .cta-wrapper {
            text-align: center;
            margin: 32px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
        }
        .support-text {
            font-size: 14px;
            color: #64748b;
            line-height: 1.6;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 2px solid #f1f5f9;
        }
        .support-text a {
            color: #0ea5e9;
            text-decoration: none;
            font-weight: 600;
        }
        .footer {
            background: #f8fafc;
            padding: 32px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer-text {
            font-size: 13px;
            color: #94a3b8;
            line-height: 1.6;
        }
        .social-links {
            margin-top: 20px;
        }
        .social-links a {
            display: inline-block;
            margin: 0 8px;
            color: #64748b;
            text-decoration: none;
            font-size: 12px;
        }
        
        @media only screen and (max-width: 600px) {
            body { padding: 20px 10px; }
            .content { padding: 32px 24px; }
            .header { padding: 32px 24px; }
            .header-title { font-size: 24px; }
            .cta-button { padding: 14px 28px; font-size: 15px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo-wrapper">
                <img src="{$logoUrl}" alt="{$companyName} Logo" />
            </div>
            <div class="header-title">Welcome to {$companyName}</div>
            <div class="header-subtitle">We're excited to have you on board</div>
        </div>
        
        <div class="content">
            <div class="welcome-badge">🎉 GETTING STARTED</div>
            
            <div class="greeting">
                Hi <strong>{$memberName}</strong>,
            </div>
            
            <p class="main-text">
                Welcome to <strong>{$companyName}</strong>! You've been added to our project workspace. 
                You'll receive notifications when tasks or projects are assigned to you.
            </p>
            
            <div class="features-title">What you can expect:</div>
            <ul class="features-list">
                <li>Real-time task and project assignment notifications</li>
                <li>Clear deadlines with detailed tech stack information</li>
                <li>Seamless collaboration with your team members</li>
            </ul>
            
            <div class="cta-wrapper">
                <a href="{$dashboardUrl}" class="cta-button">Open Dashboard</a>
            </div>
            
            <p class="support-text">
                Have questions? We're here to help! Reach out to us at 
                <a href="mailto:{$supportEmail}">{$supportEmail}</a>
            </p>
        </div>
        
        <div class="footer">
            <p class="footer-text">
                © {$currentYear} {$companyName}. All rights reserved.
            </p>
            <div class="social-links">
                <a href="https://nirvixtech.com">Visit Website</a> • 
                <a href="mailto:{$supportEmail}">Contact Us</a>
            </div>
        </div>
    </div>
</body>
</html>
HTML;
    }

    /**
     * Welcome email text template
     */
    private function createWelcomeEmailTextTemplate(string $memberName): string {
        $companyName = $this->config['templates']['project_assignment']['company_name'] ?? 'Nirvix';
        $supportEmail = $this->config['templates']['project_assignment']['support_email'] ?? $this->fromEmail;
        return "
WELCOME TO {$companyName}

Hi {$memberName},

Welcome to {$companyName}! You've been added to our project workspace. You'll receive emails when a task or project is assigned to you.

What to expect:
- Task and project assignment notifications via email
- Clear deadlines and tech stack details
- Direct collaboration with your team

Questions? Contact {$supportEmail}
";
    }

    /**
     * Send bulk emails to multiple team members
     */
    public function sendBulkProjectAssignmentEmails($memberNames, $projectData) {
        $results = [];
        
        foreach ($memberNames as $memberName) {
            $result = $this->sendProjectAssignmentEmail($memberName, $projectData);
            $results[] = [
                'member' => $memberName,
                'success' => $result['success'],
                'message' => $result['message']
            ];
        }
        
        return $results;
    }
}

// Only handle direct requests to this file (acts as its own endpoint)
if (basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'])) {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
            exit;
        }

        $emailService = new EmailService();
        
        // Check if it's a single member or multiple members
        if (isset($input['memberName'])) {
            // Single member requires projectData for assignment emails
            if (!isset($input['projectData'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'projectData is required']);
                exit();
            }
            $result = $emailService->sendProjectAssignmentEmail($input['memberName'], $input['projectData']);
            echo json_encode($result);
        } elseif (isset($input['memberNames']) && is_array($input['memberNames'])) {
            if (!isset($input['projectData'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'projectData is required']);
                exit();
            }
            $results = $emailService->sendBulkProjectAssignmentEmails($input['memberNames'], $input['projectData']);
            echo json_encode([
                'success' => true,
                'results' => $results
            ]);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing memberName or memberNames parameter']);
        }
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
}
?>