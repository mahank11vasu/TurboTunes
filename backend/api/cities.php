<?php
include_once '../config/database.php';

$db = new Database();
$conn = $db->getConnection();

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'fetch':
        // Fetch all cities with their associated state names
        $query = "SELECT cities.city_id, cities.name AS city_name, states.name AS state_name, cities.state_id
                  FROM cities
                  INNER JOIN states ON cities.state_id = states.state_id";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $cities = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($cities);
        break;
    
    case 'fetchByState':
        // Fetch cities filtered by state_id (for LoginRegister)
        $state_id = $_GET['state_id'] ?? null;
    
        if ($state_id) {
            $query = "SELECT cities.city_id, cities.name AS city_name, states.name AS state_name, cities.state_id
                      FROM cities
                      INNER JOIN states ON cities.state_id = states.state_id
                      WHERE cities.state_id = :state_id";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':state_id', $state_id, PDO::PARAM_INT);
            $stmt->execute();
            $cities = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($cities);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'state_id parameter is required']);
        }
        break;

    case 'add':
        // Add a new city
        $data = json_decode(file_get_contents("php://input"), true);
        $name = $data['name'];
        $state_id = $data['state_id'];

        $query = "INSERT INTO cities (name, state_id) VALUES (:name, :state_id)";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':state_id', $state_id);
        if ($stmt->execute()) {
            echo json_encode(['city_id' => $conn->lastInsertId(), 'name' => $name, 'state_id' => $state_id]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to add city']);
        }
        break;

    case 'update':
        // Update city name or state
        $data = json_decode(file_get_contents("php://input"), true);
        $city_id = $data['id'];
        $name = $data['name'];
        $state_id = $data['state_id'];

        $query = "UPDATE cities SET name = :name, state_id = :state_id WHERE city_id = :city_id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':state_id', $state_id);
        $stmt->bindParam(':city_id', $city_id);
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update city']);
        }
        break;

    case 'delete':
        // Delete a city
        $data = json_decode(file_get_contents("php://input"), true);
        $city_id = $data['id'];

        $query = "DELETE FROM cities WHERE city_id = :city_id";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':city_id', $city_id);
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete city']);
        }
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
}
?>
