# Database Setup Guide - Bus Tracking System

This guide explains how to set up the MySQL database for the Bus Tracking System.

## Prerequisites

- MySQL Server 5.7+ or MariaDB 10.3+
- MySQL command-line client or phpMyAdmin / MySQL Workbench
- Access to create databases and users

## Database Structure Overview

The database schema includes the following main tables organized by functionality:

### User Management
- **users** - Stores all user accounts (Students, Parents, Drivers, Admins)
- **sessions** - Tracks user login sessions (optional)

### Bus & Route Management
- **routes** - Bus routes with names and descriptions
- **route_stops** - Individual stops for each route with GPS coordinates
- **buses** - Bus information (number, capacity, type, status)
- **bus_locations** - Real-time GPS location tracking for buses

### Assignments & Relations
- **driver_bus_assignments** - Links drivers to buses
- **student_bus_assignments** - Links students to buses with pickup/dropoff stops
- **parent_student_relations** - Links parents to their children (students)

### Trip & Delay Management
- **trips** - Driver trip records (start/end times, status)
- **delays** - Delay reports with reasons and severity levels

### Communication
- **announcements** - Admin announcements to users
- **notifications** - User notification log

## Installation Steps

### Step 1: Create Database

1. **Using MySQL Command Line:**
   ```bash
   mysql -u root -p < database_schema.sql
   ```

2. **Using phpMyAdmin:**
   - Open phpMyAdmin in your browser
   - Go to "SQL" tab
   - Copy and paste the entire contents of `database_schema.sql`
   - Click "Go" to execute

3. **Using MySQL Workbench:**
   - Open MySQL Workbench
   - Connect to your MySQL server
   - Open `database_schema.sql`
   - Execute the script (Ctrl+Shift+Enter)

### Step 2: Verify Installation

Run the following queries to verify:

```sql
USE bus_tracking_system;

-- Check tables were created
SHOW TABLES;

-- Check admin user was created
SELECT * FROM users WHERE role = 'Admin';

-- Check routes
SELECT * FROM routes;

-- Check buses
SELECT * FROM buses;
```

### Step 3: Configure Database Connection

Create a backend configuration file (e.g., `config/database.js` for Node.js):

```javascript
module.exports = {
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'bus_tracking_system',
  charset: 'utf8mb4'
};
```

For PHP (PDO):
```php
$dsn = "mysql:host=localhost;dbname=bus_tracking_system;charset=utf8mb4";
$username = "your_username";
$password = "your_password";
```

## Table Relationships

```
users (1) ────┬─── (many) driver_bus_assignments
              ├─── (many) student_bus_assignments
              ├─── (many) parent_student_relations
              ├─── (many) trips
              ├─── (many) delays
              ├─── (many) announcements
              └─── (many) notifications

routes (1) ────┬─── (many) route_stops
               └─── (many) buses

buses (1) ────┬─── (many) bus_locations
              ├─── (many) driver_bus_assignments
              ├─── (many) student_bus_assignments
              ├─── (many) trips
              └─── (many) delays

trips (1) ──── (many) delays
announcements (1) ──── (many) notifications
delays (1) ──── (many) notifications
```

## User Roles

The system supports four user roles stored in the `users` table:

1. **Student** - Can view assigned bus location and route
2. **Parent** - Can view their child's bus information
3. **Driver** - Can start trips, share location, report delays
4. **Admin** - Can manage buses, assign drivers, send announcements

## Important Fields

### Password Storage
- Passwords are stored as SHA-256 hashes (can be updated to bcrypt for better security)
- Example: `SHA2('admin123', 256)` for MySQL
- Frontend already hashes passwords using SHA-256 before sending to backend

### Bus Status Values
- `On Route` - Bus is currently traveling
- `Stopped` - Bus is stopped (waiting, break, etc.)
- `Not Assigned` - No driver assigned
- `Completed` - Trip completed
- `Maintenance` - Bus under maintenance

### Trip Status Values
- `Not Started` - Trip hasn't started
- `On Route` - Trip is active
- `Completed` - Trip finished
- `Cancelled` - Trip was cancelled

### Delay Severity Levels
- `None` - No delay
- `Medium` - 5-15 minutes delay
- `High` - 15-30 minutes delay
- `Critical` - 30+ minutes delay

## Sample Queries

### Get active buses with driver info:
```sql
SELECT * FROM active_bus_assignments;
```

### Get student's assigned bus:
```sql
SELECT * FROM student_bus_info WHERE student_id = 1;
```

### Get latest bus location:
```sql
CALL GetLatestBusLocation(1); -- Replace 1 with bus_id
```

### Get active trips:
```sql
CALL GetActiveTrips();
```

### Get unread notifications for a user:
```sql
SELECT * FROM notifications 
WHERE user_id = 1 AND is_read = FALSE 
ORDER BY created_at DESC;
```

## Adding Initial Data

### Create Admin User (if not using sample data):
```sql
INSERT INTO users (name, email, mobile, password, role) 
VALUES ('Admin Name', 'admin@example.com', '9999999999', SHA2('your_password', 256), 'Admin');
```

### Create Driver:
```sql
INSERT INTO users (name, email, mobile, password, role) 
VALUES ('Driver Name', 'driver@example.com', '8888888888', SHA2('driver_password', 256), 'Driver');
```

### Assign Driver to Bus:
```sql
INSERT INTO driver_bus_assignments (driver_id, bus_id) 
VALUES (2, 1); -- Replace with actual IDs

UPDATE buses SET status = 'Stopped' WHERE id = 1;
```

### Assign Student to Bus:
```sql
INSERT INTO student_bus_assignments (student_id, bus_id, pickup_stop_id, dropoff_stop_id) 
VALUES (3, 1, 1, 3); -- Replace with actual IDs
```

## Security Considerations

1. **Change Default Passwords**: Update the default admin password immediately
2. **Use Prepared Statements**: Always use parameterized queries to prevent SQL injection
3. **Password Hashing**: Consider upgrading from SHA-256 to bcrypt or Argon2 for better security
4. **Database User**: Create a dedicated database user with minimal required permissions:
   ```sql
   CREATE USER 'bus_app'@'localhost' IDENTIFIED BY 'strong_password';
   GRANT SELECT, INSERT, UPDATE, DELETE ON bus_tracking_system.* TO 'bus_app'@'localhost';
   FLUSH PRIVILEGES;
   ```
5. **Backup Regularly**: Set up automated backups for the database

## Backup & Restore

### Backup:
```bash
mysqldump -u root -p bus_tracking_system > backup_$(date +%Y%m%d).sql
```

### Restore:
```bash
mysql -u root -p bus_tracking_system < backup_20240101.sql
```

## Troubleshooting

### Issue: Foreign key constraint errors
**Solution**: Make sure to insert data in the correct order:
1. Routes
2. Route stops
3. Users
4. Buses
5. Assignments

### Issue: Character encoding problems
**Solution**: Ensure database charset is `utf8mb4`:
```sql
ALTER DATABASE bus_tracking_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Issue: Can't create tables
**Solution**: Check MySQL user permissions:
```sql
SHOW GRANTS FOR 'your_user'@'localhost';
```

## Next Steps

1. Set up backend API to connect to this database
2. Implement authentication endpoints
3. Create API endpoints for:
   - User registration/login
   - Bus management (CRUD)
   - Real-time location updates
   - Announcement system
   - Delay reporting
   - Trip management

## Support

For issues or questions, refer to the main project README or create an issue in the repository.
