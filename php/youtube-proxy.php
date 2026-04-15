<?php
// YouTube API Proxy – hält den API Key serverseitig versteckt
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://dfc-online.de');

// API Key aus Konfigurationsdatei laden (liegt außerhalb von public/)
require_once __DIR__ . '/../../youtube_api_key.php';

// Cache-Datei
$cacheFile = sys_get_temp_dir() . '/dfc_youtube_cache.json';
$cacheDuration = 3600; // 1 Stunde

// Cache prüfen
if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheDuration) {
    echo file_get_contents($cacheFile);
    exit;
}

// API Key und Channel ID
$apiKey = YOUTUBE_API_KEY;
$channelId = 'UCATv3PzioJZI4NDW4MpAT5A';
$maxResults = 2;

$url = "https://www.googleapis.com/youtube/v3/search"
    . "?key={$apiKey}"
    . "&channelId={$channelId}"
    . "&part=snippet,id"
    . "&order=date"
    . "&maxResults={$maxResults}"
    . "&type=video"
    . "&eventType=completed";

$response = @file_get_contents($url);

if ($response === false) {
    http_response_code(502);
    echo json_encode(['error' => 'YouTube API nicht erreichbar']);
    exit;
}

// Im Cache speichern
file_put_contents($cacheFile, $response);

echo $response;
?>