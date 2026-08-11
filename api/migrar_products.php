<?php

header('Content-Type: text/plain; charset=utf-8');

echo "====================================\n";
echo " MIGRACION DE PRODUCTS.JSON A MYSQL\n";
echo "====================================\n\n";


// =====================================
// CONFIGURACION
// =====================================

$jsonFile = dirname(__DIR__) . '/data/products.json';

$dbHost = 'localhost';
$dbName = 'optica';
$dbUser = 'optica_user';
$dbPass = 'Optica_DB_2026!';


// =====================================
// COMPROBAR JSON
// =====================================

if (!file_exists($jsonFile)) {
    die("ERROR: No existe:\n$jsonFile\n");
}

$json = file_get_contents($jsonFile);

if ($json === false) {
    die("ERROR: No se pudo leer products.json\n");
}

$products = json_decode($json, true);

if (!is_array($products)) {
    die("ERROR: products.json no contiene un JSON valido\n");
}

echo "Archivo encontrado:\n";
echo "$jsonFile\n\n";

echo "Productos encontrados: " . count($products) . "\n\n";


// =====================================
// CONEXION MYSQL
// =====================================

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

    echo "Conexion MySQL: OK\n\n";

} catch (PDOException $e) {

    die(
        "ERROR MYSQL:\n" .
        $e->getMessage() .
        "\n"
    );
}


// =====================================
// PREPARAR CONSULTAS
// =====================================

$sqlProduct = "
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
    ON DUPLICATE KEY UPDATE

        name = VALUES(name),
        model = VALUES(model),
        brand = VALUES(brand),
        price = VALUES(price),
        category = VALUES(category),
        color = VALUES(color),
        image_url = VALUES(image_url),
        overlay_url = VALUES(overlay_url),
        in_stock = VALUES(in_stock),
        description = VALUES(description),
        created_at = VALUES(created_at)
";

$stmtProduct = $pdo->prepare($sqlProduct);


// =====================================
// INSERTAR IMAGEN
// =====================================

$sqlImage = "
    INSERT INTO product_images (
        product_id,
        image_url
    )
    VALUES (
        :product_id,
        :image_url
    )
";

$stmtImage = $pdo->prepare($sqlImage);


// =====================================
// MIGRACION
// =====================================

$totalProducts = 0;
$totalImages = 0;

foreach ($products as $product) {

    if (empty($product['id'])) {

        echo "AVISO: Producto sin ID. Se omite.\n";
        continue;
    }

    $id = $product['id'];

    echo "------------------------------------\n";
    echo "Producto: " . ($product['name'] ?? 'Sin nombre') . "\n";
    echo "ID: $id\n";


    // =================================
    // FECHA
    // =================================

    $createdAt = null;

    if (!empty($product['created_at'])) {

        try {

            $date = new DateTime($product['created_at']);

            $createdAt = $date->format('Y-m-d H:i:s');

        } catch (Exception $e) {

            $createdAt = date('Y-m-d H:i:s');
        }

    } else {

        $createdAt = date('Y-m-d H:i:s');
    }


    // =================================
    // PRODUCTO
    // =================================

    $stmtProduct->execute([

        ':id' => $id,

        ':name' =>
            $product['name'] ?? '',

        ':model' =>
            $product['model'] ?? null,

        ':brand' =>
            $product['brand'] ?? null,

        ':price' =>
            $product['price'] ?? 0,

        ':category' =>
            $product['category'] ?? null,

        ':color' =>
            $product['color'] ?? null,

        ':image_url' =>
            $product['image_url'] ?? null,

        ':overlay_url' =>
            $product['overlay_url'] ?? null,

        ':in_stock' =>
            !empty($product['in_stock']) ? 1 : 0,

        ':description' =>
            $product['description'] ?? null,

        ':created_at' =>
            $createdAt
    ]);


    $totalProducts++;


    // =================================
    // IMAGENES
    // =================================

    if (
        isset($product['images']) &&
        is_array($product['images'])
    ) {

        foreach ($product['images'] as $image) {

            if (empty($image)) {
                continue;
            }

            /*
             * Evitamos duplicar imágenes si
             * ejecutamos nuevamente el script.
             */

            $check = $pdo->prepare("
                SELECT id
                FROM product_images
                WHERE product_id = :product_id
                AND image_url = :image_url
                LIMIT 1
            ");

            $check->execute([

                ':product_id' => $id,

                ':image_url' => $image
            ]);

            if (!$check->fetch()) {

                $stmtImage->execute([

                    ':product_id' => $id,

                    ':image_url' => $image
                ]);

                $totalImages++;

                echo "  Imagen agregada: $image\n";

            } else {

                echo "  Imagen ya existe: $image\n";
            }
        }
    }
}


// =====================================
// RESUMEN
// =====================================

echo "\n";
echo "====================================\n";
echo " MIGRACION FINALIZADA\n";
echo "====================================\n";

echo "Productos procesados: $totalProducts\n";
echo "Imagenes agregadas:   $totalImages\n";

echo "\nIMPORTANTE:\n";
echo "products.json NO fue modificado.\n";
echo "Las imagenes NO fueron modificadas.\n";
echo "====================================\n";