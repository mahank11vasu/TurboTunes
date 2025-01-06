<?php
require_once '../config/database.php';

header("Content-Type: application/json");

$db = new Database();
$conn = $db->getConnection();

$action = $_GET['action'] ?? '';

if ($action === 'fetch') {
    // Fetch all states
    $query = "SELECT * FROM states";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $states = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($states);
} elseif ($action === 'add') {
    // Add a new state
    $data = json_decode(file_get_contents("php://input"), true);
    $name = $data['name'] ?? '';

    if (!empty($name)) {
        $query = "INSERT INTO states (name) VALUES (:name)";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':name', $name);
        $stmt->execute();

        $state_id = $conn->lastInsertId();
        echo json_encode(['state_id' => $state_id, 'name' => $name]);
    } else {
        echo json_encode(['error' => 'State name is required']);
    }
} elseif ($action === 'update') {
    // Update an existing state
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'] ?? null;
    $name = $data['name'] ?? '';

    if ($id && !empty($name)) {
        $query = "UPDATE states SET name = :name WHERE state_id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => 'Invalid data']);
    }
} elseif ($action === 'delete') {
    // Delete a state
    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'] ?? null;

    if ($id) {
        $query = "DELETE FROM states WHERE state_id = :id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => 'State ID is required']);
    }
} else {
    echo json_encode(['error' => 'Invalid action']);
}
?>
