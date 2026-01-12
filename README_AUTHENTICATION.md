# Authentication System - Implementation Guide

## Overview

The authentication system has been fully implemented with proper database integration. Users can sign up with their details and choose a role (Student, Parent, Driver, Staff), and all information is stored in the database. During login, the role is automatically fetched from the database based on the email and password.

## Features Implemented

### 1. Signup Page
- ✅ Users can enter: Name, Email, Mobile, Role, Password
- ✅ Role options: Student, Parent, Driver, Staff
- ✅ All data is saved to the database via API
- ✅ Password is hashed (SHA-256) before storing
- ✅ Form validation for all fields

### 2. Login Page
- ✅ Removed role selection - role is fetched from database
- ✅ Users only enter: Email and Password
- ✅ Authentication verifies credentials against database
- ✅ Role is retrieved from database and user is redirected to appropriate dashboard
- ✅ Session management with token storage

### 3. Parent Dashboard
- ✅ Fully functional dashboard created
- ✅ Parents can view multiple children
- ✅ Track bus location for each child
- ✅ View route details, ETA, delays, and notifications
- ✅ Real-time bus tracking
- ✅ Add child functionality (placeholder for future)

### 4. Database Integration
- ✅ PHP API endpoints for signup and login
- ✅ Proper error handling and validation
- ✅ Password verification
- ✅ Session management

## Setup Instructions

### 1. Database Setup

First, update your database schema to include the Staff role:

```sql
-- Run this in phpMyAdmin or MySQL command line
USE tracking;

ALTER TABLE users 
MODIFY COLUMN role ENUM('Student', 'Parent', 'Driver', 'Staff', 'Admin') NOT NULL;
```

Or use the provided SQL file:
```bash
# Import the update file
mysql -u root -p tracking < api/db_update_staff_role.sql
```

### 2. Backend API Configuration

The PHP API files are in the `api/` directory:
- `api/signup.php` - Handles user registration
- `api/login.php` - Handles user authentication

**Important**: Update database credentials in both files if needed:

```php
$host = 'localhost';
$dbname = 'tracking';
$username = 'root'; // Change if your MySQL username is different
$password = ''; // Change if your MySQL has a password
```

### 3. Frontend Configuration

The API base URL is configured in `src/utils/api.js`. By default, it's set to:
```javascript
const API_BASE_URL = 'http://localhost/bus/api'
```

If your setup is different, you can:
1. Create a `.env` file in the root directory:
   ```
   VITE_API_BASE_URL=http://localhost/bus/api
   ```
2. Or modify the default in `src/utils/api.js`

### 4. Testing

#### Test Signup:
1. Go to `/signup`
2. Fill in all fields
3. Select a role (Student, Parent, Driver, or Staff)
4. Submit the form
5. Check the database - user should be created in the `users` table

#### Test Login:
1. Go to `/login`
2. Enter email and password (no role selection)
3. Submit the form
4. You should be redirected to the appropriate dashboard based on role:
   - Student → `/student/dashboard`
   - Parent → `/parent/dashboard`
   - Driver → `/driver/dashboard`
   - Staff → `/staff/dashboard` (placeholder)
   - Admin → `/admin/dashboard`

## API Endpoints

### POST `/api/signup.php`
Register a new user.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "1234567890",
  "role": "Student",
  "password": "hashed_sha256_password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "1234567890",
    "role": "Student"
  }
}
```

### POST `/api/login.php`
Authenticate user and get role.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "hashed_sha256_password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "session_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "1234567890",
    "role": "Student"
  }
}
```

## Fallback Mode (Development)

If the API is not accessible, the system falls back to mock mode:
- Signup data is stored in `localStorage` as `mockUsers`
- Login checks against `localStorage` mock users
- This allows frontend development without backend

**Note**: In production, ensure the backend API is properly configured and accessible.

## Role-Based Dashboards

After login, users are automatically redirected based on their role:

- **Student** → Student Dashboard (existing)
- **Parent** → Parent Dashboard (newly created with full functionality)
- **Driver** → Driver Dashboard (existing)
- **Staff** → Staff Dashboard (placeholder - ready for implementation)
- **Admin** → Admin Dashboard (existing)

## Security Notes

1. **Password Hashing**: Passwords are hashed using SHA-256 on the client side before sending to the server
2. **Session Tokens**: Simple token generation is used - in production, consider using JWT
3. **CORS**: API endpoints have CORS enabled for development - configure properly for production
4. **SQL Injection**: Prepared statements are used in PHP to prevent SQL injection

## Troubleshooting

### API Not Working
1. Check that WAMP/Apache is running
2. Verify database credentials in PHP files
3. Check that the `api/` directory is accessible via browser
4. Check browser console for CORS errors

### Login Not Redirecting
1. Check browser console for errors
2. Verify user data in database
3. Check that role matches expected values (Student, Parent, Driver, Staff, Admin)

### Signup Fails
1. Check database connection
2. Verify email/mobile doesn't already exist
3. Check that all required fields are provided
4. Review PHP error logs in WAMP

## Next Steps

1. Implement Staff Dashboard functionality
2. Add password reset functionality
3. Implement "Add Child" feature for parents
4. Add email verification
5. Implement proper JWT token system
6. Add role-based permissions and access control
