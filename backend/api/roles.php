<?php
include '../config/database.php';

$db = new Database();
$conn = $db->getConnection();

$action = $_GET['action'] ?? '';

if ($action === 'fetch') {
    $query = "SELECT * FROM roles";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($result);
} elseif ($action === 'add') {
    $data = json_decode(file_get_contents("php://input"), true);
    $query = "INSERT INTO roles (role_name) VALUES (:role_name)";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':role_name', $data['role_name']);
    $stmt->execute();
    $lastId = $conn->lastInsertId();
    echo json_encode(['role_id' => $lastId, 'role_name' => $data['role_name']]);
} elseif ($action === 'update') {
    $data = json_decode(file_get_contents("php://input"), true);
    $query = "UPDATE roles SET role_name = :role_name WHERE role_id = :role_id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':role_name', $data['role_name']);
    $stmt->bindParam(':role_id', $data['role_id']);
    $stmt->execute();
    echo json_encode(['message' => 'Role updated']);
} elseif ($action === 'delete') {
    $data = json_decode(file_get_contents("php://input"), true);
    $query = "DELETE FROM roles WHERE role_id = :role_id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':role_id', $data['id']);
    $stmt->execute();
    echo json_encode(['message' => 'Role deleted']);
}
