<?php

header('Content-Type: application/json');

$uploadDir = __DIR__ . '/../uploads/products/';

if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if (!isset($_FILES['image'])) {
    echo json_encode([
        'success' => false,
        'error' => 'No se recibió imagen'
    ]);
    exit;
}

$ext = strtolower(
    pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION)
);

$fileName = uniqid('img_') . '.' . $ext;

$target = $uploadDir . $fileName;

if (
    move_uploaded_file(
        $_FILES['image']['tmp_name'],
        $target
    )
) {
    echo json_encode([
        'success' => true,
        'url' => '/uploads/products/' . $fileName
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'No se pudo guardar'
    ]);
}