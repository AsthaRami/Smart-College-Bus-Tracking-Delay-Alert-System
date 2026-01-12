<?php
/**
 * Driver Report Delay
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
    
    // Get input
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);
    
    // Debug: Log input if needed
    if (!$input) {
        error_log('Invalid JSON input: ' . $rawInput);
        throw new Exception('Invalid JSON input received');
    }
    
    if (empty($input['delay_reason']) || trim($input['delay_reason']) === '') {
        throw new Exception('Delay reason is required');
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
    
    // Get active trip if exists
    $stmt = $pdo->prepare("
        SELECT id FROM trips
        WHERE driver_id = ? AND bus_id = ? AND status = 'On Route'
        ORDER BY start_time DESC
        LIMIT 1
    ");
    $stmt->execute([$driverId, $busId]);
    $trip = $stmt->fetch(PDO::FETCH_ASSOC);
    $tripId = $trip ? $trip['id'] : null;
    
    // Determine severity based on delay minutes
    $delayMinutes = isset($input['delay_minutes']) ? (int)$input['delay_minutes'] : 0;
    $severity = 'Medium';
    if ($delayMinutes >= 30) {
        $severity = 'Critical';
    } elseif ($delayMinutes >= 15) {
        $severity = 'High';
    } elseif ($delayMinutes < 5) {
        $severity = 'None';
    }
    
    // Insert delay
    $stmt = $pdo->prepare("
        INSERT INTO delays (trip_id, bus_id, driver_id, delay_reason, delay_minutes, severity, reported_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    ");
    $stmt->execute([
        $tripId,
        $busId,
        $driverId,
        $input['delay_reason'],
        $delayMinutes,
        $severity
    ]);
    
    $delayId = $pdo->lastInsertId();
    
    // Create notifications for students and parents
    // Get all students assigned to this bus
    $stmt = $pdo->prepare("
        SELECT DISTINCT student_id FROM student_bus_assignments
        WHERE bus_id = ? AND is_active = TRUE
    ");
    $stmt->execute([$busId]);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Create notifications
    foreach ($students as $student) {
        // Notification for student
        $stmt = $pdo->prepare("
            INSERT INTO notifications (user_id, delay_id, notification_type, title, message, created_at)
            VALUES (?, ?, 'delay', ?, ?, NOW())
        ");
        $title = "Bus Delay Alert";
        $message = "Your bus is delayed. Reason: " . $input['delay_reason'];
        if ($delayMinutes > 0) {
            $message .= " (Approx. " . $delayMinutes . " minutes)";
        }
        $stmt->execute([$student['student_id'], $delayId, $title, $message]);
        
        // Get parents of this student
        $stmt2 = $pdo->prepare("
            SELECT parent_id FROM parent_student_relations
            WHERE student_id = ?
        ");
        $stmt2->execute([$student['student_id']]);
        $parents = $stmt2->fetchAll(PDO::FETCH_ASSOC);
        
        // Create notifications for parents
        foreach ($parents as $parent) {
            $stmt3 = $pdo->prepare("
                INSERT INTO notifications (user_id, delay_id, notification_type, title, message, created_at)
                VALUES (?, ?, 'delay', ?, ?, NOW())
            ");
            $stmt3->execute([$parent['parent_id'], $delayId, $title, $message]);
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Delay reported successfully',
        'delay_id' => $delayId
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
