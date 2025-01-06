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



    // Add a new review
    case 'add_review':
        $user_id = $data['user_id'] ?? null;
        $booking_id = $data['booking_id'] ?? null;
        $rating = $data['rating'] ?? null;
        $review = $data['review'] ?? null;

        // Validation
        if (!$user_id || !$booking_id || !$rating || !$review) {
            http_response_code(400);
            echo json_encode(["error" => "All fields are required."]);
            exit;
        }

        if ($rating < 1 || $rating > 5) {
            http_response_code(400);
            echo json_encode(["error" => "Rating must be between 1 and 5."]);
            exit;
        }

        // Fetch mechanic_id using booking_id
        $fetchMechanicQuery = "SELECT mechanic_id FROM bookings WHERE booking_id = :booking_id";
        $stmt = $conn->prepare($fetchMechanicQuery);
        $stmt->bindParam(":booking_id", $booking_id);
        $stmt->execute();
        $mechanic = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$mechanic || !$mechanic['mechanic_id']) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid booking ID or mechanic not found."]);
            exit;
        }

        $mechanic_id = $mechanic['mechanic_id'];

        // Insert the review into the reviews_and_ratings table
        $insertReviewQuery = "
            INSERT INTO reviews_and_ratings (user_id, mechanic_id, booking_id, rating, review)
            VALUES (:user_id, :mechanic_id, :booking_id, :rating, :review)
        ";
        $stmt = $conn->prepare($insertReviewQuery);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":mechanic_id", $mechanic_id);
        $stmt->bindParam(":booking_id", $booking_id);
        $stmt->bindParam(":rating", $rating);
        $stmt->bindParam(":review", $review);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Review added successfully."]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to add review. Please try again."]);
        }
        break;

    // Fetch reviews for a specific mechanic
    case 'fetch_mechanic_reviews':
        $mechanic_id = $data['mechanic_id'] ?? null;
    
        if (!$mechanic_id) {
            http_response_code(400);
            echo json_encode(["error" => "Mechanic ID is required."]);
            exit;
        }
    
        $query = "
            SELECT 
                r.review_id, 
                r.rating, 
                r.review, 
                r.created_at, 
                u.name AS customer_name,
                s.name AS service_name,
                CONCAT(v.make, ' ', v.model, ' (', v.year, ')') AS vehicle_details
            FROM reviews_and_ratings r
            JOIN bookings b ON r.booking_id = b.booking_id
            JOIN services s ON b.service_id = s.service_id
            JOIN user_vehicles v ON b.vehicle_id = v.vehicle_id
            JOIN users u ON r.user_id = u.user_id
            WHERE r.mechanic_id = :mechanic_id
            ORDER BY r.created_at DESC
        ";
    
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":mechanic_id", $mechanic_id);
        $stmt->execute();
    
        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($reviews);
        break;
    

    // Fetch reviews for a specific user
    case 'fetch_user_reviews':
        $user_id = $data['user_id'] ?? null;

        if (!$user_id) {
            http_response_code(400);
            echo json_encode(["error" => "User ID is required."]);
            exit;
        }

        $query = "
            SELECT r.review_id, r.rating, r.review, r.created_at, m.garage_name, s.name AS service_name
            FROM reviews_and_ratings r
            JOIN mechanics m ON r.mechanic_id = m.mechanic_id
            JOIN bookings b ON r.booking_id = b.booking_id
            JOIN services s ON b.service_id = s.service_id
            WHERE r.user_id = :user_id
            ORDER BY r.created_at DESC
        ";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();

        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($reviews);
        break;

    // Default action
    default:
        http_response_code(400);
        echo json_encode(["error" => "Invalid action."]);
        break;
}
?>
