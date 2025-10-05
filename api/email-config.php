<?php
/**
 * Email Configuration
 * 
 * Configure your email settings here for the project management system.
 * Update these settings according to your hosting provider and requirements.
 */

return [
    // Email sender information
    'from_email' => 'nirvixtech@gmail.com',  
    'from_name' => 'Nirvix Project Management System',
    
    // SMTP Configuration for Roundcube
    'smtp' => [
        'host' => 'smtp.gmail.com',     // Your domain's mail server
        'port' => 587,                       // SMTP port (465 for SSL)
        'username' => 'nirvixtech@gmail.com', // Your email username
        'password' => 'siaj fjwg yoyy brwc',    // Your email password
        'encryption' => 'tls',               // SSL encryption
        'auth' => true                       // Enable authentication
    ],
    
   
    // Email templates
    'templates' => [
        'project_assignment' => [
            'subject_prefix' => '🚀 New Project Assignment: ',
            'company_name' => 'Nirvix',
            'support_email' => 'nirvixtech@gmail.com'
        ]
    ],
    
    // Email preferences
    'preferences' => [
        'send_html_emails' => true,          // Send HTML formatted emails
        'send_text_emails' => true,          // Send plain text version as well
        'log_email_results' => true,         // Log email sending results
        'max_recipients_per_batch' => 20     // Maximum recipients per email batch
    ]
];
?>
