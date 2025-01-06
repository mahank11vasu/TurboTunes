<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle OPTIONS preflight request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include database connection
require_once '../config/database.php';

$db = new Database();
$conn = $db->getConnection();

// Get input data
$data = json_decode(file_get_contents("php://input"), true);

$user_id = $data['user_id'] ?? null;
$name = $data['name'] ?? null;
$contact = $data['contact'] ?? null;
$dob = $data['dob'] ?? null;
$gender = $data['gender'] ?? 'Other';
$street_address = $data['street_address'] ?? null;
$city_id = $data['city_id'] ?? null;
$garage_name = $data['garage_name'] ?? null;
$specialization_tags = $data['specialization_tags'] ?? null;
$category = $data['category'] ?? null; // Add category field

if (!$user_id || !$name || !$contact) {
    http_response_code(400);
    echo json_encode(["error" => "Required fields are missing."]);
    exit;
}

try {
    // Start transaction
    $conn->beginTransaction();

    // Update `users` table
    $query = "
        UPDATE users 
        SET name = COALESCE(:name, name), 
            contact = COALESCE(:contact, contact), 
            dob = COALESCE(:dob, dob), 
            gender = COALESCE(:gender, gender) 
        WHERE user_id = :user_id
    ";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":name", $name);
    $stmt->bindParam(":contact", $contact);
    $stmt->bindParam(":dob", $dob);
    $stmt->bindParam(":gender", $gender);
    $stmt->bindParam(":user_id", $user_id);
    $stmt->execute();

    // Update `addresses` table for Customers
    if ($street_address || $city_id) {
        $query = "
            UPDATE addresses 
            SET street_address = COALESCE(:street_address, street_address), 
                city_id = COALESCE(:city_id, city_id)
            WHERE user_id = :user_id
        ";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":street_address", $street_address);
        $stmt->bindParam(":city_id", $city_id);
        $stmt->execute();
    }

    // Update or Insert into `mechanics` table
    if ($garage_name || $specialization_tags || $category) {
        // Check if a record already exists
        $checkQuery = "SELECT mechanic_id FROM mechanics WHERE user_id = :user_id LIMIT 1";
        $checkStmt = $conn->prepare($checkQuery);
        $checkStmt->bindParam(":user_id", $user_id);
        $checkStmt->execute();
        $existingMechanic = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if ($existingMechanic) {
            // Update mechanic data
            $query = "
                UPDATE mechanics 
                SET garage_name = COALESCE(:garage_name, garage_name), 
                    specialization_tags = COALESCE(:specialization_tags, specialization_tags), 
                    category = COALESCE(:category, category)
                WHERE user_id = :user_id
            ";
        } else {
            // Insert new mechanic data
            $query = "
                INSERT INTO mechanics (user_id, garage_name, specialization_tags, category) 
                VALUES (:user_id, :garage_name, :specialization_tags, :category)
            ";
        }

        $stmt = $conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":garage_name", $garage_name);
        $stmt->bindParam(":specialization_tags", $specialization_tags);
        $stmt->bindParam(":category", $category);
        $stmt->execute();
    }

    // Commit transaction
    $conn->commit();
    echo json_encode(["success" => true, "message" => "Profile updated successfully."]);
} catch (Exception $e) {
    $conn->rollBack();
    http_response_code(500);
    echo json_encode(["error" => "Failed to update profile.", "details" => $e->getMessage()]);
}
?>
