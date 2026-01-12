<?php
/**
 * Get Parent's Children API Endpoint
 * Returns all children linked to the parent account
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
$host = 'localhost';
$dbname = 'tracking';
$username = 'system';
$password = '1234';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get user ID from token (simplified - in production, verify token properly)
    $headers = getallheaders();
    $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;
    
    if (!$token) {
        throw new Exception('Authorization token required');
    }
    
    // Get user from session
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
    
    // Get all children linked to this parent
    $stmt = $pdo->prepare("
        SELECT 
            psr.student_id,
            u.name as student_name,
            u.email as student_email,
            u.mobile as student_mobile,
            COALESCE(b.bus_number, '') as bus_number,
            COALESCE(r.route_name, '') as route_name,
            COALESCE(d.name, '') as driver_name,
            COALESCE(b.status, 'Not Assigned') as bus_status
        FROM parent_student_relations psr
        INNER JOIN users u ON psr.student_id = u.id
        LEFT JOIN student_bus_assignments sba ON u.id = sba.student_id AND sba.is_active = TRUE
        LEFT JOIN buses b ON sba.bus_id = b.id
        LEFT JOIN routes r ON b.route_id = r.id
        LEFT JOIN driver_bus_assignments dba ON b.id = dba.bus_id AND dba.is_active = TRUE
        LEFT JOIN users d ON dba.driver_id = d.id
        WHERE psr.parent_id = ?
    ");
    $stmt->execute([$parentId]);
    $children = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'children' => $children
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
