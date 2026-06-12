<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$uploadDir = __DIR__ . "/../uploads/transferencias/";

if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if (!isset($_FILES["file"])) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "No se recibió archivo"
    ]);
    exit;
}

$file = $_FILES["file"];

// Validación básica
if ($file["error"] !== 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "Error en upload"
    ]);
    exit;
}

// extensión
$ext = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));

// nombre único
$name = uniqid("transfer_") . "." . $ext;

$path = $uploadDir . $name;

if (move_uploaded_file($file["tmp_name"], $path)) {

    echo json_encode([
        "success" => true,
        "file_url" => "/uploads/transferencias/" . $name
    ]);

} else {

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => "No se pudo mover el archivo"
    ]);
}