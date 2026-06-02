<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$file = __DIR__ . "/../data/products.json";

function load() {
  global $file;
  if (!file_exists($file)) return [];
  return json_decode(file_get_contents($file), true);
}

function save($data) {
  global $file;
  file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT));
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === "GET") {
  echo json_encode(load());
  exit;
}


if ($method === "PUT") {

  parse_str($_SERVER['QUERY_STRING'], $q);
  $id = $q['id'] ?? null;

  $input = json_decode(file_get_contents("php://input"), true);

  if (!$id || !$input) {
    http_response_code(400);
    echo json_encode(["error" => "Missing id or data"]);
    exit;
  }

  $data = load();

  foreach ($data as &$p) {
    if ($p["id"] === $id) {

      // merge seguro (no rompe campos existentes)
      $p = array_merge($p, $input);

      // opcional: evitar borrar ID
      $p["id"] = $id;
    }
  }

  save($data);

  echo json_encode([
    "ok" => true,
    "updated_id" => $id
  ]);
  exit;
}


if ($method === "POST") {
  $input = json_decode(file_get_contents("php://input"), true);

  $data = load();
  $input["id"] = uniqid();
  $input["created_at"] = date("c");

  $data[] = $input;
  save($data);

  echo json_encode($input);
  exit;
}

if ($method === "DELETE") {
$id = $_GET['id'] ?? null;
  $id = $q['id'];

  $data = array_values(array_filter(load(), fn($p) => $p["id"] !== $id));
  save($data);

  echo json_encode(["ok" => true]);
}
