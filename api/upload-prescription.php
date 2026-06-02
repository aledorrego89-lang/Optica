<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$targetDir = __DIR__ . "/../uploads/prescriptions/";

if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

if (!isset($_FILES["file"])) {
    echo json_encode([
        "success" => false,
        "error" => "No se recibió archivo"
    ]);
    exit;
}

$file = $_FILES["file"];

$ext = strtolower(
    pathinfo(
        $file["name"],
        PATHINFO_EXTENSION
    )
);

$name = uniqid("prescription_") . "." . $ext;

$path = $targetDir . $name;

if (move_uploaded_file($file["tmp_name"], $path)) {

    echo json_encode([
        "success" => true,
        "file_url" => "/uploads/prescriptions/" . $name
    ]);

} else {

    echo json_encode([
        "success" => false,
        "error" => "upload failed"
    ]);
}