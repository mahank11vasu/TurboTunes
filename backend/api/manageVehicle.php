<?php
header("Access-Control-Allow-Origin: http://localhost:3000"); // Allow requests from your React frontend
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Handle OPTIONS preflight request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/database.php';

$db = new Database();
$conn = $db->getConnection();

$data = json_decode(file_get_contents("php://input"), true);

$user_id = $data['user_id'] ?? null;
$category_id = $data['category_id'] ?? null;
$make = $data['make'] ?? null;
$model = $data['model'] ?? null;
$year = $data['year'] ?? null;
$registration_number = $data['registration_number'] ?? null;
$ownership_start = $data['ownership_start'] ?? null;
$ownership_end = $data['ownership_end'] ?? null;
$vehicle_id = $data['vehicle_id'] ?? null;
$action = $data['action'] ?? 'add';

if (!$user_id) {
    http_response_code(400);
    echo json_encode(["error" => "User ID is required."]);
    exit;
}

try {
    switch ($action) {
        case "add":
            $query = "
                INSERT INTO user_vehicles (category_id, make, model, year, registration_number)
                VALUES (:category_id, :make, :model, :year, :registration_number)
            ";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(":category_id", $category_id);
            $stmt->bindParam(":make", $make);
            $stmt->bindParam(":model", $model);
            $stmt->bindParam(":year", $year);
            $stmt->bindParam(":registration_number", $registration_number);
            $stmt->execute();
            $vehicle_id = $conn->lastInsertId();

            $query = "
                INSERT INTO vehicle_ownership (user_id, vehicle_id, ownership_start, ownership_end)
                VALUES (:user_id, :vehicle_id, :ownership_start, :ownership_end)
            ";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->bindParam(":vehicle_id", $vehicle_id);
            $stmt->bindParam(":ownership_start", $ownership_start);
            $stmt->bindParam(":ownership_end", $ownership_end);
            $stmt->execute();

            echo json_encode(["success" => true, "message" => "Vehicle added successfully!"]);
            break;

        case "update":
            $query = "
                UPDATE user_vehicles 
                SET category_id = :category_id, make = :make, model = :model, year = :year, registration_number = :registration_number
                WHERE vehicle_id = :vehicle_id
            ";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(":category_id", $category_id);
            $stmt->bindParam(":make", $make);
            $stmt->bindParam(":model", $model);
            $stmt->bindParam(":year", $year);
            $stmt->bindParam(":registration_number", $registration_number);
            $stmt->bindParam(":vehicle_id", $vehicle_id);
            $stmt->execute();

            $query = "
                UPDATE vehicle_ownership 
                SET ownership_start = :ownership_start, ownership_end = :ownership_end
                WHERE vehicle_id = :vehicle_id AND user_id = :user_id
            ";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(":ownership_start", $ownership_start);
            $stmt->bindParam(":ownership_end", $ownership_end);
            $stmt->bindParam(":vehicle_id", $vehicle_id);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->execute();

            echo json_encode(["success" => true, "message" => "Vehicle updated successfully!"]);
            break;

        case "delete":
            $query = "DELETE FROM user_vehicles WHERE vehicle_id = :vehicle_id";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(":vehicle_id", $vehicle_id);
            $stmt->execute();

            echo json_encode(["success" => true, "message" => "Vehicle deleted successfully!"]);
            break;

        default:
            http_response_code(400);
            echo json_encode(["error" => "Invalid action."]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "An error occurred.", "details" => $e->getMessage()]);
}
?>
