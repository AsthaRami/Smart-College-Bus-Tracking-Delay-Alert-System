<?php
/**
 * Driver Update Bus Location
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
    
    // Get input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (empty($input['latitude']) || empty($input['longitude'])) {
        throw new Exception('Latitude and longitude are required');
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
    
    // Insert location
    $stmt = $pdo->prepare("
        INSERT INTO bus_locations (bus_id, latitude, longitude, accuracy, speed, heading, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    ");
    $stmt->execute([
        $busId,
        $input['latitude'],
        $input['longitude'],
        isset($input['accuracy']) ? $input['accuracy'] : null,
        isset($input['speed']) ? $input['speed'] : null,
        isset($input['heading']) ? $input['heading'] : null
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Location updated successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
