<?php
/**
 * User Signup API Endpoint
 * Handles user registration and stores data in database
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

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
$username = 'system'; // Change if needed
$password = '1234'; // Change if needed

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
    $requiredFields = ['name', 'email', 'mobile', 'role', 'password'];
    foreach ($requiredFields as $field) {
        if (empty($input[$field])) {
            throw new Exception("Field '$field' is required");
        }
    }
    
    // Validate role
    $allowedRoles = ['Student', 'Parent', 'Driver', 'Staff', 'Admin'];
    if (!in_array($input['role'], $allowedRoles)) {
        throw new Exception('Invalid role specified');
    }
    
    // Validate email format
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }
    
    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$input['email']]);
    if ($stmt->fetch()) {
        throw new Exception('Email already registered');
    }
    
    // Check if mobile already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE mobile = ?");
    $stmt->execute([$input['mobile']]);
    if ($stmt->fetch()) {
        throw new Exception('Mobile number already registered');
    }
    
    // Insert new user
    $stmt = $pdo->prepare("
        INSERT INTO users (name, email, mobile, password, role, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, TRUE, NOW())
    ");
    
    $stmt->execute([
        $input['name'],
        $input['email'],
        $input['mobile'],
        $input['password'], // Password is already hashed (SHA-256) from frontend
        $input['role']
    ]);
    
    $userId = $pdo->lastInsertId();
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'User registered successfully',
        'user' => [
            'id' => $userId,
            'name' => $input['name'],
            'email' => $input['email'],
            'mobile' => $input['mobile'],
            'role' => $input['role']
        ]
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection error. Please check database credentials and ensure MySQL is running.',
        'error' => $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
