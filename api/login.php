<?php
/**
 * User Login API Endpoint
 * Handles user authentication and returns user data including role
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Database configuration
$host = 'localhost';
$dbname = 'tracking';
$username = 'system';
$password = '1234';

try {
    // Connect to database
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }
    
    // Validate required fields
    if (empty($input['email']) || empty($input['password'])) {
        throw new Exception('Email and password are required');
    }
    
    // Find user by email
    $stmt = $pdo->prepare("
        SELECT id, name, email, mobile, password, role, is_active
        FROM users
        WHERE email = ?
    ");
    $stmt->execute([$input['email']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        throw new Exception('Invalid email or password');
    }
    
    // Check if user is active
    if (!$user['is_active']) {
        throw new Exception('Your account has been deactivated. Please contact administrator.');
    }
    
    // Verify password (password is already hashed with SHA-256 from frontend)
    if ($user['password'] !== $input['password']) {
        throw new Exception('Invalid email or password');
    }
    
    // Generate a simple token (in production, use JWT)
    $token = bin2hex(random_bytes(32));
    
    // Store session in database (optional - for session management)
    $stmt = $pdo->prepare("
        INSERT INTO sessions (user_id, session_token, expires_at, created_at)
        VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR), NOW())
    ");
    $stmt->execute([$user['id'], $token]);
    
    // Return success response with user data and role
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'mobile' => $user['mobile'],
            'role' => $user['role'] // Role is fetched from database
        ]
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
