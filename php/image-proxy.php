<?php
ini_set('session.cookie_httponly', 1);
ini_set('session.use_strict_mode', 1);
session_start();

$isLoggedIn = (
    isset($_SESSION['member_auth']) &&
    $_SESSION['member_auth'] === true &&
    isset($_SESSION['auth_ip']) &&
    $_SESSION['auth_ip'] === $_SERVER['REMOTE_ADDR']
);

if (!$isLoggedIn) {
    http_response_code(403);
    exit;
}

$file = $_GET['file'] ?? '';
// Sicherheit: Path Traversal verhindern
$file = ltrim($file, '/');
$file = str_replace(['..', '\\'], '', $file);

$rootPath = dirname(__DIR__);
$fullPath = $rootPath . '/ressources/galerie/private/' . $file;

if (!file_exists($fullPath) || !is_file($fullPath)) {
    http_response_code(404);
    exit;
}

$ext = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
$mimeTypes = [
    'jpg'  => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png'  => 'image/png',
    'gif'  => 'image/gif',
    'webp' => 'image/webp'
];

if (!isset($mimeTypes[$ext])) {
    http_response_code(403);
    exit;
}

header('Content-Type: ' . $mimeTypes[$ext]);
header('Cache-Control: private, max-age=3600');
header('Content-Length: ' . filesize($fullPath));
readfile($fullPath);
