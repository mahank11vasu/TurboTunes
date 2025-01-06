<?php
include_once "../config/database.php";

$db = new Database();
$conn = $db->getConnection();

$data = [
    "users" => [],
    "bookings" => [],
    "revenue" => [],
    "reviews" => [],
];

// Fetch user registration stats
$query = "SELECT DATE(created_at) as date, COUNT(*) as count FROM users GROUP BY DATE(created_at)";
$stmt = $conn->query($query);
$data["users"] = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Fetch booking stats
$query = "SELECT DATE(booking_date) as date, COUNT(*) as count FROM bookings GROUP BY DATE(booking_date)";
$stmt = $conn->query($query);
$data["bookings"] = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Fetch revenue stats (only for successful payments)
$query = "
    SELECT DATE(t.created_at) as date, SUM(t.amount) as total
    FROM transactions t
    WHERE t.payment_status = 'Success'
    GROUP BY DATE(t.created_at)";
$stmt = $conn->query($query);
$data["revenue"] = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Fetch reviews stats
$query = "
    SELECT DATE(r.created_at) as date, COUNT(*) as count
    FROM reviews_and_ratings r
    GROUP BY DATE(r.created_at)";
$stmt = $conn->query($query);
$data["reviews"] = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Return data as JSON
echo json_encode($data);
