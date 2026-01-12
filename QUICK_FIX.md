# Quick Fix - Make Data Store in Database

## ✅ Already Fixed:
1. ✅ Fixed typo in `api/login.php` (was 'syste', now 'system')
2. ✅ Database credentials updated to: `system` / `1234`
3. ✅ Created test connection file: `api/test_connection.php`

## 🔧 Steps to Fix Network Error:

### 1. **Start WAMP**
   - Click WAMP icon (should be GREEN)
   - If not green, click "Start All Services"
   - Wait for Apache and MySQL to turn green

### 2. **Test API in Browser**
   
   Open this URL in your browser:
   ```
   http://localhost/bus/api/test_connection.php
   ```
   
   **Expected Result**: JSON showing database connection status
   
   **If you see:**
   - ✅ JSON response → API is working! Proceed to step 3
   - ❌ 404 error → Check file path
   - ❌ PHP error → Check database credentials
   - ❌ Can't connect → WAMP not running

### 3. **Verify Database Access**
   
   Open phpMyAdmin:
   ```
   http://localhost/phpmyadmin
   ```
   
   Login with:
   - Username: `system`
   - Password: `1234`
   
   Verify:
   - ✅ Database `tracking` exists
   - ✅ Table `users` exists

### 4. **Test Signup API Directly**
   
   Open in browser:
   ```
   http://localhost/bus/api/signup.php
   ```
   
   **Expected**: JSON error message (this is OK - it needs POST data)

### 5. **Now Try Signup Form**
   
   1. Go to: `http://localhost:3000/signup`
   2. Fill the form
   3. Submit
   4. Check browser console (F12) → Network tab
   5. Look for request to `signup.php`
   
   **If successful:**
   - ✅ Status: 200
   - ✅ Response: `{"success": true, "message": "User registered successfully"}`
   - ✅ Check database: `SELECT * FROM users` in phpMyAdmin

## 🐛 Common Problems & Solutions:

### Problem: Still getting "Network error"
**Solution**: 
- Make sure you're using: `http://localhost/bus/api/`
- Not: `http://localhost:3000/api/` ❌

### Problem: "Database connection error"
**Solution**: 
- Check MySQL is running (green in WAMP)
- Verify credentials in `api/signup.php` and `api/login.php`:
  ```php
  $username = 'system';
  $password = '1234';
  ```

### Problem: "404 Not Found"
**Solution**: 
- Verify project is at: `C:\wamp64\www\bus\`
- Check `api/` folder exists
- Restart Apache in WAMP

### Problem: CORS error
**Solution**: 
- Check `.htaccess` file exists in `api/` folder
- Enable mod_headers in Apache (WAMP → Apache → Apache modules → headers)

## 📋 Verification Checklist:

Before testing signup, verify:
- [ ] WAMP icon is GREEN
- [ ] `http://localhost/bus/api/test_connection.php` shows JSON
- [ ] phpMyAdmin accessible with `system`/`1234`
- [ ] Database `tracking` exists
- [ ] Table `users` exists

After signup:
- [ ] No error message
- [ ] Success message: "Signup successful! Please login..."
- [ ] User appears in database: `SELECT * FROM users` in phpMyAdmin

## 🚀 Testing:

1. **Test Connection**: 
   ```
   http://localhost/bus/api/test_connection.php
   ```

2. **Signup Test User**:
   - Name: Test User
   - Email: test@example.com  
   - Mobile: 1234567890
   - Role: Student
   - Password: test123456

3. **Check Database**:
   ```sql
   SELECT * FROM users WHERE email = 'test@example.com';
   ```

4. **Test Login**:
   - Use the email/password you just signed up with
   - Should redirect to Student Dashboard

## ✨ If Everything Works:

- ✅ Signup stores data in database
- ✅ Login fetches role from database  
- ✅ User redirected to correct dashboard
- ✅ All data persists in MySQL

**Your system is now working with real database integration!** 🎉
