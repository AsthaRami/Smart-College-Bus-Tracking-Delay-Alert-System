<?php
/**
 * Get Driver's Bus Assignment
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
    $stmt = $pdo->prepare("SELECT role, name FROM users WHERE id = ?");
    $stmt->execute([$driverId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user || $user['role'] !== 'Driver') {
        throw new Exception('Access denied. Driver role required.');
    }
    
    // Get driver's assigned bus
    $stmt = $pdo->prepare("
        SELECT 
            b.id as bus_id,
            b.bus_number,
            b.status,
            b.capacity,
            b.current_passengers,
            r.id as route_id,
            r.route_name,
            r.route_description,
            dba.assigned_at
        FROM driver_bus_assignments dba
        INNER JOIN buses b ON dba.bus_id = b.id
        LEFT JOIN routes r ON b.route_id = r.id
        WHERE dba.driver_id = ? AND dba.is_active = TRUE
        LIMIT 1
    ");
    $stmt->execute([$driverId]);
    $bus = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$bus) {
        echo json_encode([
            'success' => true,
            'bus' => null,
            'message' => 'No bus assigned'
        ]);
        exit();
    }
    
    // Get route stops
    $stmt = $pdo->prepare("
        SELECT stop_name, stop_order, latitude, longitude
        FROM route_stops
        WHERE route_id = ?
        ORDER BY stop_order
    ");
    $stmt->execute([$bus['route_id']]);
    $stops = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'bus' => [
            'busNumber' => $bus['bus_number'],
            'status' => $bus['status'],
            'route' => $bus['route_name'] ? ($bus['route_name'] . ($bus['route_description'] ? ': ' . $bus['route_description'] : '')) : 'No Route',
            'routeId' => $bus['route_id'],
            'routeName' => $bus['route_name'],
            'routeDescription' => $bus['route_description'],
            'stops' => $stops,
            'driverName' => $user['name']
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
