<?php

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");


// =====================================================
// CONFIGURACIÓN MYSQL
// =====================================================

$dbHost = "localhost";
$dbName = "optica";
$dbUser = "optica_user";
$dbPass = "Optica_DB_2026!";


// =====================================================
// CORS PREFLIGHT
// =====================================================

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}


// =====================================================
// CONEXIÓN MYSQL
// =====================================================

try {

    $pdo = new PDO(
        "mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4",
        $dbUser,
        $dbPass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "error" => "Error de conexión con la base de datos"
    ]);

    exit;
}


// =====================================================
// FUNCIÓN: OBTENER PEDIDOS
// =====================================================

function getOrders($pdo)
{
    $stmt = $pdo->query("
SELECT
    id,
    customer_name,
    customer_email,
    customer_phone,
    status,
    created_at
FROM orders
ORDER BY created_at DESC    ");

    $orders = $stmt->fetchAll();


    foreach ($orders as &$order) {

        $stmtItems = $pdo->prepare("
            SELECT
                product_id AS id,
                name,
                image,
                price,
                qty
            FROM order_items
            WHERE order_id = :order_id
            ORDER BY id ASC
        ");

        $stmtItems->execute([
            ":order_id" => $order["id"]
        ]);

        $items = $stmtItems->fetchAll();


        foreach ($items as &$item) {

            $item["price"] = (float) $item["price"];
            $item["qty"] = (int) $item["qty"];
        }

        unset($item);


        $order["items"] = $items;
    }

    unset($order);


    return $orders;
}


// =====================================================
// MÉTODO
// =====================================================

$method = $_SERVER["REQUEST_METHOD"];


// =====================================================
// GET
// =====================================================

if ($method === "GET") {

    try {

        echo json_encode(
            getOrders($pdo),
            JSON_UNESCAPED_UNICODE |
            JSON_UNESCAPED_SLASHES
        );

    } catch (Exception $e) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "error" => "No se pudieron obtener los pedidos"
        ]);
    }

    exit;
}


// =====================================================
// POST - CREAR PEDIDO
// =====================================================

if ($method === "POST") {

    $input = json_decode(
        file_get_contents("php://input"),
        true
    );


    if (!$input || !is_array($input)) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "error" => "Datos inválidos"
        ]);

        exit;
    }


    try {

        $pdo->beginTransaction();


        // =============================================
        // ID Y FECHA
        // =============================================

        $id = uniqid();

        $createdAt = date("Y-m-d H:i:s");

        $status = "Pendiente";


        // =============================================
        // CREAR PEDIDO
        // =============================================

$stmtOrder = $pdo->prepare("
    INSERT INTO orders (
        id,
        customer_name,
        customer_email,
        customer_phone,
        status,
        created_at
    )
    VALUES (
        :id,
        :customer_name,
        :customer_email,
        :customer_phone,
        :status,
        :created_at
    )
");


$stmtOrder->execute([

    ":id" =>
        $id,

    ":customer_name" =>
        $input["customer"]["name"] ??
        $input["name"] ??
        "",

    ":customer_email" =>
        $input["customer"]["email"] ??
        $input["email"] ??
        "",

    ":customer_phone" =>
        $input["customer"]["phone"] ??
        $input["phone"] ??
        "",

    ":status" =>
        $status,

    ":created_at" =>
        $createdAt
]);


        // =============================================
        // OBTENER CART
        // =============================================

        $cart = [];

        if (
            isset($input["cart"]) &&
            is_array($input["cart"])
        ) {

            $cart = $input["cart"];

        } elseif (
            isset($input["items"]) &&
            is_array($input["items"])
        ) {

            $cart = $input["items"];
        }


        // =============================================
        // INSERTAR ITEMS
        // =============================================

$stmtProduct = $pdo->prepare("
    SELECT
        id,
        name,
        price
    FROM products
    WHERE id = :id
    LIMIT 1
");


        $stmtImages = $pdo->prepare("
            SELECT image_url
            FROM product_images
            WHERE product_id = :product_id
            ORDER BY id ASC
            LIMIT 1
        ");


        $stmtItem = $pdo->prepare("
            INSERT INTO order_items (
                order_id,
                product_id,
                name,
                image,
                price,
                qty
            )
            VALUES (
                :order_id,
                :product_id,
                :name,
                :image,
                :price,
                :qty
            )
        ");


        foreach ($cart as $item) {

            $productId = $item["id"] ?? null;


            if (!$productId) {
                continue;
            }


            // =========================================
            // BUSCAR PRODUCTO EN MYSQL
            // =========================================

            $stmtProduct->execute([
                ":id" => $productId
            ]);

            $product = $stmtProduct->fetch();


            if (!$product) {

                // Si no existe, usamos los datos enviados
                $name =
                    $item["name"] ??
                    "Sin nombre";

                $price =
                    $item["price"] ??
                    0;

                $image =
                    $item["image"] ??
                    null;

            } else {

                $name =
                    $product["name"];

                $price =
                    $product["price"];


                // =====================================
                // PRIMERA IMAGEN
                // =====================================

                $stmtImages->execute([
                    ":product_id" =>
                        $productId
                ]);

                $image =
                    $stmtImages->fetchColumn();

                if (!$image) {

                    $image =
                        $item["image"] ??
                        null;
                }
            }


            $qty =
                isset($item["qty"])
                ? (int) $item["qty"]
                : 1;


            if ($qty < 1) {
                $qty = 1;
            }


            // =========================================
            // GUARDAR ITEM
            // =========================================

            $stmtItem->execute([

                ":order_id" =>
                    $id,

                ":product_id" =>
                    $productId,

                ":name" =>
                    $name,

                ":image" =>
                    $image,

                ":price" =>
                    $price,

                ":qty" =>
                    $qty
            ]);
        }


        $pdo->commit();


        // =============================================
        // OBTENER PEDIDO COMPLETO
        // =============================================

        $orders = getOrders($pdo);

        $createdOrder = null;


        foreach ($orders as $order) {

            if ($order["id"] === $id) {

                $createdOrder =
                    $order;

                break;
            }
        }


        echo json_encode([

            "success" =>
                true,

            "order" =>
                $createdOrder

        ], JSON_UNESCAPED_UNICODE |
           JSON_UNESCAPED_SLASHES);


    } catch (Exception $e) {

        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        http_response_code(500);

        echo json_encode([

            "success" =>
                false,

            "error" =>
                "No se pudo crear el pedido"
        ]);
    }

    exit;
}


// =====================================================
// PUT - ACTUALIZAR ESTADO
// =====================================================

if ($method === "PUT") {

    $input = json_decode(
        file_get_contents("php://input"),
        true
    );


    if (
        !$input ||
        empty($input["id"])
    ) {

        http_response_code(400);

        echo json_encode([

            "success" =>
                false,

            "error" =>
                "Falta el ID del pedido"
        ]);

        exit;
    }


    try {

        $stmt = $pdo->prepare("
            UPDATE orders
            SET status = :status
            WHERE id = :id
        ");


        $stmt->execute([

            ":status" =>
                $input["status"] ??
                "Pendiente",

            ":id" =>
                $input["id"]
        ]);


        echo json_encode([

            "success" =>
                true

        ]);

    } catch (Exception $e) {

        http_response_code(500);

        echo json_encode([

            "success" =>
                false,

            "error" =>
                "No se pudo actualizar el pedido"
        ]);
    }

    exit;
}


// =====================================================
// DELETE - ELIMINAR PEDIDO
// =====================================================

if ($method === "DELETE") {

    $input = json_decode(
        file_get_contents("php://input"),
        true
    );


    $id =
        $input["id"] ??
        ($_GET["id"] ?? null);


    if (!$id) {

        http_response_code(400);

        echo json_encode([

            "success" =>
                false,

            "error" =>
                "Falta el ID del pedido"
        ]);

        exit;
    }


    try {

        $stmt = $pdo->prepare("
            DELETE FROM orders
            WHERE id = :id
        ");


        $stmt->execute([

            ":id" =>
                $id
        ]);


        echo json_encode([

            "success" =>
                true,

            "deleted_id" =>
                $id

        ]);

    } catch (Exception $e) {

        http_response_code(500);

        echo json_encode([

            "success" =>
                false,

            "error" =>
                "No se pudo eliminar el pedido"
        ]);
    }

    exit;
}


// =====================================================
// MÉTODO NO SOPORTADO
// =====================================================

http_response_code(405);

echo json_encode([

    "success" =>
        false,

    "error" =>
        "Método no permitido"
]);