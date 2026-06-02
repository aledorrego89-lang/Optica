<?php

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['path'])) {
  echo json_encode(["success" => false]);
  exit;
}

$file = __DIR__ . '/../' . $data['path'];

if (file_exists($file)) {
  unlink($file);
  echo json_encode(["success" => true]);
} else {
  echo json_encode(["success" => false, "msg" => "File not found"]);
}