<?php

if (php_sapi_name() !== 'cli') {
    die("Solo se puede ejecutar por consola\n");
}

$inputDir = $argv[1] ?? null;

if (!$inputDir || !is_dir($inputDir)) {
    die("Uso: php optimize-images.php /ruta/carpeta\n");
}

$outputDir = $inputDir . "/optimized";

if (!file_exists($outputDir)) {
    mkdir($outputDir, 0777, true);
}

function toWebp($src, $dest, $quality = 80) {
    $info = getimagesize($src);

    if ($info['mime'] == 'image/jpeg') {
        $img = imagecreatefromjpeg($src);
    } elseif ($info['mime'] == 'image/png') {
        $img = imagecreatefrompng($src);
        imagepalettetotruecolor($img);
        imagealphablending($img, true);
        imagesavealpha($img, true);
    } else {
        return false;
    }

    imagewebp($img, $dest, $quality);
    imagedestroy($img);
    return true;
}

function resize($src, $dest, $maxWidth, $maxHeight)
{
    list($width, $height) = getimagesize($src);

    // Calcular proporción
    $ratio = min(
        $maxWidth / $width,
        $maxHeight / $height
    );

    // No agrandar imágenes pequeñas
    if ($ratio > 1) {
        $ratio = 1;
    }

    $newWidth  = (int)($width * $ratio);
    $newHeight = (int)($height * $ratio);

    $img = imagecreatefromstring(file_get_contents($src));

    $tmp = imagecreatetruecolor(
        $newWidth,
        $newHeight
    );

    // Mantener transparencia PNG
    imagealphablending($tmp, false);
    imagesavealpha($tmp, true);

    imagecopyresampled(
        $tmp,
        $img,
        0,
        0,
        0,
        0,
        $newWidth,
        $newHeight,
        $width,
        $height
    );

    imagewebp($tmp, $dest, 80);

    imagedestroy($img);
    imagedestroy($tmp);
}

// leer carpeta
$files = scandir($inputDir);

foreach ($files as $file) {
    if ($file === '.' || $file === '..') continue;

    $path = $inputDir . "/" . $file;

    if (!is_file($path)) continue;

    $name = pathinfo($file, PATHINFO_FILENAME);

    echo "Procesando: $file\n";

    // original webp
    toWebp($path, $outputDir . "/" . $name . ".webp");

    // thumb
    resize($path, $outputDir . "/" . $name . "_300.webp", 300, 300);

    // medium
    resize($path, $outputDir . "/" . $name . "_800.webp", 800, 800);
}

echo "Listo!\n";