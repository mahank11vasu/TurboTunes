<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

// Include database connection
require_once '../config/database.php';

$db = new Database();
$conn = $db->getConnection();

// Get user_id from the request
$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
    http_response_code(400);
    echo json_encode(["error" => "User ID is required."]);
    exit;
}

try {
    // Query to fetch addresses for the user
    $query = "
        SELECT a.address_id, a.street_address, a.city_id, c.name AS city_name, s.name AS state_name
        FROM addresses a
        JOIN cities c ON a.city_id = c.city_id
        JOIN states s ON c.state_id = s.state_id
        WHERE a.user_id = :user_id
    ";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":user_id", $user_id);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $addresses = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($addresses);
    } else {
        http_response_code(404);
        echo json_encode(["error" => "No addresses found for the specified user."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch addresses.", "details" => $e->getMessage()]);
}
?>
