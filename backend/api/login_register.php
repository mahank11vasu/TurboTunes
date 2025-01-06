<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../config/database.php';
require '../vendor/autoload.php'; // Assuming PHPMailer is installed via Composer

// Set the default time zone
date_default_timezone_set('Asia/Kolkata');

$db = new Database();
$conn = $db->getConnection();

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'login':
        // Login user
        $data = json_decode(file_get_contents("php://input"), true);
        $email = $data['email'];
        $password = $data['password'];
    
        $query = "SELECT users.*, roles.role_name FROM users 
                  JOIN user_roles ON users.user_id = user_roles.user_id 
                  JOIN roles ON user_roles.role_id = roles.role_id 
                  WHERE users.email = :email";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
    
        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if (password_verify($password, $user['password'])) {
                // Set session variables
                $_SESSION['user_id'] = $user['user_id'];
                $_SESSION['role'] = $user['role_name'];

                echo json_encode([
                    'user_id' => $user['user_id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => $user['role_name'],
                    'redirect' => $user['role_name'] === 'Admin' ? '/admin' : ($user['role_name'] === 'Mechanic' ? '/mechanic' : '/customer'),
                ]);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid email or password.']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid email or password.']);
        }
        break;
    
    
    case 'register':
        // Register a new user
        $data = json_decode(file_get_contents("php://input"), true);
        $name = $data['name'];
        $email = $data['email'];
        $password = password_hash($data['password'], PASSWORD_BCRYPT);
        $contact = $data['contact'];
        $dob = $data['dob'];
        $profile_picture = $data['profile_picture'] ?? null; // Optional
        $gender = $data['gender'];
        $state_id = $data['state_id'];
        $city_id = $data['city_id'];
        $role_id = $data['role_id'];
        $street_address = $data['street_address']; // Add street address

        // Check if email already exists
        $query = "SELECT * FROM users WHERE email = :email";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        if ($stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Email already exists.']);
            exit;
        }

        // Insert user data into `users` table
        $query = "INSERT INTO users (name, email, password, contact, dob, profile_picture, gender) 
                  VALUES (:name, :email, :password, :contact, :dob, :profile_picture, :gender)";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $password);
        $stmt->bindParam(':contact', $contact);
        $stmt->bindParam(':dob', $dob);
        $stmt->bindParam(':profile_picture', $profile_picture);
        $stmt->bindParam(':gender', $gender);

        if ($stmt->execute()) {
            $user_id = $conn->lastInsertId();

            // Assign role to user in `user_roles` table
            $query = "INSERT INTO user_roles (user_id, role_id) VALUES (:user_id, :role_id)";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':user_id', $user_id);
            $stmt->bindParam(':role_id', $role_id);
            $stmt->execute();

            // Insert address into `addresses` table
            if (!empty($street_address) && !empty($city_id)) {
                $query = "INSERT INTO addresses (user_id, street_address, city_id) 
                          VALUES (:user_id, :street_address, :city_id)";
                $stmt = $conn->prepare($query);
                $stmt->bindParam(':user_id', $user_id);
                $stmt->bindParam(':street_address', $street_address);
                $stmt->bindParam(':city_id', $city_id);
                $stmt->execute();
            }

            // Generate OTP and store in `otp_codes` table
            $otp = rand(100000, 999999);
            $created_at = date('Y-m-d H:i:s');
            $expires_at = date('Y-m-d H:i:s', strtotime('+10 minutes'));

            $query = "INSERT INTO otp_codes (user_id, code, created_at, expires_at) VALUES (:user_id, :code, :created_at, :expires_at)";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':user_id', $user_id);
            $stmt->bindParam(':code', $otp);
            $stmt->bindParam(':created_at', $created_at);
            $stmt->bindParam(':expires_at', $expires_at);
            $stmt->execute();

            // Send OTP to user via email
            $mail = new PHPMailer(true);
            try {
                $mail->isSMTP();
                $mail->Host = 'smtp.gmail.com';
                $mail->SMTPAuth = true;
                $mail->Username = 'bakbakbaka02@gmail.com';
                $mail->Password = 'fnwnteubcgfijvgy';
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port = 587;

                // Recipients
                $mail->setFrom('bakbakbaka02@gmail.com', 'TurboTunes');
                $mail->addAddress($email);

                // Content
                $mail->isHTML(true);
                $mail->Subject = 'Your OTP for Registration';
                $mail->Body = "Your OTP for TurboTunes registration is <b>$otp</b>. This OTP will expire in 10 minutes.";

                $mail->send();
                echo json_encode(['user_id' => $user_id]);
            } catch (Exception $e) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to send OTP: ' . $mail->ErrorInfo]);
            }
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to register user.']);
        }
        break;

    case 'verify':
        // Verify OTP
        $data = json_decode(file_get_contents("php://input"), true);
        $user_id = $data['user_id'];
        $otp = $data['otp'];

        $query = "SELECT * FROM otp_codes WHERE user_id = :user_id AND code = :otp";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':otp', $otp);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $otpRecord = $stmt->fetch(PDO::FETCH_ASSOC);
            $current_time = date('Y-m-d H:i:s');

            // Check if current time is between created_at and expires_at
            if ($current_time >= $otpRecord['created_at'] && $current_time <= $otpRecord['expires_at']) {
                $deleteQuery = "DELETE FROM otp_codes WHERE user_id = :user_id";
                $deleteStmt = $conn->prepare($deleteQuery);
                $deleteStmt->bindParam(':user_id', $user_id);
                $deleteStmt->execute();

                $updateQuery = "UPDATE users SET is_verified = 1 WHERE user_id = :user_id";
                $updateStmt = $conn->prepare($updateQuery);
                $updateStmt->bindParam(':user_id', $user_id);
                $updateStmt->execute();

                echo json_encode(['success' => true, 'message' => 'OTP verified successfully.']);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'OTP has expired.']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid OTP.']);
        }
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action.']);
}
?>
