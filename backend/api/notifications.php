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

$data = json_decode(file_get_contents("php://input"), true);
$action = $data['action'] ?? null;

switch ($action) {
    // Fetch notifications for a user
    case 'fetch_notifications':
        $user_id = $data['user_id'] ?? null;

        if (!$user_id) {
            http_response_code(400);
            echo json_encode(["error" => "User ID is required."]);
            exit;
        }

        $query = "SELECT * FROM notifications WHERE user_id = :user_id ORDER BY created_at DESC";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();

        $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($notifications);
        break;

    // Mark notification as seen
    case 'mark_as_seen':
        $notification_id = $data['notification_id'] ?? null;

        if (!$notification_id) {
            http_response_code(400);
            echo json_encode(["error" => "Notification ID is required."]);
            exit;
        }

        $query = "UPDATE notifications SET status = 'Seen' WHERE notification_id = :notification_id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":notification_id", $notification_id);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Notification marked as seen."]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to mark notification as seen."]);
        }
        break;

    // Delete a notification
    case 'delete_notification':
        $notification_id = $data['notification_id'] ?? null;

        if (!$notification_id) {
            http_response_code(400);
            echo json_encode(["error" => "Notification ID is required."]);
            exit;
        }

        $query = "DELETE FROM notifications WHERE notification_id = :notification_id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":notification_id", $notification_id);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Notification deleted."]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to delete notification."]);
        }
        break;


    // Fetch mechanic ID using user ID
    case 'get_mechanic_id':
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

        if ($stmt->rowCount() > 0) {
            echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Mechanic ID not found for the user."]);
        }
        break;

    // Fetch notifications sent by the mechanic, including customer details
    case 'fetch_sent_notifications':
        $mechanic_id = $data['mechanic_id'] ?? null;

        if (!$mechanic_id) {
            http_response_code(400);
            echo json_encode(["error" => "Mechanic ID is required."]);
            exit;
        }

        $query = "
            SELECT n.notification_id, n.message, n.status, u.name AS customer_name
            FROM notifications n
            JOIN users u ON n.user_id = u.user_id
            WHERE n.mechanic_id = :mechanic_id
            ORDER BY n.created_at DESC
        ";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":mechanic_id", $mechanic_id);
        $stmt->execute();

        $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($notifications);
        break;

    // Check if notifications are seen by customers
    case 'fetch_seen_status':
        $mechanic_id = $data['mechanic_id'] ?? null;

        if (!$mechanic_id) {
            http_response_code(400);
            echo json_encode(["error" => "Mechanic ID is required."]);
            exit;
        }

        $query = "
            SELECT n.notification_id, n.message, n.status, u.name AS customer_name
            FROM notifications n
            JOIN users u ON n.user_id = u.user_id
            WHERE n.mechanic_id = :mechanic_id
            ORDER BY n.created_at DESC
        ";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":mechanic_id", $mechanic_id);
        $stmt->execute();

        $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($notifications);
        break;

    // Default case for invalid action
    default:
        http_response_code(400);
        echo json_encode(["error" => "Invalid action."]);
        break;
}
?>
