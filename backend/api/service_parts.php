<?php
require_once '../config/database.php';

$db = new Database();
$conn = $db->getConnection();

$action = $_GET['action'] ?? '';

if ($action === 'fetch') {
    fetchServiceParts($conn);
} elseif ($action === 'add') {
    addServicePart($conn);
} elseif ($action === 'delete') {
    deleteServicePart($conn);
}

function fetchServiceParts($conn) {
    $query = "SELECT sp.id, s.name AS service_name, p.name AS part_name
              FROM service_parts sp
              JOIN services s ON sp.service_id = s.service_id
              JOIN parts p ON sp.part_id = p.part_id";
    $stmt = $conn->query($query);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function addServicePart($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    $service_id = $data['service_id'];
    $part_id = $data['part_id'];

    $query = "INSERT INTO service_parts (service_id, part_id) VALUES (:service_id, :part_id)";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':service_id', $service_id);
    $stmt->bindParam(':part_id', $part_id);
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false]);
    }
}

function deleteServicePart($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'];

    $query = "DELETE FROM service_parts WHERE id = :id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':id', $id);
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false]);
    }
}
?>
