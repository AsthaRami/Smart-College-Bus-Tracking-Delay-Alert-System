-- Update users table to include Staff role
-- Run this SQL if your database doesn't have Staff role yet

USE tracking;

-- Alter the role ENUM to include Staff
ALTER TABLE users 
MODIFY COLUMN role ENUM('Student', 'Parent', 'Driver', 'Staff', 'Admin') NOT NULL;

-- Verify the change
DESCRIBE users;
