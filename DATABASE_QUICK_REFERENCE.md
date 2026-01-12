# Database Quick Reference Guide

Quick reference for the Bus Tracking System database tables and their purposes.

## Tables Summary

| Table Name | Purpose | Key Fields |
|-----------|---------|------------|
| **users** | All user accounts (Students, Parents, Drivers, Admins) | id, email, password, role |
| **routes** | Bus routes | id, route_name, route_description |
| **route_stops** | Individual stops for routes | id, route_id, stop_name, latitude, longitude |
| **buses** | Bus information | id, bus_number, route_id, capacity, status |
| **bus_locations** | Real-time GPS tracking | id, bus_id, latitude, longitude, timestamp |
| **driver_bus_assignments** | Links drivers to buses | id, driver_id, bus_id, is_active |
| **student_bus_assignments** | Links students to buses | id, student_id, bus_id, pickup_stop_id |
| **parent_student_relations** | Links parents to students | id, parent_id, student_id |
| **trips** | Driver trip records | id, bus_id, driver_id, start_time, status |
| **delays** | Delay reports | id, bus_id, delay_reason, delay_minutes, severity |
| **announcements** | Admin announcements | id, admin_id, title, message, target |
| **notifications** | User notifications log | id, user_id, title, message, is_read |
| **sessions** | Login sessions (optional) | id, user_id, session_token, expires_at |

## Common Operations

### User Registration (Signup)
```sql
INSERT INTO users (name, email, mobile, password, role) 
VALUES ('John Doe', 'john@example.com', '1234567890', SHA2('password123', 256), 'Student');
```

### User Login (Verify)
```sql
SELECT * FROM users 
WHERE email = 'john@example.com' 
AND password = SHA2('password123', 256) 
AND role = 'Student' 
AND is_active = TRUE;
```

### Add New Bus
```sql
INSERT INTO buses (bus_number, route_id, capacity, type) 
VALUES ('BUS-004', 1, 45, 'AC');
```

### Assign Driver to Bus
```sql
INSERT INTO driver_bus_assignments (driver_id, bus_id) 
VALUES (5, 4); -- driver_id from users table, bus_id from buses table

UPDATE buses SET status = 'Stopped' WHERE id = 4;
```

### Assign Student to Bus
```sql
INSERT INTO student_bus_assignments (student_id, bus_id, pickup_stop_id, dropoff_stop_id) 
VALUES (3, 1, 1, 3);
```

### Start Trip (Driver)
```sql
INSERT INTO trips (bus_id, driver_id, start_time, status) 
VALUES (1, 2, NOW(), 'On Route');

UPDATE buses SET status = 'On Route' WHERE id = 1;
```

### Update Bus Location (Real-time)
```sql
INSERT INTO bus_locations (bus_id, latitude, longitude, accuracy, timestamp) 
VALUES (1, 28.6139, 77.2090, 10.5, NOW());
```

### Get Latest Bus Location
```sql
SELECT * FROM bus_locations 
WHERE bus_id = 1 
ORDER BY timestamp DESC 
LIMIT 1;
```

### Report Delay
```sql
INSERT INTO delays (bus_id, driver_id, trip_id, delay_reason, delay_minutes, severity) 
VALUES (1, 2, 5, 'Traffic jam on main road', 15, 'High');
```

### Send Announcement (Admin)
```sql
INSERT INTO announcements (admin_id, title, message, target) 
VALUES (1, 'Weather Alert', 'Heavy rain expected. Buses may be delayed.', 'all');
```

### Create Notification for Users
```sql
-- For all students
INSERT INTO notifications (user_id, announcement_id, notification_type, title, message)
SELECT id, 1, 'announcement', 'Weather Alert', 'Heavy rain expected. Buses may be delayed.'
FROM users WHERE role = 'Student';
```

### Get Student's Bus Info
```sql
SELECT 
    u.name as student_name,
    b.bus_number,
    r.route_name,
    d.name as driver_name,
    b.status as bus_status
FROM users u
INNER JOIN student_bus_assignments sba ON u.id = sba.student_id AND sba.is_active = TRUE
INNER JOIN buses b ON sba.bus_id = b.id
LEFT JOIN routes r ON b.route_id = r.id
LEFT JOIN driver_bus_assignments dba ON b.id = dba.bus_id AND dba.is_active = TRUE
LEFT JOIN users d ON dba.driver_id = d.id
WHERE u.id = 3; -- Replace with student user_id
```

### Get All Active Buses with Drivers
```sql
SELECT 
    b.bus_number,
    b.status,
    u.name as driver_name,
    r.route_name,
    b.current_passengers,
    b.capacity
FROM buses b
LEFT JOIN driver_bus_assignments dba ON b.id = dba.bus_id AND dba.is_active = TRUE
LEFT JOIN users u ON dba.driver_id = u.id
LEFT JOIN routes r ON b.route_id = r.id
WHERE b.status IN ('On Route', 'Stopped');
```

### End Trip
```sql
UPDATE trips 
SET end_time = NOW(), status = 'Completed' 
WHERE id = 5;

UPDATE buses 
SET status = 'Stopped', current_passengers = 0 
WHERE id = 1;
```

### Get Unread Notifications for User
```sql
SELECT * FROM notifications 
WHERE user_id = 1 AND is_read = FALSE 
ORDER BY created_at DESC;
```

### Mark Notification as Read
```sql
UPDATE notifications 
SET is_read = TRUE 
WHERE id = 10;
```

## Role-Based Data Access

### Student Dashboard Data
- Assigned bus information
- Bus location (real-time)
- Route details with stops
- Delay notifications
- Announcements targeted to 'students' or 'all'

### Parent Dashboard Data
- Their children's (students) bus information
- Bus location for assigned students
- Announcements targeted to 'parents' or 'all'

### Driver Dashboard Data
- Assigned bus information
- Trip management (start/end)
- Location sharing (insert into bus_locations)
- Delay reporting

### Admin Dashboard Data
- All buses (with or without drivers)
- All users (filtered by role)
- Bus management (CRUD operations)
- Driver assignments
- Student assignments
- All announcements
- All delay reports
- Send announcements to any target group

## Index Usage

The database includes indexes on frequently queried fields:
- `users.email` - Fast login lookups
- `users.role` - Filter users by role
- `buses.bus_number` - Quick bus lookups
- `bus_locations.bus_id, timestamp` - Fast location history queries
- `notifications.user_id, is_read` - Quick notification queries

## Data Integrity

Foreign key constraints ensure:
- Cannot delete a route if buses use it
- Cannot delete a bus if assignments exist
- Cannot delete a user if they have active assignments
- Cascading deletes clean up related data appropriately

## Performance Tips

1. **Location History**: Consider archiving old bus_locations records (older than 30 days) to a separate table
2. **Indexes**: Already included on critical fields, but monitor query performance
3. **Notifications**: Periodically clean up read notifications older than 90 days
4. **Sessions**: Implement cleanup job for expired sessions
