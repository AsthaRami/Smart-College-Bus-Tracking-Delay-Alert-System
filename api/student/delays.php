<?php
/**
 * Get Delays for Student's Bus
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
    
    // Get student's bus
    $stmt = $pdo->prepare("
        SELECT bus_id FROM student_bus_assignments
        WHERE student_id = ? AND is_active = TRUE
        LIMIT 1
    ");
    $stmt->execute([$studentId]);
    $assignment = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$assignment) {
        echo json_encode([
            'success' => true,
            'delays' => []
        ]);
        exit();
    }
    
    // Get recent delays (last 24 hours)
    $stmt = $pdo->prepare("
        SELECT 
            d.id,
            d.delay_reason,
            d.delay_minutes,
            d.severity,
            d.reported_at,
            u.name as driver_name,
            b.bus_number
        FROM delays d
        INNER JOIN buses b ON d.bus_id = b.id
        LEFT JOIN users u ON d.driver_id = u.id
        WHERE d.bus_id = ? AND d.reported_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        ORDER BY d.reported_at DESC
        LIMIT 10
    ");
    $stmt->execute([$assignment['bus_id']]);
    $delays = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get unread notifications
    $stmt = $pdo->prepare("
        SELECT id, title, message, notification_type, created_at, is_read
        FROM notifications
        WHERE user_id = ? AND notification_type = 'delay' AND is_read = FALSE
        ORDER BY created_at DESC
    ");
    $stmt->execute([$studentId]);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'delays' => $delays,
        'notifications' => $notifications
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
