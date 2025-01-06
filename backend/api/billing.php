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
    // Fetch bills for a user
    case 'fetch_bills':
        $user_id = $data['user_id'] ?? null;
    
        if (!$user_id) {
            http_response_code(400);
            echo json_encode(["error" => "User ID is required."]);
            exit;
        }
    
        $query = "
            SELECT 
                b.bill_id, 
                b.booking_id, 
                b.total_cost, 
                t.payment_status, 
                CONCAT(v.make, ' ', v.model, ' (', v.year, ')') AS vehicle_details,
                s.name AS service_name,
                m.mechanic_id,
                u.name AS mechanic_name,
                u.contact AS mechanic_contact,
                m.garage_name,
                bk.booking_date,
                -- Check if a review exists for this booking
                CASE 
                    WHEN r.review_id IS NOT NULL THEN 1
                    ELSE 0
                END AS has_reviewed
            FROM billing b
            LEFT JOIN transactions t ON b.bill_id = t.bill_id
            JOIN bookings bk ON b.booking_id = bk.booking_id
            JOIN user_vehicles v ON bk.vehicle_id = v.vehicle_id
            JOIN services s ON bk.service_id = s.service_id
            LEFT JOIN mechanics m ON bk.mechanic_id = m.mechanic_id
            LEFT JOIN users u ON m.user_id = u.user_id
            LEFT JOIN reviews_and_ratings r ON r.booking_id = bk.booking_id AND r.user_id = :user_id
            WHERE bk.user_id = :user_id
        ";
    
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();
    
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
    

    case 'fetch_mechanic_id':
        $user_id = $data['user_id'] ?? null;
    
        if (!$user_id) {
            http_response_code(400);
            echo json_encode(["error" => "User ID is required."]);
            exit;
        }
    
        $query = "SELECT mechanic_id FROM mechanics WHERE user_id = :user_id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();
    
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
        if ($result) {
            echo json_encode(["mechanic_id" => $result['mechanic_id']]);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Mechanic ID not found."]);
        }
        break;
        
    // Fetch pending payments with detailed information
    case 'fetch_pending_payments':
        $mechanic_id = $data['mechanic_id'] ?? null;

        if (!$mechanic_id) {
            http_response_code(400);
            echo json_encode(["error" => "Mechanic ID is required."]);
            exit;
        }

        $query = "
            SELECT 
                t.transaction_id, 
                t.bill_id, 
                t.amount, 
                t.payment_method, 
                t.payment_status, 
                b.booking_id, 
                u.name AS customer_name,
                u.contact AS customer_contact,
                CONCAT(v.make, ' ', v.model, ' (', v.year, ')') AS vehicle_details,
                s.name AS service_name
            FROM transactions t
            JOIN billing b ON t.bill_id = b.bill_id
            JOIN bookings bk ON b.booking_id = bk.booking_id
            JOIN users u ON bk.user_id = u.user_id
            JOIN user_vehicles v ON bk.vehicle_id = v.vehicle_id
            JOIN services s ON bk.service_id = s.service_id
            WHERE bk.mechanic_id = :mechanic_id AND t.payment_status = 'Pending'
        ";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":mechanic_id", $mechanic_id);
        $stmt->execute();

        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;


    case 'update_payment_status':
        $transaction_id = $data['transaction_id'] ?? null;
        $new_status = $data['payment_status'] ?? null; // Success or Failed
    
        if (!$transaction_id || !$new_status) {
            http_response_code(400);
            echo json_encode(["error" => "Transaction ID and new status are required."]);
            exit;
        }
    
        $query = "UPDATE transactions SET payment_status = :new_status WHERE transaction_id = :transaction_id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":new_status", $new_status);
        $stmt->bindParam(":transaction_id", $transaction_id);
    
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Payment status updated successfully."]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to update payment status."]);
        }
        break;
    
    // Process payment
    case 'make_payment':
        $bill_id = $data['bill_id'] ?? null;
        $payment_method = $data['payment_method'] ?? null;
        $amount = $data['amount'] ?? null;
    
        if (!$bill_id || !$payment_method || !$amount) {
            http_response_code(400);
            echo json_encode(["error" => "Bill ID, payment method, and amount are required."]);
            exit;
        }
    
        $query = "
            INSERT INTO transactions (bill_id, payment_method, payment_status, amount)
            VALUES (:bill_id, :payment_method, 'Pending', :amount)
        ";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":bill_id", $bill_id);
        $stmt->bindParam(":payment_method", $payment_method);
        $stmt->bindParam(":amount", $amount);
    
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Payment recorded as Pending."]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to process payment."]);
        }
        break;

    // Fetch completed payments with detailed information
    case 'fetch_completed_payments':
        $mechanic_id = $data['mechanic_id'] ?? null;

        if (!$mechanic_id) {
            http_response_code(400);
            echo json_encode(["error" => "Mechanic ID is required."]);
            exit;
        }

        $query = "
            SELECT 
                t.transaction_id, 
                t.bill_id, 
                t.amount, 
                t.payment_method, 
                t.payment_status, 
                b.booking_id, 
                u.name AS customer_name,
                u.contact AS customer_contact,
                CONCAT(v.make, ' ', v.model, ' (', v.year, ')') AS vehicle_details,
                s.name AS service_name
            FROM transactions t
            JOIN billing b ON t.bill_id = b.bill_id
            JOIN bookings bk ON b.booking_id = bk.booking_id
            JOIN users u ON bk.user_id = u.user_id
            JOIN user_vehicles v ON bk.vehicle_id = v.vehicle_id
            JOIN services s ON bk.service_id = s.service_id
            WHERE bk.mechanic_id = :mechanic_id AND t.payment_status IN ('Success', 'Failed')
        ";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":mechanic_id", $mechanic_id);
        $stmt->execute();

        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
        
    // Default case
    default:
        http_response_code(400);
        echo json_encode(["error" => "Invalid action."]);
        break;
}
?>
