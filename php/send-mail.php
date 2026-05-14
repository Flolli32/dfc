<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;

// Honeypot: Bots füllen versteckte Felder aus – echte Nutzer nicht
if (!empty($_POST['website'])) {
    // Stille Ablehnung – Bot merkt nichts
    echo "success";
    exit;
}

// Rate Limiting: max. 5 Anfragen pro IP pro Stunde
$ip        = $_SERVER['REMOTE_ADDR'];
$rateFile  = sys_get_temp_dir() . '/dfc_mail_' . md5($ip) . '.json';
$rateLimit = 5;
$rateWindow = 3600; // 1 Stunde

// Ausgenommene IPs (kein Limit) – z. B. Admin
$exemptIps = [
    '77.22.231.6',
];

if (!in_array($ip, $exemptIps, true)) {
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
} else {
    $rates = [];
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

// Datenschutz-Zustimmung muss vorliegen
if (empty($_POST['datenschutz'])) {
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
$subject = "Kontaktformular DFC - " . $name;

$body = "Name: $name\n"
      . "E-Mail: $email\n"
      . "Telefon: $phone\n\n"
      . "Nachricht:\n$message";

// From MUSS eine Domain-Adresse sein (SPF), Reply-To zeigt auf Absender
$from    = "noreply@dfc-online.de";
$headers = "From: DFC Kontaktformular <$from>\r\n"
         . "Reply-To: $name <$email>\r\n"
         . "Content-Type: text/plain; charset=UTF-8\r\n"
         . "X-Mailer: PHP/" . phpversion();

// 5. Parameter: Envelope-Sender – viele Hoster verlangen das für Zustellung
$sent = mail($to, $subject, $body, $headers, "-f$from");

if ($sent) {
    // Rate-Limit-Eintrag speichern
    $rates[] = time();
    file_put_contents($rateFile, json_encode(array_values($rates)));
    echo "success";
} else {
    error_log("DFC send-mail: mail() fehlgeschlagen fuer $email");
    http_response_code(500);
    echo "error";
}
?>
