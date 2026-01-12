<?php
/**
 * Get Statistics for Staff Dashboard
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
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
    
    // Get total buses
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM buses");
    $totalBuses = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get active buses
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM buses WHERE status = 'On Route'");
    $activeBuses = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get total students
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM student_bus_assignments WHERE is_active = TRUE");
    $totalStudents = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Get on-time buses (simplified - buses with no delays today)
    $stmt = $pdo->query("
        SELECT COUNT(DISTINCT b.id) as total 
        FROM buses b
        LEFT JOIN delays d ON b.id = d.bus_id AND DATE(d.reported_at) = CURDATE()
        WHERE b.status = 'On Route' AND d.id IS NULL
    ");
    $onTime = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    echo json_encode([
        'success' => true,
        'statistics' => [
            'totalBuses' => (int)$totalBuses,
            'activeBuses' => (int)$activeBuses,
            'totalStudents' => (int)$totalStudents,
            'onTime' => (int)$onTime,
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
