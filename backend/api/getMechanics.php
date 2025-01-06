<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Include database connection
require_once '../config/database.php';

$db = new Database();
$conn = $db->getConnection();

$city_id = $_GET['city_id'] ?? null;

if (!$city_id) {
    http_response_code(400);
    echo json_encode(["error" => "City ID is required."]);
    exit;
}

$query = "
    SELECT m.mechanic_id, m.garage_name, m.specialization_tags, m.category, u.name AS mechanic_name, 
           AVG(rr.rating) AS average_rating
    FROM mechanics m
    LEFT JOIN users u ON m.user_id = u.user_id
    LEFT JOIN reviews_and_ratings rr ON m.mechanic_id = rr.mechanic_id
    WHERE EXISTS (
        SELECT 1
        FROM addresses a
        WHERE a.city_id = :city_id AND a.user_id = u.user_id
    )
    GROUP BY m.mechanic_id, m.garage_name, m.specialization_tags, m.category, u.name
    ORDER BY average_rating DESC
";

$stmt = $conn->prepare($query);
$stmt->bindParam(":city_id", $city_id);
$stmt->execute();

if ($stmt->rowCount() > 0) {
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} else {
    http_response_code(404);
    echo json_encode(["error" => "No mechanics found for the specified city."]);
}
?>
