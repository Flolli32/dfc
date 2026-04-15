<?php
/**
 * Galerie Auto-Loader mit Public/Private Trennung
 * 
 * Ordnerstruktur:
 *   ressources/galerie/public/  → Alle sehen diese Alben
 *   ressources/galerie/private/ → Nur eingeloggte Mitglieder
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

ini_set('session.cookie_httponly', 1);
ini_set('session.use_strict_mode', 1);
session_start();

header('Content-Type: application/json');
header('Cache-Control: no-store');

$isLoggedIn = (
    isset($_SESSION['member_auth']) &&
    $_SESSION['member_auth'] === true &&
    isset($_SESSION['auth_ip']) &&
    $_SESSION['auth_ip'] === $_SERVER['REMOTE_ADDR']
);

$rootPath = dirname(__DIR__);
$galerieBasePath = $rootPath . '/ressources/galerie';
$galerieBaseUrl = '/ressources/galerie';

if (!is_dir($galerieBasePath)) {
    echo json_encode([
        'success' => false,
        'error' => 'Galerie-Ordner nicht gefunden',
        'expected_path' => $galerieBasePath
    ]);
    exit;
}

$albums = [];
$visibleFolders = ['public'];
if ($isLoggedIn) {
    $visibleFolders[] = 'private';
}

foreach ($visibleFolders as $visibility) {
    $visibilityPath = $galerieBasePath . '/' . $visibility;
    if (!is_dir($visibilityPath)) continue;

    $yearFolders = scandir($visibilityPath);
    foreach ($yearFolders as $yearFolder) {
        if (in_array($yearFolder, ['.', '..', '.DS_Store'])) continue;
        $yearPath = $visibilityPath . '/' . $yearFolder;
        if (!is_dir($yearPath)) continue;

        $albumFolders = scandir($yearPath);
        foreach ($albumFolders as $albumFolder) {
            if (in_array($albumFolder, ['.', '..', '.DS_Store'])) continue;
            $albumPath = $yearPath . '/' . $albumFolder;
            if (!is_dir($albumPath)) continue;

            $photos = [];
            $files = scandir($albumPath);
            foreach ($files as $file) {
                if (in_array($file, ['.', '..', '.DS_Store'])) continue;
                $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                    if ($visibility === 'private') {
                    $photos[] = '/php/image-proxy.php?file=' . urlencode($yearFolder . '/' . $albumFolder . '/' . $file);
                } else {
                    $photos[] = $galerieBaseUrl . '/public/' . $yearFolder . '/' . $albumFolder . '/' . $file;
                }
                }
            }
            if (count($photos) === 0) continue;

            preg_match('/(\d{4})/', $albumFolder . ' ' . $yearFolder, $yearMatch);
            $year = !empty($yearMatch) ? (int)$yearMatch[1] : 2000;

            $decade = 'pre2000';
            if ($year >= 2020) $decade = '2020';
            elseif ($year >= 2010) $decade = '2010';
            elseif ($year >= 2000) $decade = '2000';

            $albumId = strtolower(str_replace([' ', '.', '_'], '-', $visibility . '-' . $yearFolder . '-' . $albumFolder));

            $albums[] = [
                'id'         => $albumId,
                'title'      => $albumFolder,
                'year'       => $year,
                'decade'     => $decade,
                'category'   => detectCategory($albumFolder),
                'visibility' => $visibility,
                'photoCount' => count($photos),
                'coverImage' => $photos[0],
                'photos'     => $photos
            ];
        }
    }
}

usort($albums, fn($a, $b) => $b['year'] - $a['year']);

echo json_encode([
    'success'     => true,
    'albums'      => $albums,
    'totalAlbums' => count($albums),
    'isLoggedIn'  => $isLoggedIn
]);

function detectCategory($folderName) {
    $name = strtolower($folderName);
    if (preg_match('/(meisterschaft|meister|aufstieg|pokal|finale|champion|titel|sieg|sieger)/i', $name)) return 'erfolge';
    if (preg_match('/(grill|bbq|feier|weihnacht|party|jubiläum|fest|fete|sommerfest|silvester)/i', $name)) return 'events';
    if (preg_match('/\bgegen\b|punktspiel|heimspiel|auswärtsspiel|freundschaftsspiel|derby/i', $name)) return 'teams';
    if (preg_match('/(training|ausflug|trainingslager|vereins|besuch|ehrung|halle|arbeitseinsatz)/i', $name)) return 'vereinsleben';
    return 'allgemein';
}
