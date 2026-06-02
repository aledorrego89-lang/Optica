<?php
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$to = "aledorrego89@gmail.com";
$subject = "Nuevo pedido óptica";

$message = "Cliente: " . ($data["customer"]["name"] ?? "N/A");

mail($to, $subject, $message);

echo json_encode(["ok" => true]);
