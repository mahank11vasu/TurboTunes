<?php
include '../config/database.php';

$db = new Database();
$conn = $db->getConnection();

$action = $_GET['action'] ?? '';

if ($action === 'fetch') {
    $query = "SELECT * FROM vehicle_categories";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($result);
} elseif ($action === 'add') {
    $data = json_decode(file_get_contents("php://input"), true);
    $query = "INSERT INTO vehicle_categories (name, description) VALUES (:name, :description)";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':name', $data['name']);
    $stmt->bindParam(':description', $data['description']);
    $stmt->execute();
    $lastId = $conn->lastInsertId();
    echo json_encode(['category_id' => $lastId, 'name' => $data['name'], 'description' => $data['description']]);
} elseif ($action === 'update') {
    $data = json_decode(file_get_contents("php://input"), true);
    $query = "UPDATE vehicle_categories SET name = :name, description = :description WHERE category_id = :category_id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':name', $data['name']);
    $stmt->bindParam(':description', $data['description']);
    $stmt->bindParam(':category_id', $data['category_id']);
    $stmt->execute();
    echo json_encode(['message' => 'Category updated']);
} elseif ($action === 'delete') {
    $data = json_decode(file_get_contents("php://input"), true);
    $query = "DELETE FROM vehicle_categories WHERE category_id = :category_id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':category_id', $data['id']);
    $stmt->execute();
    echo json_encode(['message' => 'Category deleted']);
}
