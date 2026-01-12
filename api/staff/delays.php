<?php
/**
 * Get All Delays for Staff Dashboard
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
    
    // Get recent delays (last 24 hours)
    $stmt = $pdo->prepare("
        SELECT 
            d.id,
            d.delay_reason,
            d.delay_minutes,
            d.severity,
            d.reported_at,
            u.name as driver_name,
            b.bus_number,
            r.route_name
        FROM delays d
        INNER JOIN buses b ON d.bus_id = b.id
        LEFT JOIN users u ON d.driver_id = u.id
        LEFT JOIN routes r ON b.route_id = r.id
        WHERE d.reported_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ORDER BY d.reported_at DESC
        LIMIT 50
    ");
    $stmt->execute();
    $delays = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'delays' => $delays
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
