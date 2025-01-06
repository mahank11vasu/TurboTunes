<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once '../config/database.php';

$db = new Database();
$conn = $db->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? $_POST['action'] ?? null;

switch ($action) {
    case 'get':
        $user_id = $_GET['user_id'] ?? null;

        if (!$user_id) {
            http_response_code(400);
            echo json_encode(["error" => "User ID is required."]);
            exit;
        }

        $query = "
            SELECT b.booking_id, b.vehicle_id, b.service_id, b.mechanic_id, b.booking_date, b.status,
                   b.pick_up_location AS pick_up_id, b.drop_off_location AS drop_off_id,
                   p.street_address AS pick_up_address, d.street_address AS drop_off_address,
                   CONCAT(v.make, ' ', v.model, ' (', v.year, ')') AS vehicle_details,
                   s.name AS service_name,
                   m.garage_name AS mechanic_name
            FROM bookings b
            JOIN user_vehicles v ON b.vehicle_id = v.vehicle_id
            JOIN services s ON b.service_id = s.service_id
            LEFT JOIN mechanics m ON b.mechanic_id = m.mechanic_id
            LEFT JOIN addresses p ON b.pick_up_location = p.address_id
            LEFT JOIN addresses d ON b.drop_off_location = d.address_id
            WHERE b.user_id = :user_id
        ";

        $stmt = $conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'update':
        $booking_id = $_POST['booking_id'] ?? null;
        $pick_up_location = $_POST['pick_up_location'] ?? null;
        $drop_off_location = $_POST['drop_off_location'] ?? null;

        if (!$booking_id || !$pick_up_location || !$drop_off_location) {
            http_response_code(400);
            echo json_encode(["error" => "Missing fields for update."]);
            exit;
        }

        // Handle pick-up location if new address is provided
        if (!is_numeric($pick_up_location)) {
            $query = "INSERT INTO addresses (street_address, user_id) VALUES (:street_address, :user_id)";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(":street_address", $pick_up_location);
            $stmt->bindParam(":user_id", $_POST['user_id']);
            $stmt->execute();
            $pick_up_location = $conn->lastInsertId();
        }

        // Handle drop-off location if new address is provided
        if (!is_numeric($drop_off_location)) {
            $query = "INSERT INTO addresses (street_address, user_id) VALUES (:street_address, :user_id)";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(":street_address", $drop_off_location);
            $stmt->bindParam(":user_id", $_POST['user_id']);
            $stmt->execute();
            $drop_off_location = $conn->lastInsertId();
        }

        $query = "
            UPDATE bookings 
            SET pick_up_location = :pick_up_location, drop_off_location = :drop_off_location 
            WHERE booking_id = :booking_id
        ";

        $stmt = $conn->prepare($query);
        $stmt->bindParam(":pick_up_location", $pick_up_location);
        $stmt->bindParam(":drop_off_location", $drop_off_location);
        $stmt->bindParam(":booking_id", $booking_id);
        $stmt->execute();
        echo json_encode(["success" => true, "message" => "Booking updated successfully."]);
        break;

    case 'cancel':
        $booking_id = $_POST['booking_id'] ?? null;

        if (!$booking_id) {
            http_response_code(400);
            echo json_encode(["error" => "Booking ID is required."]);
            exit;
        }

        $query = "UPDATE bookings SET status = 'Cancelled' WHERE booking_id = :booking_id AND status = 'Pending'";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":booking_id", $booking_id);
        $stmt->execute();
        echo json_encode(["success" => true, "message" => "Booking canceled successfully."]);
        break;

    default:
        http_response_code(400);
        echo json_encode(["error" => "Invalid action."]);
}
?>
