<?php
/**
 * Get Student's Bus Assignment and Live Data
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
    
    $studentId = $session['user_id'];
    
    // Verify user is a student
    $stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->execute([$studentId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user || $user['role'] !== 'Student') {
        throw new Exception('Access denied. Student role required.');
    }
    
    // Get student's bus assignment
    $stmt = $pdo->prepare("
        SELECT 
            b.id as bus_id,
            b.bus_number,
            b.status,
            r.id as route_id,
            r.route_name,
            r.route_description,
            d.name as driver_name,
            d.id as driver_id
        FROM student_bus_assignments sba
        INNER JOIN buses b ON sba.bus_id = b.id
        LEFT JOIN routes r ON b.route_id = r.id
        LEFT JOIN driver_bus_assignments dba ON b.id = dba.bus_id AND dba.is_active = TRUE
        LEFT JOIN users d ON dba.driver_id = d.id
        WHERE sba.student_id = ? AND sba.is_active = TRUE
        LIMIT 1
    ");
    $stmt->execute([$studentId]);
    $assignment = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$assignment) {
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
    $stmt->execute([$assignment['route_id']]);
    $stops = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get latest bus location
    $stmt = $pdo->prepare("
        SELECT latitude, longitude, timestamp, speed, heading
        FROM bus_locations
        WHERE bus_id = ?
        ORDER BY timestamp DESC
        LIMIT 1
    ");
    $stmt->execute([$assignment['bus_id']]);
    $location = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Get latest delay if exists (last 2 hours)
    $stmt = $pdo->prepare("
        SELECT delay_reason, delay_minutes, severity, reported_at
        FROM delays
        WHERE bus_id = ? AND reported_at >= DATE_SUB(NOW(), INTERVAL 2 HOUR)
        ORDER BY reported_at DESC
        LIMIT 1
    ");
    $stmt->execute([$assignment['bus_id']]);
    $delay = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Calculate ETA (simplified - can be enhanced with route planning)
    $eta = null;
    if ($location && $assignment['status'] === 'On Route') {
        // Simple calculation: assume 30 minutes from current location
        $eta = date('Y-m-d H:i:s', strtotime('+30 minutes'));
    }
    
    echo json_encode([
        'success' => true,
        'bus' => [
            'busNumber' => $assignment['bus_number'],
            'status' => $assignment['status'],
            'route' => $assignment['route_name'] ? ($assignment['route_name'] . ($assignment['route_description'] ? ': ' . $assignment['route_description'] : '')) : 'No Route',
            'routeName' => $assignment['route_name'],
            'routeDescription' => $assignment['route_description'],
            'assignedDriver' => $assignment['driver_name'] ? $assignment['driver_name'] : 'Not Assigned',
            'driverId' => $assignment['driver_id'],
            'stops' => $stops,
            'location' => $location ? [
                'lat' => (float)$location['latitude'],
                'lng' => (float)$location['longitude'],
                'timestamp' => $location['timestamp'],
                'speed' => (float)$location['speed']
            ] : null,
            'eta' => $eta,
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
