<?php
header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input["file_url"])) {
    echo json_encode(["error" => "missing file_url"]);
    exit;
}

$file_url = $input["file_url"];

/*
  ACÁ PODÉS:
  - OCR (tesseract)
  - o mock temporal
*/

echo json_encode([
    "output" => [
        "sphere_right" => "-1.00",
        "sphere_left" => "-1.25",
        "cylinder_right" => "-0.50",
        "axis_right" => "180"
    ]
]);