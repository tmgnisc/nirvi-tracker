# 📧 Roundcube Email Setup Guide

This guide will help you configure email notifications using your Roundcube email (`noreply@nirvixtech.com`) for the project management system.

## 🎯 Your Current Configuration

### ✅ **Already Updated:**
- **Sender Email**: `noreply@nirvixtech.com`
- **Team Member Emails**: All updated with real Gmail addresses
- **Email Service**: Enhanced with SMTP support

### 📧 **Team Member Email Addresses:**
- **Nischal Tamang**: `tamangnischal2018@gmail.com`
- **Sanjiv Magar**: `sanzivmagat80@gmail.com`
- **Sudip Pradhan**: `sudippradhanadgj@gmail.com`
- **Saurav Shrestha**: `sauravstha486@gmail.com`
- **Dibin Pariyar**: `dibinsunam145@gmail.com`
- **Anil Buda Magar**: `magaraneel35@gmail.com`
- **Sajesh Bajracharya**: `sajesh.bajracharya.01@gmail.com`

## ⚙️ SMTP Configuration Required

To use your Roundcube email effectively, you need to configure SMTP settings. Here's what you need to do:

### Step 1: Find Your SMTP Settings

You need to get these details from your hosting provider or cPanel:

1. **SMTP Host**: Usually `mail.nirvixtech.com` or `smtp.nirvixtech.com`
2. **SMTP Port**: Usually `587` (TLS) or `465` (SSL)
3. **Username**: `noreply@nirvixtech.com`
4. **Password**: Your email account password
5. **Encryption**: `tls` or `ssl`

### Step 2: Configure SMTP in `api/email-config.php`

Uncomment and update the SMTP section:

```php
// In api/email-config.php, uncomment and configure:
'smtp' => [
    'host' => 'mail.nirvixtech.com',           // Your SMTP server
    'port' => 587,                            // SMTP port
    'username' => 'noreply@nirvixtech.com',   // Your email
    'password' => 'your-email-password',      // Your password
    'encryption' => 'tls',                    // 'tls' or 'ssl'
    'auth' => true                            // Enable authentication
],
```

### Step 3: Common SMTP Settings for Different Hosting Providers

#### For cPanel Hosting (Most Common):
```php
'smtp' => [
    'host' => 'mail.nirvixtech.com',
    'port' => 587,
    'username' => 'noreply@nirvixtech.com',
    'password' => 'your-password',
    'encryption' => 'tls',
    'auth' => true
],
```

#### For Some Hosting Providers:
```php
'smtp' => [
    'host' => 'localhost',
    'port' => 25,
    'username' => 'noreply@nirvixtech.com',
    'password' => 'your-password',
    'encryption' => 'none',
    'auth' => true
],
```

#### For Port 465 (SSL):
```php
'smtp' => [
    'host' => 'mail.nirvixtech.com',
    'port' => 465,
    'username' => 'noreply@nirvixtech.com',
    'password' => 'your-password',
    'encryption' => 'ssl',
    'auth' => true
],
```

## 🧪 Testing Your Email Setup

### Step 1: Test Without SMTP (PHP mail())
1. Go to: `http://yourserver.com/api/test-email.php`
2. Select a team member
3. Send a test email
4. Check if it works with basic PHP mail()

### Step 2: Test With SMTP
1. Configure SMTP settings in `email-config.php`
2. Test again using the same interface
3. Check server logs for any SMTP errors

### Step 3: Test Real Project Assignment
1. Create a new upcoming project
2. Assign team members
3. Check if emails are sent automatically

## 🔍 Finding Your SMTP Settings

### Method 1: Check Your cPanel
1. Login to your cPanel
2. Look for "Email Accounts" or "Mail"
3. Find your `noreply@nirvixtech.com` account
4. Look for "Connect Devices" or "Mail Client Configuration"
5. Note down the SMTP settings

### Method 2: Contact Your Hosting Provider
Ask your hosting provider for:
- SMTP server hostname
- SMTP port number
- Authentication requirements
- SSL/TLS settings

### Method 3: Common Defaults
Try these common combinations:
- Host: `mail.nirvixtech.com`, Port: `587`, Encryption: `tls`
- Host: `mail.nirvixtech.com`, Port: `465`, Encryption: `ssl`
- Host: `smtp.nirvixtech.com`, Port: `587`, Encryption: `tls`

## 🚨 Troubleshooting

### Common Issues:

1. **"Connection refused"**
   - Check if the SMTP host and port are correct
   - Verify your hosting provider allows SMTP connections

2. **"Authentication failed"**
   - Double-check username and password
   - Ensure the email account exists and is active

3. **"TLS handshake failed"**
   - Try changing encryption from `tls` to `ssl`
   - Or try port `465` instead of `587`

4. **"SMTP server error"**
   - Check server logs for detailed error messages
   - Contact your hosting provider for SMTP configuration

### Testing Commands:

You can test SMTP connectivity using telnet:
```bash
telnet mail.nirvixtech.com 587
```

## 📋 What You Need to Provide

To complete the setup, I need you to provide:

1. **SMTP Host**: The server address for sending emails
2. **SMTP Port**: The port number (usually 587 or 465)
3. **Password**: The password for `noreply@nirvixtech.com`
4. **Encryption Type**: Whether to use TLS or SSL

### How to Get This Information:

1. **Login to your cPanel/hosting control panel**
2. **Go to Email Accounts section**
3. **Find your `noreply@nirvixtech.com` account**
4. **Look for "Mail Client Configuration" or "Connect Devices"**
5. **Copy the SMTP settings**

## 🎉 Once Configured

After you provide the SMTP settings:

1. ✅ **Emails will be sent automatically** when team members are assigned to projects
2. ✅ **Professional HTML emails** with project details
3. ✅ **Reliable delivery** through your own email server
4. ✅ **No spam issues** since emails come from your domain

## 📞 Next Steps

Please provide me with:
1. Your SMTP host (e.g., `mail.nirvixtech.com`)
2. Your SMTP port (e.g., `587` or `465`)
3. Your email password for `noreply@nirvixtech.com`
4. Encryption type (`tls` or `ssl`)

Once you provide these details, I'll update the configuration and test the email system for you!

---

**Note**: Keep your email password secure and never share it publicly. You can always change it in your email account settings if needed.
