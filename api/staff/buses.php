<?php
/**
 * Get All Buses for Staff Dashboard
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
    
    // Get all buses with their details
    $stmt = $pdo->prepare("
        SELECT 
            b.id,
            b.bus_number,
            b.capacity,
            b.current_passengers,
            b.status,
            b.type,
            r.route_name,
            u.name as driver_name,
            u.id as driver_id
        FROM buses b
        LEFT JOIN routes r ON b.route_id = r.id
        LEFT JOIN driver_bus_assignments dba ON b.id = dba.bus_id AND dba.is_active = TRUE
        LEFT JOIN users u ON dba.driver_id = u.id
        ORDER BY b.bus_number
    ");
    $stmt->execute();
    $buses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get total students count
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM student_bus_assignments WHERE is_active = TRUE");
    $stmt->execute();
    $totalStudents = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    echo json_encode([
        'success' => true,
        'buses' => $buses,
        'totalStudents' => $totalStudents
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
