<?php
// PHP index.php - SPA Router for Laravel/Laragon
// Routes all non-file requests to index.html

$request = $_SERVER['REQUEST_URI'];

// Remove query string
$request = parse_url($request, PHP_URL_PATH);

// Check if file exists (except for index.php itself)
$file = __DIR__ . '/dist' . $request;

if ($request === '/index.php') {
    $file = __DIR__ . '/dist/index.html';
} else if ($request === '/') {
    $file = __DIR__ . '/dist/index.html';
} else if (
    file_exists($file) && 
    !is_dir($file) &&
    !preg_match('/\.(php|html|css|js|json|svg|png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot)$/', $request)
) {
    // Serve existing files
} else {
    // Route to SPA entry point
    $file = __DIR__ . '/dist/index.html';
}

// Serve the file
if (file_exists($file)) {
    // Security headers
    header('X-Frame-Options: DENY');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    
    // Set content type
    $mime_types = [
        'html' => 'text/html',
        'css' => 'text/css',
        'js' => 'application/javascript',
        'json' => 'application/json',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'gif' => 'image/gif',
        'svg' => 'image/svg+xml',
        'ico' => 'image/x-icon',
        'woff' => 'font/woff',
        'woff2' => 'font/woff2',
        'ttf' => 'font/ttf',
    ];
    
    $ext = pathinfo($file, PATHINFO_EXTENSION);
    $content_type = $mime_types[$ext] ?? 'text/html';
    header('Content-Type: ' . $content_type);
    
    readfile($file);
} else {
    header('HTTP/1.1 404 Not Found');
    echo 'File not found';
}