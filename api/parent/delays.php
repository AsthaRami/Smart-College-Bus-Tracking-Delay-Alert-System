<?php
/**
 * Get Delays for Parent's Children Buses
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
    
    $parentId = $session['user_id'];
    
    // Verify user is a parent
    $stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->execute([$parentId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user || $user['role'] !== 'Parent') {
        throw new Exception('Access denied. Parent role required.');
    }
    
    // Get parent's children buses
    $stmt = $pdo->prepare("
        SELECT DISTINCT sba.bus_id
        FROM parent_student_relations psr
        INNER JOIN student_bus_assignments sba ON psr.student_id = sba.student_id
        WHERE psr.parent_id = ? AND sba.is_active = TRUE
    ");
    $stmt->execute([$parentId]);
    $busIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (empty($busIds)) {
        echo json_encode([
            'success' => true,
            'delays' => [],
            'notifications' => []
        ]);
        exit();
    }
    
    // Get recent delays for these buses (last 24 hours)
    $placeholders = str_repeat('?,', count($busIds) - 1) . '?';
    $stmt = $pdo->prepare("
        SELECT 
            d.id,
            d.delay_reason,
            d.delay_minutes,
            d.severity,
            d.reported_at,
            u.name as driver_name,
            b.bus_number,
            s.name as student_name
        FROM delays d
        INNER JOIN buses b ON d.bus_id = b.id
        LEFT JOIN users u ON d.driver_id = u.id
        INNER JOIN student_bus_assignments sba ON b.id = sba.bus_id
        INNER JOIN users s ON sba.student_id = s.id
        INNER JOIN parent_student_relations psr ON s.id = psr.student_id
        WHERE d.bus_id IN ($placeholders) 
        AND d.reported_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        AND psr.parent_id = ?
        ORDER BY d.reported_at DESC
        LIMIT 20
    ");
    $params = array_merge($busIds, [$parentId]);
    $stmt->execute($params);
    $delays = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get unread notifications
    $stmt = $pdo->prepare("
        SELECT id, title, message, notification_type, created_at, is_read
        FROM notifications
        WHERE user_id = ? AND notification_type = 'delay' AND is_read = FALSE
        ORDER BY created_at DESC
    ");
    $stmt->execute([$parentId]);
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
