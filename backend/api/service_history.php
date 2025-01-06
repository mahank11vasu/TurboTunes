<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/database.php';

$db = new Database();
$conn = $db->getConnection();

$data = json_decode(file_get_contents("php://input"), true);
$action = $data['action'] ?? null;

switch ($action) {
    case 'fetch_service_history':
        $user_id = $data['user_id'] ?? null;

        if (!$user_id) {
            http_response_code(400);
            echo json_encode(["error" => "User ID is required."]);
            exit;
        }

        $query = "
            SELECT 
                b.booking_id, 
                s.name AS service_name, 
                CONCAT(v.make, ' ', v.model, ' (', v.year, ')') AS vehicle_details,
                m.mechanic_id,
                u.name AS mechanic_name,
                u.contact AS mechanic_contact,
                m.garage_name,
                bk.status,
                bk.booking_date,
                b.total_cost
            FROM bookings bk
            JOIN billing b ON bk.booking_id = b.booking_id
            JOIN services s ON bk.service_id = s.service_id
            JOIN user_vehicles v ON bk.vehicle_id = v.vehicle_id
            LEFT JOIN mechanics m ON bk.mechanic_id = m.mechanic_id
            LEFT JOIN users u ON m.user_id = u.user_id
            WHERE bk.user_id = :user_id
            ORDER BY bk.booking_date DESC
        ";

        $stmt = $conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();

        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($result) {
            echo json_encode($result);
        } else {
            echo json_encode([]);
        }
        break;

    default:
        http_response_code(400);
        echo json_encode(["error" => "Invalid action."]);
        break;
}
?>
