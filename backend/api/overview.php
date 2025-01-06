<?php
// Include database connection file
include_once("../config/database.php");

// Instantiate the database connection
$db = new Database();
$conn = $db->getConnection();

// Initialize response array
$response = [
    "users" => 0,
    "states" => 0,
    "cities" => 0,
    "roles" => 0,
    "bookings" => 0,
];

try {
    // Fetch total users
    $stmt = $conn->query("SELECT COUNT(*) as count FROM users");
    $response["users"] = $stmt->fetch(PDO::FETCH_ASSOC)["count"];

    // Fetch total states
    $stmt = $conn->query("SELECT COUNT(*) as count FROM states");
    $response["states"] = $stmt->fetch(PDO::FETCH_ASSOC)["count"];

    // Fetch total cities
    $stmt = $conn->query("SELECT COUNT(*) as count FROM cities");
    $response["cities"] = $stmt->fetch(PDO::FETCH_ASSOC)["count"];

    // Fetch total roles
    $stmt = $conn->query("SELECT COUNT(*) as count FROM roles");
    $response["roles"] = $stmt->fetch(PDO::FETCH_ASSOC)["count"];

    // Fetch total bookings
    $stmt = $conn->query("SELECT COUNT(*) as count FROM bookings");
    $response["bookings"] = $stmt->fetch(PDO::FETCH_ASSOC)["count"];

    // Return response as JSON
    echo json_encode($response);

} catch (PDOException $e) {
    // Handle any errors
    echo json_encode(["error" => $e->getMessage()]);
    exit;
}
?>
