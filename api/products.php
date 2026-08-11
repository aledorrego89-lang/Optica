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
// FUNCIÓN: OBTENER PRODUCTOS CON SUS IMÁGENES
// =====================================================

function getProducts($pdo)
{
    $stmt = $pdo->query("
        SELECT
            id,
            name,
            model,
            brand,
            price,
            category,
            color,
            image_url,
            overlay_url,
            in_stock,
            description,
            created_at
        FROM products
        ORDER BY created_at DESC
    ");

    $products = $stmt->fetchAll();

    foreach ($products as &$product) {

        $stmtImages = $pdo->prepare("
            SELECT image_url
            FROM product_images
            WHERE product_id = :product_id
            ORDER BY id ASC
        ");

        $stmtImages->execute([
            ":product_id" => $product["id"]
        ]);

        $images = $stmtImages->fetchAll(PDO::FETCH_COLUMN);

        $product["images"] = $images;

        // Mantener compatibilidad con el JSON anterior
        $product["gallery"] = [];

        // Convertir tipos correctamente
        $product["price"] = (float) $product["price"];
        $product["in_stock"] = (bool) $product["in_stock"];
    }

    unset($product);

    return $products;
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

        $products = getProducts($pdo);

        echo json_encode(
            $products,
            JSON_UNESCAPED_UNICODE |
            JSON_UNESCAPED_SLASHES
        );

    } catch (Exception $e) {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "error" => "No se pudieron obtener los productos"
        ]);
    }

    exit;
}


// =====================================================
// POST - CREAR PRODUCTO
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


    // Generar ID
    $id = uniqid();

    // Fecha
    $createdAt = date("Y-m-d H:i:s");


    try {

        $pdo->beginTransaction();


        // =============================================
        // PRODUCTO
        // =============================================

        $stmt = $pdo->prepare("
            INSERT INTO products (
                id,
                name,
                model,
                brand,
                price,
                category,
                color,
                image_url,
                overlay_url,
                in_stock,
                description,
                created_at
            )
            VALUES (
                :id,
                :name,
                :model,
                :brand,
                :price,
                :category,
                :color,
                :image_url,
                :overlay_url,
                :in_stock,
                :description,
                :created_at
            )
        ");


        $stmt->execute([

            ":id" =>
                $id,

            ":name" =>
                $input["name"] ?? "",

            ":model" =>
                $input["model"] ?? null,

            ":brand" =>
                $input["brand"] ?? null,

            ":price" =>
                $input["price"] ?? 0,

            ":category" =>
                $input["category"] ?? null,

            ":color" =>
                $input["color"] ?? null,

            ":image_url" =>
                $input["image_url"] ?? null,

            ":overlay_url" =>
                $input["overlay_url"] ?? null,

            ":in_stock" =>
                !empty($input["in_stock"]) ? 1 : 0,

            ":description" =>
                $input["description"] ?? null,

            ":created_at" =>
                $createdAt
        ]);


        // =============================================
        // IMÁGENES
        // =============================================

        if (
            isset($input["images"]) &&
            is_array($input["images"])
        ) {

            $stmtImage = $pdo->prepare("
                INSERT INTO product_images (
                    product_id,
                    image_url
                )
                VALUES (
                    :product_id,
                    :image_url
                )
            ");

            foreach ($input["images"] as $image) {

                if (empty($image)) {
                    continue;
                }

                $stmtImage->execute([

                    ":product_id" =>
                        $id,

                    ":image_url" =>
                        $image
                ]);
            }
        }


        $pdo->commit();


        // Obtener producto completo
        $products = getProducts($pdo);

        $createdProduct = null;

        foreach ($products as $product) {

            if ($product["id"] === $id) {

                $createdProduct = $product;
                break;
            }
        }


        echo json_encode(
            $createdProduct,
            JSON_UNESCAPED_UNICODE |
            JSON_UNESCAPED_SLASHES
        );

    } catch (Exception $e) {

        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "error" => "No se pudo crear el producto"
        ]);
    }

    exit;
}


// =====================================================
// PUT - ACTUALIZAR PRODUCTO
// =====================================================

if ($method === "PUT") {

    parse_str(
        $_SERVER["QUERY_STRING"],
        $query
    );

    $id = $query["id"] ?? null;


    $input = json_decode(
        file_get_contents("php://input"),
        true
    );


    if (!$id || !$input || !is_array($input)) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "error" => "Missing id or data"
        ]);

        exit;
    }


    try {

        $pdo->beginTransaction();


        // =============================================
        // COMPROBAR PRODUCTO
        // =============================================

        $check = $pdo->prepare("
            SELECT id
            FROM products
            WHERE id = :id
        ");

        $check->execute([
            ":id" => $id
        ]);

        if (!$check->fetch()) {

            $pdo->rollBack();

            http_response_code(404);

            echo json_encode([
                "success" => false,
                "error" => "Producto no encontrado"
            ]);

            exit;
        }


        // =============================================
        // ACTUALIZAR SOLO CAMPOS RECIBIDOS
        // =============================================

        $allowedFields = [

            "name",
            "model",
            "brand",
            "price",
            "category",
            "color",
            "image_url",
            "overlay_url",
            "in_stock",
            "description"
        ];


        $updates = [];
        $params = [
            ":id" => $id
        ];


        foreach ($allowedFields as $field) {

            if (array_key_exists($field, $input)) {

                $updates[] =
                    "$field = :$field";

                $value = $input[$field];

                if ($field === "in_stock") {
                    $value = !empty($value) ? 1 : 0;
                }

                $params[":$field"] = $value;
            }
        }


        if (!empty($updates)) {

            $sql = "
                UPDATE products
                SET " . implode(", ", $updates) . "
                WHERE id = :id
            ";

            $stmt = $pdo->prepare($sql);

            $stmt->execute($params);
        }


        // =============================================
        // IMÁGENES
        // =============================================

        if (
            array_key_exists("images", $input) &&
            is_array($input["images"])
        ) {

            // Eliminar imágenes anteriores
            $deleteImages = $pdo->prepare("
                DELETE FROM product_images
                WHERE product_id = :product_id
            ");

            $deleteImages->execute([
                ":product_id" => $id
            ]);


            // Insertar nuevas imágenes
            $insertImage = $pdo->prepare("
                INSERT INTO product_images (
                    product_id,
                    image_url
                )
                VALUES (
                    :product_id,
                    :image_url
                )
            ");


            foreach ($input["images"] as $image) {

                if (empty($image)) {
                    continue;
                }

                $insertImage->execute([

                    ":product_id" =>
                        $id,

                    ":image_url" =>
                        $image
                ]);
            }
        }


        $pdo->commit();


        echo json_encode([

            "ok" => true,

            "updated_id" =>
                $id

        ]);

    } catch (Exception $e) {

        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        http_response_code(500);

        echo json_encode([

            "success" => false,

            "error" =>
                "No se pudo actualizar el producto"
        ]);
    }

    exit;
}


// =====================================================
// DELETE - ELIMINAR PRODUCTO
// =====================================================

if ($method === "DELETE") {

    $id = $_GET["id"] ?? null;


    if (!$id) {

        http_response_code(400);

        echo json_encode([
            "success" => false,
            "error" => "Missing id"
        ]);

        exit;
    }


    try {

        $stmt = $pdo->prepare("
            DELETE FROM products
            WHERE id = :id
        ");

        $stmt->execute([
            ":id" => $id
        ]);


        if ($stmt->rowCount() === 0) {

            http_response_code(404);

            echo json_encode([
                "success" => false,
                "error" => "Producto no encontrado"
            ]);

            exit;
        }


        /*
         * product_images se elimina automáticamente
         * gracias a ON DELETE CASCADE.
         */


        echo json_encode([

            "ok" => true,

            "deleted_id" =>
                $id

        ]);

    } catch (Exception $e) {

        http_response_code(500);

        echo json_encode([

            "success" => false,

            "error" =>
                "No se pudo eliminar el producto"
        ]);
    }

    exit;
}


// =====================================================
// MÉTODO NO SOPORTADO
// =====================================================

http_response_code(405);

echo json_encode([
    "success" => false,
    "error" => "Método no permitido"
]);