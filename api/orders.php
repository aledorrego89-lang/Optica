<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

$file = dirname(__DIR__) . "/data/orders.json";

function load() {
  global $file;
  if (!file_exists($file)) return [];
  return json_decode(file_get_contents($file), true) ?: [];
}

function save($data) {
  global $file;

  $result = file_put_contents(
    $file,
    json_encode($data, JSON_PRETTY_PRINT)
  );

  if ($result === false) {
    http_response_code(500);
    echo json_encode([
      "success" => false,
      "error" => "No se pudo escribir orders.json"
    ]);
    exit;
  }
}

$method = $_SERVER['REQUEST_METHOD'];


// =======================
// GET
// =======================
if ($method === "GET") {
  echo json_encode(load());
  exit;
}


// =======================
// POST (crear orden)
// =======================
if ($method === "POST") {
  $input = json_decode(file_get_contents("php://input"), true);

  $productsFile = dirname(__DIR__) . "/data/products.json";
  $products = file_exists($productsFile)
    ? json_decode(file_get_contents($productsFile), true)
    : [];

  $productsMap = [];
  foreach ($products as $p) {
    $productsMap[$p["id"]] = $p;
  }

  // 🔥 ENRIQUECER ITEMS
  if (isset($input["cart"])) {
    $input["items"] = array_map(function ($item) use ($productsMap) {
      $product = $productsMap[$item["id"]] ?? null;

      return [
        "id" => $item["id"],
        "name" => $product["name"] ?? "Sin nombre",
        "image" => $product["images"][0] ?? null,
        "price" => $product["price"] ?? $item["price"],
        "qty" => $item["qty"] ?? 1
      ];
    }, $input["cart"]);
  }

  $data = load();

  $input["id"] = uniqid();
  $input["status"] = "Pendiente";
  $input["created_at"] = date("c");

  $data[] = $input;
  save($data);

  echo json_encode([
    "success" => true,
    "order" => $input
  ]);
  exit;
}


// =======================
// PUT (actualizar status)
// =======================
if ($method === "PUT") {
  $input = json_decode(file_get_contents("php://input"), true);

  $data = load();

  foreach ($data as &$order) {
    if ($order["id"] === $input["id"]) {
      if (isset($input["status"])) {
        $order["status"] = $input["status"];
      }
    }
  }

  save($data);

  echo json_encode(["success" => true]);
  exit;
}


// =======================
// DELETE (eliminar)
// =======================
if ($method === "DELETE") {
  $input = json_decode(file_get_contents("php://input"), true);

  $data = load();

  $data = array_filter($data, function ($order) use ($input) {
    return $order["id"] !== $input["id"];
  });

  save(array_values($data));

  echo json_encode(["success" => true]);
  exit;
}