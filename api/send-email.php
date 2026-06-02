<?php

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$baseUrl = 'https://raspberrypi-5.tail03b1df.ts.net';
if (!$data) {
    http_response_code(400);

    echo json_encode([
        "success" => false,
        "error" => "No data"
    ]);

    exit;
}

$customer = $data['customer'] ?? [];
$cart = $data['cart'] ?? [];
$total = $data['total'] ?? 0;
$prescriptionUrl = $data['prescriptionUrl'] ?? '';

if (!empty($prescriptionUrl) && !str_starts_with($prescriptionUrl, 'http')) {
    $prescriptionUrl = $baseUrl . $prescriptionUrl;
}

$opticoEmail = 'aledorrego89@gmail.com';
$customerEmail = $customer['email'] ?? '';

/* =========================
   CUSTOMER HTML
========================= */

$customerHtml = "
<html>
<body style='font-family:Arial;padding:20px;background:#f5f5f5;'>

<div style='max-width:700px;margin:auto;background:white;border-radius:12px;padding:30px;'>

<h1 style='margin-top:0;'>
Pedido confirmado
</h1>

<p>
Hola <strong>{$customer['name']}</strong>,
tu pedido fue recibido exitosamente.
</p>

<h2>Datos del pedido</h2>

<p>
<strong>Email:</strong> {$customer['email']}<br>
<strong>Teléfono:</strong> {$customer['phone']}<br>
<strong>Dirección:</strong> {$customer['address']}
</p>

<h2>Productos</h2>
";

/* =========================
   PRODUCTS
========================= */

foreach ($cart as $item) {

$img = $item['overlay_url'] ?? '';

if (!empty($img) && !str_starts_with($img, 'http')) {
    $img = $baseUrl . $img;
}

    $customerHtml .= "
    <div style='border:1px solid #ddd;border-radius:10px;padding:15px;margin-bottom:15px;'>

        <div style='display:flex;gap:20px;align-items:center;'>

            <img
                src='{$img}'
                style='width:180px;height:120px;object-fit:contain;background:#fafafa;border-radius:8px;'
            >

            <div>
                <h3 style='margin:0;'>{$item['name']}</h3>

                <p style='margin:8px 0;color:#666;'>
                    {$item['brand']}
                </p>

                <strong>
                    $" . number_format($item['price'], 0, ',', '.') . "
                </strong>
            </div>

        </div>

    </div>
    ";
}

$customerHtml .= "

<h2>Total</h2>

<p style='font-size:24px;font-weight:bold;'>
$" . number_format($total, 0, ',', '.') . "
</p>

";

if (!empty($prescriptionUrl)) {

    $customerHtml .= "

    <div style='margin-top:30px;'>

        <h2 style='margin-bottom:15px;'>
            Receta médica
        </h2>

        <div style='
            border:1px solid #ddd;
            border-radius:12px;
            padding:20px;
            background:#fafafa;
            text-align:center;
        '>

            <div style='
                font-size:48px;
                margin-bottom:10px;
            '>
                📄
            </div>

            <p style='
                margin:0 0 15px 0;
                color:#555;
                font-size:14px;
            '>
                La receta médica fue cargada correctamente.
            </p>

            <a
                href='{$prescriptionUrl}'
                target='_blank'
                style='
                    display:inline-block;
                    background:#111;
                    color:white;
                    text-decoration:none;
                    padding:12px 20px;
                    border-radius:8px;
                    font-weight:bold;
                '
            >
                Ver receta
            </a>

        </div>

    </div>
    ";
}

$customerHtml .= "

<p style='margin-top:40px;color:#777;font-size:14px;'>
Gracias por elegirnos.
</p>

</div>

</body>
</html>
";

/* =========================
   OPTICO HTML
========================= */

$opticoHtml = str_replace(
    "Gracias por elegirnos.",
    "Receta médica adjunta en el botón superior.",
    $customerHtml
);


if (!empty($prescriptionUrl)) {

    $opticoHtml .= "

    <div style='margin-top:30px;'>

        <h2 style='margin-bottom:15px;'>
            Receta médica
        </h2>

        <div style='border:1px solid #ddd;border-radius:12px;padding:15px;background:#fafafa;'>

            <a href='{$prescriptionUrl}' target='_blank'>

                <img
                    src='{$prescriptionUrl}'
                    alt='Receta'
                    style='
                        width:100%;
                        max-width:320px;
                        display:block;
                        border-radius:10px;
                        border:1px solid #ccc;
                    '
                >

            </a>

            <p style='margin-top:10px;font-size:14px;color:#666;'>

                Click para abrir la receta completa

            </p>

        </div>

    </div>
    ";
}

/* =========================
   HEADERS
========================= */

$headers = [];
$headers[] = "MIME-Version: 1.0";
$headers[] = "Content-type:text/html;charset=UTF-8";
$headers[] = "From: Optica <aledorrego89@gmail.com>";
$headers[] = "Reply-To: {$customerEmail}";

$headersString = implode("\r\n", $headers);

/* =========================
   SEND
========================= */

$ok1 = mail(
    $opticoEmail,
    "Nuevo pedido recibido",
    $opticoHtml,
    $headersString
);

$ok2 = true;

if (!empty($customerEmail)) {

    $ok2 = mail(
        $customerEmail,
        "Confirmación de pedido",
        $customerHtml,
        $headersString
    );
}

echo json_encode([
    "success" => ($ok1 && $ok2),
    "optico" => $ok1,
    "cliente" => $ok2
]);