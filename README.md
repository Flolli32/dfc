# Delmenhorster Federball-Club – Website

Vereinswebsite des DFC Delmenhorst. Vanilla HTML/CSS/JavaScript, gehostet auf einem nginx-Server (Docker auf Synology NAS, geplant: IONOS).

---

## Verzeichnisstruktur

```
/
├── index.html               # Startseite
├── verein.html              # Vereinsinfo, Vorstand, Ehrungen
├── mannschaften.html        # Mannschaften + Spielplan
├── mitgliedschaft.html      # Mitglied werden, Beiträge
├── jugend.html              # Jugendabteilung
├── faq.html                 # Häufige Fragen
├── galerie.html             # Fotogalerie (passwortgeschützt)
├── kontakt.html             # Kontaktformular + Google Maps
├── impressum.html           # Impressum
├── datenschutz.html         # Datenschutzerklärung (DSGVO)
├── 404.html                 # Fehlerseite
├── robots.txt               # Suchmaschinen-Direktiven
├── sitemap.xml              # Sitemap für SEO
│
├── includes/
│   ├── header.html          # Globale Navigation (per fetch geladen)
│   ├── footer.html          # Globaler Footer inkl. Cookie-Button
│   ├── common.css           # Gemeinsame Styles + @font-face
│   └── includes.js          # Header/Footer fetch + Burger-Menü + aktiver Nav-Link
│
├── styles/                  # Seitenspezifische CSS-Dateien
│   ├── cookies.css          # Cookie-Banner
│   ├── datenschutz.css
│   ├── faq.css
│   ├── galerie.css + galerie-auth.css
│   ├── impressum.css
│   ├── index.css
│   ├── jugend.css
│   ├── kontakt.css
│   ├── mannschaften.css
│   ├── mitgliedschaft.css
│   └── verein.css
│
├── scripts/                 # Seitenspezifische JS-Dateien
│   ├── cookies.js           # Cookie Consent Manager
│   ├── youtube.js           # YouTube-Videos (via PHP-Proxy)
│   ├── galerie_auto.js      # Galerie-Logik (Alben, Auth)
│   ├── index.js
│   ├── faq.js
│   ├── jugend.js
│   ├── kontakt.js
│   ├── mannschaften.js
│   ├── mitgliedschaft.js
│   └── verein.js
│
├── php/
│   ├── send-mail.php        # Kontaktformular (mit Honeypot + Rate-Limit)
│   ├── youtube-proxy.php    # YouTube API Proxy (versteckt API Key)
│   ├── get-albums.php       # Galerie-Alben laden
│   ├── auth.php             # Galerie-Authentifizierung
│   ├── init-password.php    # Passwort initialisieren
│   └── set-password.php     # Passwort ändern
│
└── ressources/
    ├── Logo.png             # Vereinslogo (auch Favicon)
    ├── fonts/               # Lokale Schriftarten (.woff2)
    │   ├── bebas-neue-v16-latin-regular.woff2
    │   ├── work-sans-v24-latin-300.woff2
    │   ├── work-sans-v24-latin-regular.woff2
    │   ├── work-sans-v24-latin-500.woff2
    │   ├── work-sans-v24-latin-600.woff2
    │   └── work-sans-v24-latin-700.woff2
    └── players/             # Vorstandsfotos
```

---

## Technische Details

| Thema | Details |
|---|---|
| Stack | Vanilla HTML / CSS / JavaScript |
| Schriftarten | Bebas Neue (Überschriften), Work Sans (Text) – lokal gehostet |
| Schriftart-Loading | `font-display: optional` (kein FOUT) |
| Server | nginx (Docker) |
| PHP | Für Kontaktformular, Galerie-Auth, YouTube-Proxy |

---

## Cookie-Banner (`scripts/cookies.js`)

Kategorien: **Notwendig** (immer aktiv) · **Google Maps** · **YouTube** · **Google Analytics**

Consent wird in `localStorage` unter dem Key `dfc_cookie_consent` gespeichert.

**GA4 Measurement ID eintragen** – in `scripts/cookies.js` Zeile suchen:
```javascript
const GA_ID = 'G-XXXXXXXXXX';
```
Durch die echte ID ersetzen, sobald Google Analytics genutzt werden soll.

**Cookie-Einstellungen zurücksetzen** (zum Testen im Browser):
```javascript
localStorage.removeItem('dfc_cookie_consent');
location.reload();
```

---

## YouTube (`scripts/youtube.js` + `php/youtube-proxy.php`)

Der API Key liegt **nur serverseitig** in `php/youtube-proxy.php`. Das Script cached die API-Antwort 1 Stunde in einer Temp-Datei.

Videos werden nur geladen wenn der Nutzer YouTube im Cookie-Banner zugestimmt hat.

**API Key oder Channel ID ändern** – in `php/youtube-proxy.php`:
```php
$apiKey    = 'AIzaSy...';
$channelId = 'UCATv3...';
```

---

## Kontaktformular (`php/send-mail.php`)

- Zieladresse: `vorsitzender@dfc-online.de`
- **Honeypot**: verstecktes Feld `website` – Bots füllen es aus und werden still abgewiesen
- **Rate-Limit**: max. 3 E-Mails pro IP pro Stunde
- **DSGVO**: Pflicht-Checkbox für Datenschutzerklärung im Formular

---

## Galerie

Passwortgeschützt über `php/auth.php`. Alben liegen als Ordner auf dem Server, `php/get-albums.php` liest sie aus.

**Passwort setzen/ändern**: `php/init-password.php` bzw. `php/set-password.php` aufrufen. Der Hash wird in `php/.member_hash` gespeichert.

---

## Skeleton-Ladeanimation

Galerie und YouTube zeigen beim Laden einen animierten Skeleton (Shimmer-Effekt) statt eines Lade-Textes.

**Testen**: Im Browser Netzwerk auf „Slow 3G" drosseln → Seite neu laden.

---

## 404-Fehlerseite aktivieren

In der `nginx.conf` in den `server`-Block eintragen:

```nginx
error_page 404 /404.html;
location = /404.html {
    internal;
}
```

---

## Datei-Berechtigungen nach Upload (nginx/Docker)

Neu hochgeladene Dateien haben oft `600` statt `644` → 403 Forbidden. Einmalig nach Upload ausführen:

```bash
docker exec nginx sh -c "chmod -R 644 /usr/share/nginx/html-dfc/ && find /usr/share/nginx/html-dfc -type d -exec chmod 755 {} \;"
```

---

## SEO

- Meta-Descriptions auf allen Seiten vorhanden
- Favicon: `ressources/Logo.png`
- `robots.txt` schließt `/php/` und `/includes/` aus
- `sitemap.xml` verlinkt alle 10 öffentlichen Seiten
- Domain in `sitemap.xml` ggf. anpassen wenn sich die URL ändert

---

## Datenschutz / DSGVO

- Keine externen Ressourcen beim Seitenaufruf (keine Google Fonts, kein CDN)
- Google Maps: 2-Klick-Lösung (Consent nötig)
- YouTube: nur nach Cookie-Einwilligung geladen
- Google Analytics: nur nach Cookie-Einwilligung, anonymisierte IP
- Vollständige Datenschutzerklärung unter `datenschutz.html`
