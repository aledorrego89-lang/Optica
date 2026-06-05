<?php

header('Content-Type: application/json');

$data = json_decode(
    file_get_contents('php://input'),
    true
);

$paymentId = $data['payment_id'] ?? null;

if (!$paymentId) {
    http_response_code(400);

    echo json_encode([
        'success' => false,
        'error' => 'payment_id faltante'
    ]);

    exit;
}

// $accessToken = 'APP_USR-209050649533627-060308-c2fd2b01c315d7216cc602cbb1a7006c-54942150';
$accessToken = 'APP_USR-5984370179459066-060308-8b27586fbb41283f99ef9062fcb08fd7-1484050043';
/* =========================
   CONSULTAR PAGO
========================= */

$ch = curl_init(
    "https://api.mercadopago.com/v1/payments/$paymentId"
);

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Authorization: Bearer $accessToken"
    ]
]);

$response = curl_exec($ch);

if (!$response) {

    echo json_encode([
        'success' => false,
        'error' => curl_error($ch)
    ]);

    exit;
}

$payment = json_decode($response, true);

/* =========================
   VALIDAR
========================= */

if (
    !isset($payment['status']) ||
    $payment['status'] !== 'approved'
) {

    echo json_encode([
        'success' => false,
        'status' => $payment['status'] ?? 'unknown'
    ]);

    exit;
}

/* =========================
   METADATA
========================= */

$metadata = $payment['metadata'] ?? [];

$customer = [
    'name' => $metadata['customer_name'] ?? '',
    'email' => $metadata['customer_email'] ?? '',
    'phone' => $metadata['customer_phone'] ?? '',
    'address' => $metadata['shipping_address'] ?? '',
];

$cart = json_decode(
    $metadata['cart'] ?? '[]',
    true
);

$prescriptionUrl =
    $metadata['prescription_url'] ?? '';

$total =
    $payment['transaction_amount'] ?? 0;

/* =========================
   CARGAR ORDERS.JSON
========================= */

$file = dirname(__DIR__) . '/data/orders.json';

$orders = [];

if (file_exists($file)) {

    $orders =
        json_decode(
            file_get_contents($file),
            true
        ) ?: [];
}

/* =========================
   EVITAR DUPLICADOS
========================= */

foreach ($orders as $order) {

    if (
        isset($order['payment_id']) &&
        $order['payment_id'] == $paymentId
    ) {

        echo json_encode([
            'success' => true,
            'already_exists' => true
        ]);

        exit;
    }
}

/* =========================
   CREAR ORDEN
========================= */

$newOrder = [
    'id' => uniqid(),

    'payment_id' => $paymentId,

    'payment_status' => $payment['status'], // <-- agregar

    'customer' => $customer,

    'cart' => $cart,

    'total' => $total,

    'prescriptionUrl' => $prescriptionUrl,

    'status' => 'Pendiente',

    'created_at' => date('c')
];

$orders[] = $newOrder;

file_put_contents(
    $file,
    json_encode(
        $orders,
        JSON_PRETTY_PRINT |
        JSON_UNESCAPED_UNICODE
    )
);

/* =========================
   EMAIL
========================= */

$emailData = [
    'customer' => $customer,
    'cart' => $cart,
    'total' => $total,
    'prescriptionUrl' => $prescriptionUrl
];

$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' =>
            "Content-Type: application/json\r\n",
        'content' =>
            json_encode($emailData)
    ]
]);

@file_get_contents(
    'https://raspberrypi-5.tail03b1df.ts.net/api/send-email.php',
    false,
    $context
);

echo json_encode([
    'success' => true,
    'order_id' => $newOrder['id']
]);
?>
