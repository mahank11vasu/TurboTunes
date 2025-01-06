<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); // Respond OK for preflight
    exit;
}

require_once '../config/database.php';

$db = new Database();
$conn = $db->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? null;

// Decode the JSON payload for POST requests
$data = json_decode(file_get_contents("php://input"), true);

if ($method === 'POST' && !$action) {
    $action = $data['action'] ?? null;
}

switch ($action) {
    case 'get_mechanic_id':
        $user_id = $_GET['user_id'] ?? null;

        if (!$user_id) {
            http_response_code(400);
            echo json_encode(["error" => "User ID is required."]);
            exit;
        }

        $query = "SELECT mechanic_id FROM mechanics WHERE user_id = :user_id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Mechanic ID not found for the user."]);
        }
        break;

    case 'get_service_history':
        $mechanic_id = $_GET['mechanic_id'] ?? null;
    
        if (!$mechanic_id) {
            http_response_code(400);
            echo json_encode(["error" => "Mechanic ID is required."]);
            exit;
        }
    
        $query = "
            SELECT b.booking_id, u.name AS customer_name,
                    CONCAT(v.make, ' ', v.model, ' (', v.year, ')') AS vehicle_details,
                    s.name AS service_name, b.booking_date
            FROM bookings b
            JOIN users u ON b.user_id = u.user_id
            JOIN user_vehicles v ON b.vehicle_id = v.vehicle_id
            JOIN services s ON b.service_id = s.service_id
            WHERE b.mechanic_id = :mechanic_id AND b.status = 'Completed'
            ORDER BY b.booking_date DESC
        ";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":mechanic_id", $mechanic_id);
        $stmt->execute();
    
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;    

    case 'get_service_parts':
        $service_id = $_GET['service_id'] ?? null;
    
        if (!$service_id) {
            http_response_code(400);
            echo json_encode(["error" => "Service ID is required."]);
            exit;
        }
    
        $query = "
            SELECT p.part_id, p.name, p.cost AS cost_per_unit, p.stock, p.description
            FROM parts p
            JOIN service_parts sp ON p.part_id = sp.part_id
            WHERE sp.service_id = :service_id
        ";
    
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":service_id", $service_id);
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'get_active_bookings':
        $mechanic_id = $_GET['mechanic_id'] ?? null;
    
        if (!$mechanic_id) {
            http_response_code(400);
            echo json_encode(["error" => "Mechanic ID is required."]);
            exit;
        }
    
        $query = "
            SELECT b.booking_id, b.user_id, b.vehicle_id, b.service_id, b.booking_date, b.status,
                    u.name AS customer_name,
                    CONCAT(v.make, ' ', v.model, ' (', v.year, ')') AS vehicle_details,
                    s.name AS service_name
            FROM bookings b
            JOIN users u ON b.user_id = u.user_id
            JOIN user_vehicles v ON b.vehicle_id = v.vehicle_id
            JOIN services s ON b.service_id = s.service_id
            WHERE b.mechanic_id = :mechanic_id AND b.status = 'In Progress'
            ORDER BY b.booking_date ASC
        ";
    
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":mechanic_id", $mechanic_id);
        $stmt->execute();
    
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($result ?: []); // Return an empty array if no results
        break;
        

    case 'get_bookings':
        $mechanic_id = $_GET['mechanic_id'] ?? null;

        if (!$mechanic_id) {
            http_response_code(400);
            echo json_encode(["error" => "Mechanic ID is required."]);
            exit;
        }

        $query = "
            SELECT b.booking_id, b.user_id, b.vehicle_id, b.service_id, b.booking_date, b.status,
                   u.name AS customer_name,
                   CONCAT(v.make, ' ', v.model, ' (', v.year, ')') AS vehicle_details,
                   s.name AS service_name
            FROM bookings b
            JOIN users u ON b.user_id = u.user_id
            JOIN user_vehicles v ON b.vehicle_id = v.vehicle_id
            JOIN services s ON b.service_id = s.service_id
            WHERE b.mechanic_id = :mechanic_id
            ORDER BY b.booking_date ASC
        ";

        $stmt = $conn->prepare($query);
        $stmt->bindParam(":mechanic_id", $mechanic_id);
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'update_status':
        $booking_id = $data['booking_id'] ?? null;
        $status = $data['status'] ?? null;
        $mechanic_id = $data['mechanic_id'] ?? null;

        if (!$booking_id || !$status) {
            http_response_code(400);
            echo json_encode(["error" => "Booking ID and status are required."]);
            exit;
        }

        $query = "UPDATE bookings SET status = :status WHERE booking_id = :booking_id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":booking_id", $booking_id);

        if ($stmt->execute()) {
            // Insert notification for status update
            $notifyQuery = "
                INSERT INTO notifications (user_id, booking_id, message, status, mechanic_id)
                SELECT user_id, booking_id, :message, 'Pending', :mechanic_id
                FROM bookings WHERE booking_id = :booking_id
            ";
            $notifyStmt = $conn->prepare($notifyQuery);
            $message = "Your booking status has been updated to: " . $status;
            $notifyStmt->bindParam(":message", $message);
            $notifyStmt->bindParam(":booking_id", $booking_id);
            $notifyStmt->bindParam(":mechanic_id", $mechanic_id);
            $notifyStmt->execute();

            echo json_encode(["success" => true, "message" => "Booking status updated successfully."]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to update booking status."]);
        }
        break;

    case 'reschedule':
        $booking_id = $data['booking_id'] ?? null;
        $new_date = $data['new_date'] ?? null;
        $mechanic_id = $data['mechanic_id'] ?? null;

        if (!$booking_id || !$new_date) {
            http_response_code(400);
            echo json_encode(["error" => "Booking ID and new date are required."]);
            exit;
        }

        $query = "UPDATE bookings SET booking_date = :new_date WHERE booking_id = :booking_id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":new_date", $new_date);
        $stmt->bindParam(":booking_id", $booking_id);

        if ($stmt->execute()) {
            // Insert notification for rescheduling
            $notifyQuery = "
                INSERT INTO notifications (user_id, booking_id, message, status, mechanic_id)
                SELECT user_id, booking_id, :message, 'Pending', :mechanic_id
                FROM bookings WHERE booking_id = :booking_id
            ";
            $notifyStmt = $conn->prepare($notifyQuery);
            $message = "Your booking has been rescheduled to: " . $new_date;
            $notifyStmt->bindParam(":message", $message);
            $notifyStmt->bindParam(":booking_id", $booking_id);
            $notifyStmt->bindParam(":mechanic_id", $mechanic_id);
            $notifyStmt->execute();

            echo json_encode(["success" => true, "message" => "Booking rescheduled successfully."]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to reschedule booking."]);
        }
        break;

    case 'log_parts':
        $booking_id = $data['booking_id'] ?? null;
        $parts = $data['parts'] ?? null;
    
        if (!$booking_id || !$parts || !is_array($parts)) {
            http_response_code(400);
            echo json_encode(["error" => "Booking ID and parts are required."]);
            exit;
        }
    
        foreach ($parts as $part) {
            $query = "
                INSERT INTO booking_parts (booking_id, part_id, quantity, cost)
                VALUES (:booking_id, :part_id, :quantity, :cost)
                ON DUPLICATE KEY UPDATE 
                    quantity = quantity + :quantity,
                    cost = cost + :cost
            ";
            $stmt = $conn->prepare($query);
    
            // Calculate the cost for the current part
            $total_cost = $part['quantity'] * $part['cost_per_unit'];
    
            $stmt->bindParam(":booking_id", $booking_id);
            $stmt->bindParam(":part_id", $part['part_id']);
            $stmt->bindParam(":quantity", $part['quantity']);
            $stmt->bindParam(":cost", $total_cost); // Use the calculated cost
            $stmt->execute();
    
            // Update stock in the `parts` table
            $updateStockQuery = "UPDATE parts SET stock = stock - :quantity WHERE part_id = :part_id";
            $stockStmt = $conn->prepare($updateStockQuery);
            $stockStmt->bindParam(":quantity", $part['quantity']);
            $stockStmt->bindParam(":part_id", $part['part_id']);
            $stockStmt->execute();
        }
    
        echo json_encode(["success" => true, "message" => "Parts logged successfully."]);
        break;


    case 'get_booking_details':
        $booking_id = $_GET['booking_id'] ?? null;

        if (!$booking_id) {
            http_response_code(400);
            echo json_encode(["error" => "Booking ID is required."]);
            exit;
        }

        // Fetch booking details
        $query = "
            SELECT b.booking_id, b.user_id, b.vehicle_id, b.service_id, b.booking_date, b.status,
                    u.name AS customer_name, u.contact,
                    CONCAT(v.make, ' ', v.model, ' (', v.year, ')') AS vehicle_details,
                    s.name AS service_name, s.base_cost AS service_cost
            FROM bookings b
            JOIN users u ON b.user_id = u.user_id
            JOIN user_vehicles v ON b.vehicle_id = v.vehicle_id
            JOIN services s ON b.service_id = s.service_id
            WHERE b.booking_id = :booking_id
        ";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":booking_id", $booking_id);
        $stmt->execute();
        $bookingDetails = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$bookingDetails) {
            http_response_code(404);
            echo json_encode(["error" => "Booking not found."]);
            exit;
        }

        // Fetch parts used in the booking
        $partsQuery = "
            SELECT p.name, bp.quantity, bp.cost
            FROM booking_parts bp
            JOIN parts p ON bp.part_id = p.part_id
            WHERE bp.booking_id = :booking_id
        ";
        $partsStmt = $conn->prepare($partsQuery);
        $partsStmt->bindParam(":booking_id", $booking_id);
        $partsStmt->execute();
        $bookingDetails['parts_used'] = $partsStmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($bookingDetails);
        break;
        
    case 'get_parts_usage':
        $booking_id = $_GET['booking_id'] ?? null;
    
        if (!$booking_id) {
            http_response_code(400);
            echo json_encode(["error" => "Booking ID is required."]);
            exit;
        }
    
        $query = "
            SELECT p.part_id, p.name, bp.quantity, bp.cost
            FROM booking_parts bp
            JOIN parts p ON bp.part_id = p.part_id
            WHERE bp.booking_id = :booking_id
        ";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":booking_id", $booking_id);
        $stmt->execute();
    
        $parts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($parts);
        break;


        
    
    case 'finalize_bill':
        $booking_id = $data['booking_id'] ?? null;
        $total_cost = $data['total_cost'] ?? null;
    
        if (!$booking_id || !$total_cost) {
            http_response_code(400);
            echo json_encode(["error" => "Booking ID and total cost are required."]);
            exit;
        }
    
        // Fetch mechanic ID from the bookings table
        $mechanicQuery = "SELECT mechanic_id FROM bookings WHERE booking_id = :booking_id";
        $mechanicStmt = $conn->prepare($mechanicQuery);
        $mechanicStmt->bindParam(":booking_id", $booking_id);
        $mechanicStmt->execute();
        $mechanicResult = $mechanicStmt->fetch(PDO::FETCH_ASSOC);
    
        if (!$mechanicResult || !$mechanicResult['mechanic_id']) {
            http_response_code(400);
            echo json_encode(["error" => "Mechanic ID not found for the given booking."]);
            exit;
        }
    
        $mechanic_id = $mechanicResult['mechanic_id'];
    
        // Insert billing record
        $query = "INSERT INTO billing (booking_id, total_cost) VALUES (:booking_id, :total_cost)";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":booking_id", $booking_id);
        $stmt->bindParam(":total_cost", $total_cost);
        $stmt->execute();
    
        // Update booking status
        $statusQuery = "UPDATE bookings SET status = 'Completed' WHERE booking_id = :booking_id";
        $statusStmt = $conn->prepare($statusQuery);
        $statusStmt->bindParam(":booking_id", $booking_id);
        $statusStmt->execute();
    
        // Notify customer
        $notifyQuery = "
            INSERT INTO notifications (user_id, booking_id, message, status, mechanic_id)
            SELECT user_id, booking_id, :message, 'Pending', :mechanic_id
            FROM bookings WHERE booking_id = :booking_id
        ";
        $notifyStmt = $conn->prepare($notifyQuery);
        $message = "Your booking has been finalized with a total cost of ₹" . $total_cost;
        $notifyStmt->bindParam(":message", $message);
        $notifyStmt->bindParam(":booking_id", $booking_id);
        $notifyStmt->bindParam(":mechanic_id", $mechanic_id); // Pass the mechanic ID here
        $notifyStmt->execute();
    
        echo json_encode(["success" => true, "message" => "Bill finalized successfully."]);
        break;
        
        


    default:
        http_response_code(400);
        echo json_encode(["error" => "Invalid action."]);
}
?>
