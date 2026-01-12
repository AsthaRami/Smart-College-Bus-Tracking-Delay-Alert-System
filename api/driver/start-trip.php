<?php
/**
 * Driver Start Trip
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = 'localhost';
$dbname = 'tracking';
$username = 'system';
$password = '1234';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get user from token
    $headers = getallheaders();
    $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;
    
    if (!$token) {
        throw new Exception('Authorization token required');
    }
    
    $stmt = $pdo->prepare("SELECT user_id FROM sessions WHERE session_token = ? AND expires_at > NOW()");
    $stmt->execute([$token]);
    $session = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$session) {
        throw new Exception('Invalid or expired session');
    }
    
    $driverId = $session['user_id'];
    
    // Verify user is a driver
    $stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->execute([$driverId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user || $user['role'] !== 'Driver') {
        throw new Exception('Access denied. Driver role required.');
    }
    
    // Get driver's bus
    $stmt = $pdo->prepare("
        SELECT bus_id FROM driver_bus_assignments
        WHERE driver_id = ? AND is_active = TRUE
        LIMIT 1
    ");
    $stmt->execute([$driverId]);
    $assignment = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$assignment) {
        throw new Exception('No bus assigned to driver');
    }
    
    $busId = $assignment['bus_id'];
    
    // Create new trip
    $stmt = $pdo->prepare("
        INSERT INTO trips (bus_id, driver_id, start_time, status, created_at)
        VALUES (?, ?, NOW(), 'On Route', NOW())
    ");
    $stmt->execute([$busId, $driverId]);
    $tripId = $pdo->lastInsertId();
    
    // Update bus status
    $stmt = $pdo->prepare("UPDATE buses SET status = 'On Route' WHERE id = ?");
    $stmt->execute([$busId]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Trip started successfully',
        'trip_id' => $tripId
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
