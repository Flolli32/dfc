<?php
/**
 * Authentifizierung für die Mitglieder-Galerie
 * Passwort wird aus config.php gelesen (hardcodiert, nicht von außen erreichbar).
 */

// Sichere Session-Konfiguration
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_samesite', 'Strict');
ini_set('session.use_strict_mode', 1);
ini_set('session.cookie_secure', isset($_SERVER['HTTPS']));

session_start();

header('Content-Type: application/json');

// ── Passwort aus Konfigurationsdatei laden ────────────────
require_once __DIR__ . '/../../config.php';   // liegt außerhalb des Web-Roots (nicht öffentlich erreichbar)

// ── Brute-Force-Schutz: max. 5 Versuche pro IP in 15 Min ─
$rateFile = sys_get_temp_dir() . '/dfc_login_' . md5($_SERVER['REMOTE_ADDR']);
$maxAttempts = 5;
$lockoutTime = 900; // 15 Minuten

function checkRateLimit(string $rateFile, int $maxAttempts, int $lockoutTime): bool
{
    if (!file_exists($rateFile))
        return false;
    $attempts = json_decode(file_get_contents($rateFile), true) ?? [];
    $now = time();
    $recent = array_filter($attempts, fn($t) => ($now - $t) < $lockoutTime);
    return count($recent) >= $maxAttempts;
}

function recordAttempt(string $rateFile, int $lockoutTime): void
{
    $attempts = file_exists($rateFile)
        ? (json_decode(file_get_contents($rateFile), true) ?? [])
        : [];
    $now = time();
    $attempts = array_filter($attempts, fn($t) => ($now - $t) < $lockoutTime);
    $attempts[] = $now;
    file_put_contents($rateFile, json_encode(array_values($attempts)));
}

// ── Routen ────────────────────────────────────────────────
$action = $_POST['action'] ?? $_GET['action'] ?? '';

switch ($action) {

    // --- LOGIN ---
    case 'login':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Methode nicht erlaubt']);
            exit;
        }

        if (checkRateLimit($rateFile, $maxAttempts, $lockoutTime)) {
            http_response_code(429);
            echo json_encode(['success' => false, 'error' => 'Zu viele Versuche. Bitte 15 Minuten warten.']);
            exit;
        }

        $password = $_POST['password'] ?? '';

        if (empty($password)) {
            echo json_encode(['success' => false, 'error' => 'Passwort fehlt']);
            exit;
        }

        // Direktvergleich gegen das Passwort aus config.php
        if (hash_equals(GALLERY_PASSWORD, $password)) {
            session_regenerate_id(true);
            $_SESSION['member_auth'] = true;
            $_SESSION['auth_time'] = time();
            $_SESSION['auth_ip'] = $_SERVER['REMOTE_ADDR'];
            echo json_encode(['success' => true]);
        } else {
            recordAttempt($rateFile, $lockoutTime);
            echo json_encode(['success' => false, 'error' => 'Falsches Passwort']);
        }
        break;

    // --- LOGOUT ---
    case 'logout':
        $_SESSION = [];
        session_destroy();
        echo json_encode(['success' => true]);
        break;

    // --- STATUS ---
    case 'status':
        $loggedIn = (
            isset($_SESSION['member_auth']) &&
            $_SESSION['member_auth'] === true &&
            isset($_SESSION['auth_ip']) &&
            $_SESSION['auth_ip'] === $_SERVER['REMOTE_ADDR']
        );
        echo json_encode(['loggedIn' => $loggedIn]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Unbekannte Aktion']);
}
