<?php
/**
 * Test API Connection and Database
 * Use this to verify your API setup is working
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$host = 'localhost';
$dbname = 'tracking';
$username = 'system';
$password = '1234';

$result = [
    'api_accessible' => true,
    'php_version' => phpversion(),
    'database' => []
];

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $result['database']['connected'] = true;
    $result['database']['host'] = $host;
    $result['database']['name'] = $dbname;
    
    // Check if users table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
    $result['database']['users_table_exists'] = $stmt->rowCount() > 0;
    
    // Get user count
    if ($result['database']['users_table_exists']) {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
        $result['database']['user_count'] = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    }
    
} catch (PDOException $e) {
    $result['database']['connected'] = false;
    $result['database']['error'] = $e->getMessage();
}

echo json_encode($result, JSON_PRETTY_PRINT);
?>
