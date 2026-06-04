<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "No data received"
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| CONFIG
|--------------------------------------------------------------------------
*/

$token = 'APP_USR-209050649533627-060308-c2fd2b01c315d7216cc602cbb1a7006c-54942150'; // TU ACCESS TOKEN

$baseUrl = 'https://raspberrypi-5.tail03b1df.ts.net';

/*
|--------------------------------------------------------------------------
| DATA
|--------------------------------------------------------------------------
*/

$cart = $data['cart'] ?? [];
$customer = $data['customer'] ?? [];
$prescription = $data['prescription'] ?? [];

if (empty($cart)) {
    echo json_encode([
        "success" => false,
        "error" => "Cart empty"
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| ITEMS
|--------------------------------------------------------------------------
*/

$items = [];

foreach ($cart as $item) {

    $items[] = [
        "id" => $item["id"] ?? "",
        "title" => $item["name"] ?? "Producto",
        "quantity" => 1,
        "currency_id" => "ARS",
        "unit_price" => (float)($item["price"] ?? 0)
    ];
}

/*
|--------------------------------------------------------------------------
| PREFERENCE BODY
|--------------------------------------------------------------------------
*/

$body = [

    "items" => $items,

    "payer" => [
        "name" => $customer["name"] ?? "",
        "email" => $customer["email"] ?? ""
    ],

    "back_urls" => [
        "success" => $baseUrl . "/checkout?status=success",
        "failure" => $baseUrl . "/checkout?status=failure",
        "pending" => $baseUrl . "/checkout?status=pending"
    ],

    "auto_return" => "approved",

    "metadata" => [

        "customer_name" =>
            $customer["name"] ?? "",

        "customer_email" =>
            $customer["email"] ?? "",

        "customer_phone" =>
            $customer["phone"] ?? "",

        "shipping_address" =>
            $customer["address"] ?? "",

        "prescription_url" =>
            $prescription["file_url"] ?? "",

        "cart" =>
            json_encode($cart)
    ]
];

/*
|--------------------------------------------------------------------------
| MERCADO PAGO
|--------------------------------------------------------------------------
*/

$ch = curl_init(
    "https://api.mercadopago.com/checkout/preferences"
);

curl_setopt_array($ch, [

    CURLOPT_RETURNTRANSFER => true,

    CURLOPT_POST => true,

    CURLOPT_HTTPHEADER => [
        "Authorization: Bearer $token",
        "Content-Type: application/json"
    ],

    CURLOPT_POSTFIELDS => json_encode($body)
]);

$response = curl_exec($ch);

if ($response === false) {

    echo json_encode([
        "success" => false,
        "curl_error" => curl_error($ch)
    ]);

    curl_close($ch);
    exit;
}

$httpCode = curl_getinfo(
    $ch,
    CURLINFO_HTTP_CODE
);

curl_close($ch);

$mp = json_decode($response, true);

/*
|--------------------------------------------------------------------------
| DEBUG
|--------------------------------------------------------------------------
*/

if ($httpCode >= 400) {

    echo json_encode([
        "success" => false,
        "http_code" => $httpCode,
        "response" => $mp
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| SUCCESS
|--------------------------------------------------------------------------
*/

echo json_encode([

    "success" => true,

    "http_code" => $httpCode,

    "init_point" =>
        $mp["init_point"] ?? null,

    "sandbox_init_point" =>
        $mp["sandbox_init_point"] ?? null,

    "preference_id" =>
        $mp["id"] ?? null
]);