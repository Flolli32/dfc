# Tech-Stack & Architektur – DFC Website

## Übersicht

Statische Website ohne Framework. HTML, CSS, vanilla JavaScript. Deployment vollautomatisch via GitHub Actions zu IONOS-Webspace per FTPS.

## Frontend

### HTML
- Semantische Struktur (header / nav / main / section / article / footer).
- Sprache: Deutsch (`<html lang="de">`).
- Accessibility: alt-Texte, aria-Labels, Tastaturnavigation, ausreichender Kontrast.

### CSS
- **Mobile-first.**
- **CSS Custom Properties** für Farben, Spacing, Typografie, Border-Radien.
- **4-Breakpoint-System** (standardisiert auf der gesamten Seite):
  - Mobile (Basis, ohne Media Query)
  - Tablet (ab ~600px)
  - Desktop (ab ~960px)
  - Wide (ab ~1280px)
  *(Exakte Werte stehen in der CSS-Datei – bitte dort prüfen.)*
- Komponentenorientiertes Naming, BEM-artig oder klar semantisch.
- Keine CSS-Frameworks (kein Bootstrap, Tailwind etc.).

### JavaScript
- Vanilla JS, minimal.
- Keine Build-Tools / kein Bundler.
- Eingesetzt für: Navigation (Mobile Burger Menu), Embeds, kleinere Interaktionen.

## Bilder & Medien

- **Trainer-Karten:** max. 800px Breite, mit ImageMagick batch-konvertiert.
- Format-Präferenz: JPEG für Fotos, PNG für Grafiken/Logos, SVG wo möglich.
- Vor dem Commit: komprimieren.
- Lazy Loading (`loading="lazy"`) wo sinnvoll.

## Integrationen

- **YouTube-Embeds** (Privacy-Enhanced Mode: `youtube-nocookie.com`).
- **Instagram-Embeds** auf News-/Aktuelles-Seite.

## Deployment-Pipeline

1. Lokale Entwicklung in JetBrains Rider oder VS Code.
2. Commit + Push zu **GitHub** (Repo: DFC-Website).
3. **GitHub Actions Workflow** triggert auf Push zu `main`:
   - Optional: Build-/Lint-Schritte.
   - **FTPS-Deploy** zu IONOS-Webspace.
4. Live-Domain wird sofort aktualisiert.

## Domains & Hosting

- **Domain:** registriert bei **Strato**.
- **Webspace:** **IONOS** (Standard-Webhosting, FTPS-Zugang).
- DNS-Records bei Strato verwaltet.

## Tools im Workflow

- **JetBrains Rider** / **VS Code** – Editor.
- **GitHub Copilot Pro** – Code-Completion lokal.
- **Cursor IDE** mit Claude Code Extension – für größere Sessions.
- **Git** – Versionierung.
- **ImageMagick** – Bild-Batch-Processing.
- **DevTools** des Browsers – Debugging, Responsive-Tests.

## Was bewusst NICHT eingesetzt wird

- Kein JavaScript-Framework (React/Vue/Svelte).
- Kein CSS-Framework (Tailwind/Bootstrap).
- Kein Build-Step / kein Bundler.
- Kein CMS.
- Kein Tracking jenseits dessen, was rechtlich problemlos ist.
