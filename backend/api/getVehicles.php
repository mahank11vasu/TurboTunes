<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

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
    SELECT uv.vehicle_id, uv.category_id, uv.make, uv.model, uv.year, uv.registration_number, vo.ownership_end
    FROM user_vehicles uv
    JOIN vehicle_ownership vo ON uv.vehicle_id = vo.vehicle_id
    WHERE vo.user_id = :user_id
";

$stmt = $conn->prepare($query);
$stmt->bindParam(":user_id", $user_id);
$stmt->execute();

$vehicles = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($vehicles);
?>
