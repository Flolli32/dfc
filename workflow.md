# Workflows – DFC Website

## Git-Workflow

### Branching
- `main` ist Deployment-Branch. Push auf `main` → Auto-Deploy via GitHub Actions.
- Größere Änderungen idealerweise in Feature-Branches, dann Merge via PR.
- Kleine Content-Updates direkt auf `main`.

### Commits
- Aussagekräftige Messages.
- Eine logische Änderung pro Commit.
- Vor dem Push: lokal im Browser prüfen (DevTools, alle Breakpoints).

## Bildoptimierungs-Workflow (Trainer-Karten / Vereinsfotos)

ImageMagick-Batch-Script verkleinert Bilder auf max. 800px Breite und komprimiert sie.

### Beispiel-Befehle

```bash
# Einzelnes Bild auf 800px Breite skalieren, JPEG-Qualität 82
magick input.jpg -resize 800x -quality 82 -strip output.jpg

# Batch: alle .jpg in einem Verzeichnis
for f in *.jpg; do
  magick "$f" -resize 800x -quality 82 -strip "optimized/$f"
done

# PNG → JPEG falls Foto (keine Transparenz)
magick input.png -resize 800x -quality 82 -strip -background white -flatten output.jpg
```

- `-strip` entfernt EXIF-Metadaten (Privacy + kleinere Dateien).
- `-quality 82` ist ein guter Kompromiss aus Qualität und Dateigröße.

## CSS-Workflow

### Neue Komponente hinzufügen
1. CSS Custom Properties prüfen – passende Variablen verwenden, nicht hartcoden.
2. Mobile-first schreiben (Basis-Stil ohne Media Query).
3. Erst dann Tablet/Desktop/Wide-Anpassungen via Media Queries.
4. In allen 4 Breakpoints im Browser testen (DevTools Responsive Mode).

### Bestehende Komponente ändern
1. Prüfen, ob andere Seiten/Komponenten die gleiche Klasse nutzen.
2. Falls ja: zentrale Stelle anpassen oder neue Modifier-Klasse einführen.
3. Niemals Inline-Styles als "schnellen Fix".

## Deployment

### Standardfall
1. Änderungen lokal testen.
2. `git add .` → `git commit -m "..."` → `git push origin main`.
3. GitHub Actions läuft an, Status im Actions-Tab des Repos prüfen.
4. Nach ~1–2 Minuten Live-Seite im Inkognito-Modus prüfen (Cache umgehen).

### Bei SFTP-Fehlern
- IONOS-Zugangsdaten in GitHub Secrets prüfen (`FTP_HOST`, `FTP_USER`, `FTP_PASS`) – gelten auch für SFTP.
- SFTP läuft über Port 22. IONOS-Webhosting unterstützt kein klassisches FTP/FTPS.
- Logs der Action lesen – meistens auth- oder Pfad-Fehler.

## Content-Updates (häufige Aufgaben)

### Trainer-Karte hinzufügen/ändern
1. Foto durch Bildoptimierung jagen (max. 800px Breite).
2. Foto ins entsprechende Verzeichnis (z.B. `images/trainer/`) legen.
3. HTML-Karte ergänzen (Name, Funktion, Foto, ggf. Kontakt).
4. Commit + Push.

### News-Eintrag hinzufügen
1. Auf der News-/Aktuelles-Seite oben den neuen Eintrag einfügen.
2. Bei YouTube: nocookie-Embed verwenden.
3. Datum nicht vergessen.

### Mannschaft / Spielplan aktualisieren
1. Tabellen-Markup nutzen (keine Layout-Tabellen, semantische Tabellen für Daten).
2. Quelle (z.B. Verbands-Tabellen) verlinken.

## Häufige Stolpersteine

- **Cache nach Deploy:** Browser cached aggressiv. Im Inkognito testen oder `Ctrl+F5`.
- **SFTP-Pfade:** `remote_path` in `deploy.yml` muss zur IONOS-Wurzel passen (oft `/` oder ein Unterordner) – der Pfad, den FileZilla nach dem Verbinden anzeigt.
- **Bildgrößen:** Nicht riesige Originale hochladen – immer durch ImageMagick.
- **Mobile-Test:** Echtes Smartphone schlägt DevTools-Simulation.
