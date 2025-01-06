<?php
header("Content-Type: application/json");
require_once "../config/database.php"; // Ensure this path is correct based on your setup

$db = new Database();
$connection = $db->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($_GET['action'] === 'fetch') {
        // Fetch all parts
        $query = "SELECT * FROM parts";
        $stmt = $connection->prepare($query);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($result);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    if ($_GET['action'] === 'add') {
        // Add a new part
        $query = "INSERT INTO parts (name, cost, stock, description) VALUES (:name, :cost, :stock, :description)";
        $stmt = $connection->prepare($query);
        $stmt->bindParam(":name", $data['name']);
        $stmt->bindParam(":cost", $data['cost']);
        $stmt->bindParam(":stock", $data['stock']);
        $stmt->bindParam(":description", $data['description']);

        if ($stmt->execute()) {
            $data['part_id'] = $connection->lastInsertId(); // Get the inserted part ID
            echo json_encode($data);
        } else {
            echo json_encode(["error" => "Failed to add part"]);
        }
    } elseif ($_GET['action'] === 'update') {
        // Update an existing part
        $query = "UPDATE parts SET name = :name, cost = :cost, stock = :stock, description = :description WHERE part_id = :part_id";
        $stmt = $connection->prepare($query);
        $stmt->bindParam(":name", $data['name']);
        $stmt->bindParam(":cost", $data['cost']);
        $stmt->bindParam(":stock", $data['stock']);
        $stmt->bindParam(":description", $data['description']);
        $stmt->bindParam(":part_id", $data['part_id']);

        if ($stmt->execute()) {
            echo json_encode(["success" => "Part updated successfully"]);
        } else {
            echo json_encode(["error" => "Failed to update part"]);
        }
    } elseif ($_GET['action'] === 'delete') {
        // Delete a part
        $query = "DELETE FROM parts WHERE part_id = :part_id";
        $stmt = $connection->prepare($query);
        $stmt->bindParam(":part_id", $data['id']);

        if ($stmt->execute()) {
            echo json_encode(["success" => "Part deleted successfully"]);
        } else {
            echo json_encode(["error" => "Failed to delete part"]);
        }
    }
} else {
    echo json_encode(["error" => "Invalid request method"]);
}
