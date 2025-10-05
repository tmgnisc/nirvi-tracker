# 📧 Email Notification Setup Guide

This guide will help you set up email notifications for your project management system.

## 🚀 Features

- **Automatic Email Notifications**: Team members receive emails when assigned to projects
- **Professional Email Templates**: Beautiful HTML and plain text email templates
- **Bulk Email Support**: Send notifications to multiple team members at once
- **Configurable Settings**: Easy-to-modify email configuration
- **Test Functionality**: Built-in email testing tool

## 📋 Prerequisites

1. **PHP Server**: Your hosting must support PHP
2. **Mail Function**: PHP's `mail()` function must be enabled
3. **Domain Email**: A valid email address from your domain

## ⚙️ Setup Instructions

### Step 1: Configure Email Settings

Edit the file `api/email-config.php`:

```php
return [
    'from_email' => 'noreply@yourdomain.com',  // Change to your domain email
    'from_name' => 'Your Company Project Management',
    // ... other settings
];
```

### Step 2: Update Team Email Addresses

Edit `src/data/data.json` and ensure each team member has a valid email:

```json
{
    "name": "John Doe",
    "role": "Developer",
    "email": "john@yourdomain.com",  // Make sure this is correct
    "skills": ["React", "Node.js"]
}
```

### Step 3: Test Email Functionality

1. **Access the test page**: Navigate to `http://yourserver.com/api/test-email.php`
2. **Select a team member** from the dropdown
3. **Fill in project details** (or use defaults)
4. **Click "Send Test Email"**
5. **Check the team member's inbox**

## 🔧 Configuration Options

### Basic Configuration (`api/email-config.php`)

```php
return [
    // Sender information
    'from_email' => 'noreply@yourdomain.com',
    'from_name' => 'Your Company Project Management',
    
    // Email templates
    'templates' => [
        'project_assignment' => [
            'subject_prefix' => '🚀 New Project Assignment: ',
            'company_name' => 'Your Company',
            'support_email' => 'support@yourdomain.com'
        ]
    ],
    
    // Email preferences
    'preferences' => [
        'send_html_emails' => true,
        'send_text_emails' => true,
        'log_email_results' => true,
        'max_recipients_per_batch' => 10
    ]
];
```

### Advanced SMTP Configuration (Optional)

For better email delivery, you can configure SMTP:

```php
return [
    // ... basic config ...
    
    'smtp' => [
        'host' => 'smtp.gmail.com',          // Your SMTP server
        'port' => 587,                       // SMTP port
        'username' => 'your-email@gmail.com', // Your email
        'password' => 'your-app-password',    // Your password
        'encryption' => 'tls',               // 'tls' or 'ssl'
        'auth' => true
    ]
];
```

## 📧 How It Works

### When Emails Are Sent

1. **Creating a new project** with assigned team members
2. **Updating an existing project** with new team assignments
3. **Manual testing** via the test interface

### Email Content

Each email includes:
- **Project name and client**
- **Project description**
- **Tech stack requirements**
- **Deadline information**
- **Team member's role**
- **Professional HTML formatting**

### Email Recipients

- Emails are sent to all team members listed in the `assignedTo` field
- Email addresses are looked up from the team data in `src/data/data.json`
- If a team member's email is not found, an error is logged

## 🐛 Troubleshooting

### Common Issues

1. **Emails not being sent**
   - Check if PHP `mail()` function is enabled
   - Verify your hosting provider supports email sending
   - Check server error logs

2. **Emails going to spam**
   - Use a domain email address (not Gmail/Hotmail)
   - Configure SPF and DKIM records for your domain
   - Consider using SMTP instead of PHP mail()

3. **"Email not found" errors**
   - Verify team member names match exactly in `data.json`
   - Ensure each team member has an `email` field
   - Check for typos in email addresses

### Testing Steps

1. **Test individual emails** using `api/test-email.php`
2. **Check server logs** for PHP errors
3. **Verify email addresses** in team data
4. **Test with different team members**

### Server Requirements

- **PHP 7.4+** (recommended)
- **Mail function enabled**
- **Proper file permissions** for data files
- **CORS headers** configured (already included)

## 📁 File Structure

```
api/
├── email-service.php      # Main email service class
├── email-config.php       # Email configuration
├── test-email.php         # Email testing interface
└── upcoming-projects.php  # API with email integration

src/data/
└── data.json             # Team data with email addresses
```

## 🔐 Security Considerations

1. **Email Configuration**: Keep email credentials secure
2. **Input Validation**: All inputs are validated before sending
3. **Rate Limiting**: Consider implementing rate limiting for production
4. **Error Handling**: Sensitive information is not exposed in error messages

## 📞 Support

If you encounter issues:

1. **Check the test page** first: `api/test-email.php`
2. **Review server logs** for PHP errors
3. **Verify email configuration** in `email-config.php`
4. **Test with a simple email** before complex scenarios

## 🎯 Production Deployment

For production deployment:

1. **Use SMTP** instead of PHP mail() for better delivery
2. **Configure proper DNS records** (SPF, DKIM)
3. **Set up email monitoring** and logging
4. **Test thoroughly** with real email addresses
5. **Monitor email delivery rates** and adjust as needed

---

**Note**: This email system uses PHP's built-in `mail()` function by default. For production use, consider implementing SMTP for better email delivery rates and reliability.
