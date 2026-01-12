# Fix Network Error - Step by Step Guide

## ✅ What I Fixed:

1. **Added Vite Proxy** - Routes API calls through Vite dev server
2. **Improved Error Logging** - Better debugging in browser console
3. **Created Health Check** - `api/check_api.php` to test API

## 🔧 IMPORTANT: Restart Dev Server

**The vite.config.js changes require restarting your dev server!**

1. **Stop** the current dev server (Ctrl+C in terminal)
2. **Restart** it:
   ```bash
   npm run dev
   ```

## 📋 Step-by-Step Verification:

### Step 1: Verify WAMP is Running
1. Check WAMP icon in system tray - must be **GREEN**
2. If not green, click → "Start All Services"
3. Wait for Apache and MySQL to turn green

### Step 2: Test API Directly in Browser

Open these URLs in your browser:

**Test 1 - Health Check:**
```
http://localhost/bus/api/check_api.php
```
**Expected:** JSON response like:
```json
{
  "status": "OK",
  "message": "API is accessible",
  ...
}
```

**Test 2 - Test Connection:**
```
http://localhost/bus/api/test_connection.php
```
**Expected:** JSON with database connection info

**Test 3 - Signup Endpoint:**
```
http://localhost/bus/api/signup.php
```
**Expected:** JSON error (this is OK - needs POST data)

### Step 3: Restart Dev Server

**IMPORTANT:** After changing `vite.config.js`, you MUST restart:

1. Open terminal/command prompt
2. Go to project folder: `cd c:\wamp64\www\bus`
3. Stop server: Press `Ctrl+C`
4. Start again: `npm run dev`
5. Wait for it to start on `http://localhost:3000`

### Step 4: Test Signup Form

1. Open: `http://localhost:3000/signup`
2. Open Browser Console (F12)
3. Go to **Console** tab
4. Fill form and submit
5. Check console for:
   - `API Request:` - Should show `/api/signup.php`
   - `API Response:` - Should show JSON response

### Step 5: Check Network Tab

1. Open Browser DevTools (F12)
2. Go to **Network** tab
3. Submit signup form
4. Look for request to `signup.php`
5. Click on it to see:
   - **Status:** Should be 200 or 400 (not failed)
   - **Response:** Should be JSON

## 🐛 Troubleshooting:

### Still Getting Network Error?

**Check 1: Is WAMP Running?**
- WAMP icon must be GREEN
- Both Apache and MySQL must be green

**Check 2: Did You Restart Dev Server?**
- You MUST restart after changing vite.config.js
- Stop (Ctrl+C) and start (`npm run dev`) again

**Check 3: Can You Access API in Browser?**
- Open: `http://localhost/bus/api/check_api.php`
- Must show JSON, not 404 or error

**Check 4: Browser Console Errors**
- Press F12 → Console tab
- Look for any red errors
- Check Network tab for failed requests

**Check 5: CORS Issues**
- If you see CORS errors in console
- Check `.htaccess` file exists in `api/` folder
- Verify Apache mod_headers is enabled

### Test API Manually

Open PowerShell and run:

```powershell
$body = '{"name":"Test","email":"test@test.com","mobile":"1234567890","role":"Student","password":"test123"}'

Invoke-WebRequest -Uri "http://localhost/bus/api/signup.php" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

This should return JSON response.

## ✅ Success Indicators:

You'll know it's working when:
- ✅ `http://localhost/bus/api/check_api.php` shows JSON
- ✅ Browser console shows `API Request:` and `API Response:`
- ✅ Network tab shows status 200 or 400 (not failed)
- ✅ No "Network error" message
- ✅ Either success message OR validation error (not network error)

## 🚀 Quick Checklist:

Before testing signup:
- [ ] WAMP is running (green icon)
- [ ] Dev server restarted after vite.config.js change
- [ ] `http://localhost/bus/api/check_api.php` works in browser
- [ ] Browser console open (F12) to see logs
- [ ] Network tab open to monitor requests

## 📞 Still Not Working?

1. **Check WAMP Logs:**
   - `C:\wamp64\logs\apache_error.log`
   - Look for PHP errors

2. **Check Browser Console:**
   - F12 → Console tab
   - Look for detailed error messages

3. **Verify File Paths:**
   - Project must be at: `C:\wamp64\www\bus\`
   - API folder must exist: `C:\wamp64\www\bus\api\`
   - Files must exist:
     - `api/signup.php`
     - `api/login.php`
     - `api/check_api.php`

4. **Test Database:**
   - Open phpMyAdmin: `http://localhost/phpmyadmin`
   - Login: `system` / `1234`
   - Verify database `tracking` exists

---

**Most Common Issue:** Forgetting to restart the dev server after changing `vite.config.js`!

**Solution:** Always restart (`npm run dev`) after config changes! 🚀
