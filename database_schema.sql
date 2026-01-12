-- =====================================================
-- College Bus Tracking System - MySQL Database Schema
-- =====================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS tracking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tracking;

-- =====================================================
-- 1. USERS TABLE (Stores all users: Students, Parents, Drivers, Admins)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    mobile VARCHAR(15) NOT NULL,
    password VARCHAR(255) NOT NULL COMMENT 'SHA-256 hashed password',
    role ENUM('Student', 'Parent', 'Driver', 'Staff', 'Admin') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_mobile (mobile)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. ROUTES TABLE (Bus routes with name and description)
-- =====================================================
CREATE TABLE IF NOT EXISTS routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_name VARCHAR(100) NOT NULL,
    route_description TEXT,
    total_distance DECIMAL(10, 2) COMMENT 'Distance in kilometers',
    estimated_time INT COMMENT 'Estimated time in minutes',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_route_name (route_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. ROUTE_STOPS TABLE (Individual stops for each route)
-- =====================================================
CREATE TABLE IF NOT EXISTS route_stops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT NOT NULL,
    stop_name VARCHAR(100) NOT NULL,
    stop_order INT NOT NULL COMMENT 'Order of stop in route (1, 2, 3...)',
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    INDEX idx_route_id (route_id),
    INDEX idx_stop_order (route_id, stop_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. BUSES TABLE (Bus information)
-- =====================================================
CREATE TABLE IF NOT EXISTS buses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_number VARCHAR(20) NOT NULL UNIQUE,
    route_id INT,
    capacity INT NOT NULL,
    type ENUM('Standard', 'AC', 'Premium') DEFAULT 'Standard',
    status ENUM('On Route', 'Stopped', 'Not Assigned', 'Completed', 'Maintenance') DEFAULT 'Not Assigned',
    current_passengers INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL,
    INDEX idx_bus_number (bus_number),
    INDEX idx_status (status),
    INDEX idx_route_id (route_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. BUS_LOCATIONS TABLE (Real-time bus location tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS bus_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy DECIMAL(8, 2) COMMENT 'GPS accuracy in meters',
    speed DECIMAL(6, 2) COMMENT 'Speed in km/h',
    heading DECIMAL(5, 2) COMMENT 'Direction in degrees',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    INDEX idx_bus_id (bus_id),
    INDEX idx_timestamp (bus_id, timestamp DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. DRIVER_BUS_ASSIGNMENTS TABLE (Assigns drivers to buses)
-- =====================================================
CREATE TABLE IF NOT EXISTS driver_bus_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    driver_id INT NOT NULL COMMENT 'user_id where role=Driver',
    bus_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unassigned_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    INDEX idx_driver_id (driver_id),
    INDEX idx_bus_id (bus_id),
    INDEX idx_active (is_active, driver_id),
    UNIQUE KEY unique_active_driver (driver_id, is_active),
    UNIQUE KEY unique_active_bus (bus_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. STUDENT_BUS_ASSIGNMENTS TABLE (Assigns students to buses)
-- =====================================================
CREATE TABLE IF NOT EXISTS student_bus_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL COMMENT 'user_id where role=Student',
    bus_id INT NOT NULL,
    pickup_stop_id INT COMMENT 'Route stop ID for pickup',
    dropoff_stop_id INT COMMENT 'Route stop ID for dropoff',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unassigned_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    FOREIGN KEY (pickup_stop_id) REFERENCES route_stops(id) ON DELETE SET NULL,
    FOREIGN KEY (dropoff_stop_id) REFERENCES route_stops(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id),
    INDEX idx_bus_id (bus_id),
    INDEX idx_active (is_active, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. PARENT_STUDENT_RELATIONS TABLE (Links parents to students)
-- =====================================================
CREATE TABLE IF NOT EXISTS parent_student_relations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL COMMENT 'user_id where role=Parent',
    student_id INT NOT NULL COMMENT 'user_id where role=Student',
    relation_type VARCHAR(50) DEFAULT 'Parent' COMMENT 'Parent, Guardian, etc.',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_parent_id (parent_id),
    INDEX idx_student_id (student_id),
    UNIQUE KEY unique_relation (parent_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. TRIPS TABLE (Driver trip management)
-- =====================================================
CREATE TABLE IF NOT EXISTS trips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    driver_id INT NOT NULL COMMENT 'user_id where role=Driver',
    start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    status ENUM('Not Started', 'On Route', 'Completed', 'Cancelled') DEFAULT 'Not Started',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_bus_id (bus_id),
    INDEX idx_driver_id (driver_id),
    INDEX idx_status (status),
    INDEX idx_start_time (start_time DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 10. DELAYS TABLE (Delay reports from drivers)
-- =====================================================
CREATE TABLE IF NOT EXISTS delays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT,
    bus_id INT NOT NULL,
    driver_id INT NOT NULL COMMENT 'user_id where role=Driver',
    delay_reason TEXT NOT NULL,
    delay_minutes INT COMMENT 'Delay duration in minutes',
    expected_arrival_time TIMESTAMP,
    actual_arrival_time TIMESTAMP,
    severity ENUM('None', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_bus_id (bus_id),
    INDEX idx_driver_id (driver_id),
    INDEX idx_reported_at (reported_at DESC),
    INDEX idx_severity (severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 11. ANNOUNCEMENTS TABLE (Admin announcements)
-- =====================================================
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL COMMENT 'user_id where role=Admin',
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    target ENUM('all', 'students', 'parents', 'drivers') DEFAULT 'all',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_admin_id (admin_id),
    INDEX idx_target (target),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 12. NOTIFICATIONS TABLE (User notifications log)
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    announcement_id INT NULL,
    delay_id INT NULL,
    notification_type ENUM('announcement', 'delay', 'bus_status', 'system') DEFAULT 'system',
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE SET NULL,
    FOREIGN KEY (delay_id) REFERENCES delays(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (user_id, is_read),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_type (notification_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 13. SESSIONS TABLE (User login sessions - optional)
-- =====================================================
CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token (session_token),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SAMPLE DATA INSERTIONS (Optional - for testing)
-- =====================================================

-- Insert sample admin user (password: admin123 - SHA-256 hash)
-- Note: In production, use proper password hashing
INSERT INTO users (name, email, mobile, password, role) VALUES
('Admin User', 'admin@bustracking.com', '9999999999', SHA2('admin123', 256), 'Admin');

-- Insert sample routes
INSERT INTO routes (route_name, route_description, total_distance, estimated_time) VALUES
('Route A', 'College → Station → Downtown', 15.5, 45),
('Route B', 'College → Mall → Airport', 22.3, 60),
('Route C', 'College → Hospital → Park', 18.7, 50);

-- Insert sample route stops for Route A
INSERT INTO route_stops (route_id, stop_name, stop_order, latitude, longitude) VALUES
(1, 'College Gate', 1, 28.6139, 77.2090),
(1, 'Station Road', 2, 28.6145, 77.2095),
(1, 'Downtown', 3, 28.6150, 77.2100);

-- Insert sample buses
INSERT INTO buses (bus_number, route_id, capacity, type, status, current_passengers) VALUES
('BUS-001', 1, 40, 'Standard', 'Not Assigned', 0),
('BUS-002', 2, 40, 'AC', 'Not Assigned', 0),
('BUS-003', 3, 35, 'Premium', 'Not Assigned', 0);

-- =====================================================
-- VIEWS (Helpful queries)
-- =====================================================

-- View: Active bus assignments with driver info
CREATE OR REPLACE VIEW active_bus_assignments AS
SELECT 
    b.id as bus_id,
    b.bus_number,
    b.route_id,
    r.route_name,
    b.capacity,
    b.current_passengers,
    b.status,
    b.type,
    u.id as driver_id,
    u.name as driver_name,
    u.email as driver_email,
    u.mobile as driver_mobile,
    dba.assigned_at
FROM buses b
LEFT JOIN driver_bus_assignments dba ON b.id = dba.bus_id AND dba.is_active = TRUE
LEFT JOIN users u ON dba.driver_id = u.id
LEFT JOIN routes r ON b.route_id = r.id;

-- View: Students with their assigned buses
CREATE OR REPLACE VIEW student_bus_info AS
SELECT 
    u.id as student_id,
    u.name as student_name,
    u.email as student_email,
    u.mobile as student_mobile,
    b.id as bus_id,
    b.bus_number,
    r.route_name,
    r.route_description,
    d.name as driver_name,
    b.status as bus_status
FROM users u
INNER JOIN student_bus_assignments sba ON u.id = sba.student_id AND sba.is_active = TRUE
INNER JOIN buses b ON sba.bus_id = b.id
LEFT JOIN routes r ON b.route_id = r.id
LEFT JOIN driver_bus_assignments dba ON b.id = dba.bus_id AND dba.is_active = TRUE
LEFT JOIN users d ON dba.driver_id = d.id
WHERE u.role = 'Student';

-- =====================================================
-- STORED PROCEDURES (Optional - useful queries)
-- =====================================================

-- Procedure: Get latest bus location
DELIMITER //
CREATE PROCEDURE GetLatestBusLocation(IN bus_id_param INT)
BEGIN
    SELECT 
        bl.*,
        b.bus_number,
        b.status
    FROM bus_locations bl
    INNER JOIN buses b ON bl.bus_id = b.id
    WHERE bl.bus_id = bus_id_param
    ORDER BY bl.timestamp DESC
    LIMIT 1;
END //
DELIMITER ;

-- Procedure: Get active trips with bus and driver info
DELIMITER //
CREATE PROCEDURE GetActiveTrips()
BEGIN
    SELECT 
        t.*,
        b.bus_number,
        b.status as bus_status,
        u.name as driver_name,
        r.route_name
    FROM trips t
    INNER JOIN buses b ON t.bus_id = b.id
    INNER JOIN users u ON t.driver_id = u.id
    LEFT JOIN routes r ON b.route_id = r.id
    WHERE t.status = 'On Route'
    ORDER BY t.start_time DESC;
END //
DELIMITER ;

-- =====================================================
-- END OF SCHEMA
-- =====================================================