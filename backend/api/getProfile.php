<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

// Include database connection
require_once '../config/database.php';

$db = new Database();
$conn = $db->getConnection();

$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
    http_response_code(400);
    echo json_encode(["error" => "User ID is required."]);
    exit;
}

$query = "
    SELECT u.user_id, u.name, u.contact, u.dob, u.gender, 
           a.street_address, a.city_id, c.state_id,
           m.garage_name, m.specialization_tags, m.category, -- Fetch category from mechanics
           ur.role_id, r.role_name
    FROM users u
    LEFT JOIN addresses a ON u.user_id = a.user_id
    LEFT JOIN cities c ON a.city_id = c.city_id
    LEFT JOIN mechanics m ON u.user_id = m.user_id
    LEFT JOIN user_roles ur ON u.user_id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.role_id
    WHERE u.user_id = :user_id
";

$stmt = $conn->prepare($query);
$stmt->bindParam(":user_id", $user_id);
$stmt->execute();

if ($stmt->rowCount() > 0) {
    echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
} else {
    http_response_code(404);
    echo json_encode(["error" => "Profile not found."]);
}
?>
