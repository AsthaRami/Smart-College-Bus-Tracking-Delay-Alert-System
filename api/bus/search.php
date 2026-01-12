<?php
/**
 * Search Bus by Number
 * Returns bus information including current location
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Allow public access to bus search (no authentication required for Track Bus page)

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
    
    // Get bus number from query parameter
    $busNumber = isset($_GET['bus_number']) ? trim($_GET['bus_number']) : '';
    
    if (empty($busNumber)) {
        throw new Exception('Bus number is required');
    }
    
    // Search for bus
    $stmt = $pdo->prepare("
        SELECT 
            b.id,
            b.bus_number,
            b.status,
            b.capacity,
            b.current_passengers,
            r.id as route_id,
            r.route_name,
            r.route_description,
            u.name as driver_name,
            u.id as driver_id
        FROM buses b
        LEFT JOIN routes r ON b.route_id = r.id
        LEFT JOIN driver_bus_assignments dba ON b.id = dba.bus_id AND dba.is_active = TRUE
        LEFT JOIN users u ON dba.driver_id = u.id
        WHERE b.bus_number = ?
        LIMIT 1
    ");
    $stmt->execute([$busNumber]);
    $bus = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$bus) {
        echo json_encode([
            'success' => false,
            'message' => 'Bus not found'
        ]);
        exit();
    }
    
    // Get latest bus location
    $stmt = $pdo->prepare("
        SELECT latitude, longitude, timestamp, speed, heading
        FROM bus_locations
        WHERE bus_id = ?
        ORDER BY timestamp DESC
        LIMIT 1
    ");
    $stmt->execute([$bus['id']]);
    $location = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Get route stops
    $stops = [];
    if ($bus['route_id']) {
        $stmt = $pdo->prepare("
            SELECT stop_name, stop_order, latitude, longitude
            FROM route_stops
            WHERE route_id = ?
            ORDER BY stop_order
        ");
        $stmt->execute([$bus['route_id']]);
        $stops = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    // Get latest delay if exists
    $stmt = $pdo->prepare("
        SELECT delay_reason, delay_minutes, severity, reported_at
        FROM delays
        WHERE bus_id = ? AND reported_at >= DATE_SUB(NOW(), INTERVAL 2 HOUR)
        ORDER BY reported_at DESC
        LIMIT 1
    ");
    $stmt->execute([$bus['id']]);
    $delay = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'bus' => [
            'id' => $bus['id'],
            'bus_number' => $bus['bus_number'],
            'status' => $bus['status'],
            'route' => $bus['route_name'] ? ($bus['route_name'] . ($bus['route_description'] ? ': ' . $bus['route_description'] : '')) : 'No Route',
            'route_name' => $bus['route_name'],
            'route_description' => $bus['route_description'],
            'driver_name' => $bus['driver_name'] ? $bus['driver_name'] : 'Not Assigned',
            'driver_id' => $bus['driver_id'],
            'location' => $location ? [
                'lat' => (float)$location['latitude'],
                'lng' => (float)$location['longitude'],
                'timestamp' => $location['timestamp'],
                'speed' => (float)$location['speed']
            ] : null,
            'stops' => $stops,
            'delay' => $delay ? [
                'reason' => $delay['delay_reason'],
                'minutes' => (int)$delay['delay_minutes'],
                'severity' => $delay['severity'],
                'reported_at' => $delay['reported_at']
            ] : null
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
