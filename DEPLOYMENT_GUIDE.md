# 🚀 cPanel Deployment Guide

## 📦 **What to Upload**

### **Option 1: Upload the `deploy` folder (Recommended)**
1. **Compress** the entire `deploy` folder into a ZIP file
2. **Upload** the ZIP file to your cPanel File Manager
3. **Extract** the ZIP file in your domain's root directory (usually `public_html`)

### **Option 2: Manual Upload**
Upload these files/folders to your cPanel `public_html` directory:
- ✅ `index.html` (React app entry point)
- ✅ `assets/` folder (CSS, JS, images)
- ✅ `api/` folder (PHP API files)
- ✅ `data/` folder (JSON data files)
- ✅ `src/data/` folder (additional data files)
- ✅ `team/` folder (team member images)
- ✅ `.htaccess` file (URL rewriting rules)

## 🔧 **cPanel Configuration**

### **1. PHP Version**
- Ensure PHP 7.4+ is enabled
- Go to **Software** → **Select PHP Version**
- Choose PHP 8.0 or higher (recommended)

### **2. File Permissions**
Set these permissions in File Manager:
- **Folders**: 755 (drwxr-xr-x)
- **Files**: 644 (-rw-r--r--)
- **PHP files**: 644 (-rw-r--r--)

### **3. Directory Structure**
Your `public_html` should look like this:
```
public_html/
├── index.html
├── .htaccess
├── assets/
│   ├── index-CvH26Upu.css
│   ├── index-BO6htFej.js
│   └── ...
├── api/
│   ├── upcoming-projects.php
│   └── test.php
├── data/
│   └── upcoming-projects.json
├── src/
│   └── data/
│       └── data.json
└── team/
    └── (team images)
```

## 🌐 **Testing Your Deployment**

### **1. Test PHP API**
Visit: `https://yourdomain.com/api/test.php`
Expected response: `{"success":true,"message":"PHP is working!"}`

### **2. Test React App**
Visit: `https://yourdomain.com`
You should see your React application

### **3. Test API Endpoints**
- **GET**: `https://yourdomain.com/api/upcoming-projects.php`
- **POST**: Send JSON data to create projects
- **PUT**: `https://yourdomain.com/api/upcoming-projects.php?id=UP001`
- **DELETE**: `https://yourdomain.com/api/upcoming-projects.php?id=UP001`

## 🔍 **Troubleshooting**

### **Common Issues:**

#### **1. "PHP code showing as text"**
- **Problem**: PHP files not executing
- **Solution**: Check PHP version in cPanel (7.4+ required)

#### **2. "404 Not Found" for React routes**
- **Problem**: React Router not working
- **Solution**: Ensure `.htaccess` file is uploaded and working

#### **3. "CORS errors"**
- **Problem**: API calls blocked by browser
- **Solution**: API has CORS headers, but check if server allows it

#### **4. "File not found" errors**
- **Problem**: Wrong file paths
- **Solution**: Check file structure matches exactly

### **Debug Steps:**
1. **Check PHP logs** in cPanel → Error Logs
2. **Test PHP directly**: Visit `/api/test.php`
3. **Check file permissions**: Ensure files are readable
4. **Verify paths**: Make sure all files uploaded correctly

## 📱 **Mobile Responsiveness**
The app is built with mobile-first approach:
- ✅ Responsive design works on all devices
- ✅ Touch-friendly interface
- ✅ Optimized for mobile screens

## 🔒 **Security Notes**
- ✅ Input validation on PHP API
- ✅ CORS headers configured
- ✅ No database credentials to expose
- ✅ File-based data storage

## 📞 **Support**
If you encounter issues:
1. Check cPanel error logs
2. Verify PHP version (7.4+)
3. Test API endpoints individually
4. Check file permissions (755 for folders, 644 for files)

---

## 🎉 **Success Indicators**
Your deployment is successful when:
- ✅ React app loads at your domain
- ✅ API responds with JSON data
- ✅ You can create/edit/delete projects
- ✅ Team images display correctly
- ✅ All pages work (Dashboard, Projects, Upcoming, Ongoing, etc.)
