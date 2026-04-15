<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;

// Honeypot: Bots füllen versteckte Felder aus – echte Nutzer nicht
if (!empty($_POST['website'])) {
    // Stille Ablehnung – Bot merkt nichts
    echo "success";
    exit;
}

// Rate Limiting: max. 3 Anfragen pro IP pro Stunde
$ip        = $_SERVER['REMOTE_ADDR'];
$rateFile  = sys_get_temp_dir() . '/dfc_mail_' . md5($ip) . '.json';
$rateLimit = 3;
$rateWindow = 3600; // 1 Stunde

$rates = [];
if (file_exists($rateFile)) {
    $rates = json_decode(file_get_contents($rateFile), true) ?: [];
}
// Alte Einträge entfernen
$rates = array_filter($rates, fn($t) => (time() - $t) < $rateWindow);

if (count($rates) >= $rateLimit) {
    http_response_code(429);
    echo "ratelimit";
    exit;
}

// Eingaben validieren & bereinigen
$name    = trim(htmlspecialchars($_POST['name']    ?? ''));
$email   = trim(htmlspecialchars($_POST['email']   ?? ''));
$phone   = trim(htmlspecialchars($_POST['phone']   ?? ''));
$message = trim(htmlspecialchars($_POST['message'] ?? ''));

if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo "error";
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo "error";
    exit;
}

// E-Mail senden an offizielle Vereinsadresse
$to      = "vorsitzender@dfc-online.de";
$subject = "Kontaktformular DFC – " . $name;

$body = "Name: $name\n"
      . "E-Mail: $email\n"
      . "Telefon: $phone\n\n"
      . "Nachricht:\n$message";

$headers = "From: noreply@dfc-online.de\r\n"
         . "Reply-To: $email\r\n"
         . "X-Mailer: PHP/" . phpversion();

if (mail($to, $subject, $body, $headers)) {
    // Rate-Limit-Eintrag speichern
    $rates[] = time();
    file_put_contents($rateFile, json_encode(array_values($rates)));
    echo "success";
} else {
    http_response_code(500);
    echo "error";
}
?>
