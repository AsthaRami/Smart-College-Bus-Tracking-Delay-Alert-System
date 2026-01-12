# Troubleshooting Guide - Network Error Fix

## Problem: "Network error: Unable to connect to server"

This error occurs when the frontend (React) cannot reach the PHP backend API.

## Quick Fixes

### Step 1: Verify WAMP is Running
1. Check your WAMP icon in system tray - it should be **GREEN**
2. If it's **ORANGE** or **RED**, click it and select "Start All Services"
3. Wait until both Apache and MySQL turn green

### Step 2: Test API Directly in Browser

Open these URLs in your browser:

1. **Test Connection**: `http://localhost/bus/api/test_connection.php`
   - Should show JSON with database connection status
   - If you see JSON, API is working!
   - If you see "404 Not Found", check file path

2. **Test Signup Endpoint**: `http://localhost/bus/api/signup.php`
   - Should return JSON error (expected - needs POST data)
   - If you see JSON, API endpoint is accessible!

### Step 3: Check File Structure

Your project should look like this:
```
C:\wamp64\www\bus\
├── api/
│   ├── signup.php          ✅ Must exist
│   ├── login.php           ✅ Must exist
│   ├── test_connection.php ✅ New test file
│   ├── parent/
│   │   └── children.php
│   └── staff/
│       ├── buses.php
│       └── statistics.php
├── src/
└── ...
```

### Step 4: Verify Database Credentials

All PHP files now use:
```php
$username = 'system';
$password = '1234';
```

Files updated:
- ✅ `api/signup.php`
- ✅ `api/login.php`
- ✅ `api/parent/children.php`
- ✅ `api/staff/buses.php`
- ✅ `api/staff/statistics.php`

### Step 5: Test Database Connection

1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Login with:
   - Username: `system`
   - Password: `1234`
3. Verify database `tracking` exists
4. Check `users` table exists

### Step 6: Fix Common Issues

#### Issue: "404 Not Found" when accessing API

**Solution**: 
- Verify WAMP document root is `C:\wamp64\www\`
- Your project should be at `C:\wamp64\www\bus\`
- API should be accessible at `http://localhost/bus/api/`

#### Issue: "Access Denied" or "Forbidden"

**Solution**:
- Check file permissions in `api/` folder
- Make sure `.htaccess` file exists in `api/` folder
- Verify Apache mod_rewrite is enabled in WAMP

#### Issue: PHP errors instead of JSON

**Solution**:
- Check PHP error logs in WAMP
- Enable error display: In `api/signup.php` add at top (for debugging):
  ```php
  ini_set('display_errors', 1);
  error_reporting(E_ALL);
  ```

#### Issue: CORS errors in browser console

**Solution**:
- Verify `.htaccess` file in `api/` folder has CORS headers
- Check browser console for specific CORS error

### Step 7: Test Signup Flow

1. Open browser console (F12)
2. Go to Network tab
3. Fill signup form and submit
4. Check Network tab - you should see a request to `signup.php`
5. Click on the request to see:
   - **Status**: Should be 200 (success) or 400 (validation error)
   - **Response**: Should be JSON

## Still Not Working?

### Debug Mode

Add this to the top of `api/signup.php` (temporarily):

```php
<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// ... rest of code
```

Then try signup again and check:
- Browser console for errors
- WAMP error logs
- Response in Network tab

### Manual API Test

Test signup API manually using this curl command (run in PowerShell):

```powershell
$body = @{
    name = "Test User"
    email = "test@example.com"
    mobile = "1234567890"
    role = "Student"
    password = "hashed_password_here"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost/bus/api/signup.php" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

Or use Postman/Insomnia to test the API directly.

## Success Indicators

✅ **Working correctly when:**
- `http://localhost/bus/api/test_connection.php` shows JSON
- Browser Network tab shows 200 status on signup
- User appears in `users` table after signup
- Login redirects to correct dashboard

## Need Help?

Check these files for errors:
1. WAMP error logs: `C:\wamp64\logs\apache_error.log`
2. PHP error logs: `C:\wamp64\logs\php_error.log`
3. Browser console (F12)
4. Network tab in browser DevTools
