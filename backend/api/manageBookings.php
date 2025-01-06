<?php
header("Access-Control-Allow-Origin: *"); // Allows requests from any origin
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Allows POST and OPTIONS methods
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allows specific headers

// Handle OPTIONS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); // Return a 200 OK for preflight requests
    exit;
}

require_once '../config/database.php';

$db = new Database();
$conn = $db->getConnection();

$data = json_decode(file_get_contents("php://input"), true);

$action = $data['action'] ?? null;
$user_id = $data['user_id'] ?? null;
$vehicle_id = $data['vehicle_id'] ?? null;
$service_id = $data['service_id'] ?? null;
$mechanic_id = $data['mechanic_id'] ?? null;
$booking_date = $data['booking_date'] ?? null;
$pick_up_location = $data['pick_up_location'] ?? null;
$drop_off_location = $data['drop_off_location'] ?? null;

if (!$action || !$user_id || !$vehicle_id || !$service_id || !$mechanic_id) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required fields."]);
    exit;
}

try {
    if ($action === "add") {
        $query = "INSERT INTO bookings (user_id, vehicle_id, service_id, mechanic_id, booking_date, pick_up_location, drop_off_location) 
                  VALUES (:user_id, :vehicle_id, :service_id, :mechanic_id, :booking_date, :pick_up_location, :drop_off_location)";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":vehicle_id", $vehicle_id);
        $stmt->bindParam(":service_id", $service_id);
        $stmt->bindParam(":mechanic_id", $mechanic_id);
        $stmt->bindParam(":booking_date", $booking_date);
        $stmt->bindParam(":pick_up_location", $pick_up_location);
        $stmt->bindParam(":drop_off_location", $drop_off_location);
        $stmt->execute();

        echo json_encode(["success" => true, "message" => "Booking created successfully."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to process booking.", "details" => $e->getMessage()]);
}
?>
