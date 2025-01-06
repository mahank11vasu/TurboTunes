<?php
include_once '../config/database.php';
$db = new Database();
$conn = $db->getConnection();

$action = $_GET['action'];

if ($action == 'fetch') {
    $query = "SELECT * FROM services";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($services);
}

if ($action == 'add') {
    $data = json_decode(file_get_contents("php://input"));
    $query = "INSERT INTO services (name, description, base_cost) VALUES (:name, :description, :base_cost)";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':name', $data->name);
    $stmt->bindParam(':description', $data->description);
    $stmt->bindParam(':base_cost', $data->base_cost);
    $stmt->execute();
    $data->service_id = $conn->lastInsertId();
    echo json_encode($data);
}

if ($action == 'update') {
    $data = json_decode(file_get_contents("php://input"));
    $query = "UPDATE services SET name = :name, description = :description, base_cost = :base_cost WHERE service_id = :id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':name', $data->name);
    $stmt->bindParam(':description', $data->description);
    $stmt->bindParam(':base_cost', $data->base_cost);
    $stmt->bindParam(':id', $data->service_id);
    $stmt->execute();
}

if ($action == 'delete') {
    $data = json_decode(file_get_contents("php://input"));
    $query = "DELETE FROM services WHERE service_id = :id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id', $data->id);
    $stmt->execute();
}
?>
