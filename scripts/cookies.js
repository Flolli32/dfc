// ================================================
// DFC Cookie Consent Manager
// Kategorien: necessary | maps | analytics | youtube
// ================================================

const DFC_Cookies = (function () {

    const STORAGE_KEY = 'dfc_cookie_consent';
    const BANNER_ID = 'cookieBanner';
    const OVERLAY_ID = 'cookieOverlay';

    function getConsent() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; }
        catch { return null; }
    }

    function saveConsent(consent) {
        consent.timestamp = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    }

    function hasConsented() { return getConsent() !== null; }

    // ── Services aktivieren ───────────────────────
    function applyConsent(consent) {
        if (consent.maps) enableMaps();
        if (consent.youtube) enableYouTube();
        if (consent.analytics) enableAnalytics();
    }

    function enableMaps() {
        const consent = document.getElementById('mapConsent');
        const iframe = document.getElementById('mapIframe');
        if (iframe && consent) {
            iframe.src = iframe.getAttribute('data-src');
            iframe.style.display = 'block';
            consent.style.display = 'none';
        }
    }

    function enableYouTube() {
        if (typeof loadYouTubeVideos === 'function') {
            loadYouTubeVideos();
        }
    }

    function enableAnalytics() {
        const GA_ID = 'G-XXXXXXXXXX'; // <-- GA4 Measurement ID eintragen
        if (window.gaLoaded) return;
        window.gaLoaded = true;
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
        document.head.appendChild(script);
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', GA_ID, { anonymize_ip: true });
    }

    // ── Banner HTML ──────────────────────────────
    function createBanner() {
        const consent = getConsent() || { maps: false, youtube: false };

        const banner = document.createElement('div');
        banner.id = BANNER_ID;
        banner.innerHTML = `
            <div class="cb-box">
                <div class="cb-header">
                    <h3>Cookie-Einstellungen</h3>
                </div>
                <p class="cb-text">
                    Wir verwenden Cookies und ähnliche Technologien.
                    Mehr dazu in unserer <a href="/datenschutz.html">Datenschutzerklärung</a>.
                </p>
                <div class="cb-categories">
                    <div class="cb-category">
                        <div class="cb-category-header">
                            <div class="cb-category-info">
                                <span class="cb-category-name">Notwendig</span>
                                <span class="cb-category-desc">Session-Verwaltung, Sicherheit. Immer aktiv.</span>
                            </div>
                            <div class="cb-toggle-disabled"><span>Immer aktiv</span></div>
                        </div>
                    </div>
                    <div class="cb-category">
                        <div class="cb-category-header">
                            <div class="cb-category-info">
                                <span class="cb-category-name">Google Maps</span>
                                <span class="cb-category-desc">Kartenanzeige auf der Kontaktseite. Daten gehen an Google. Daten können in die USA übertragen werden. Es besteht ein Risiko eines geringeren Datenschutzniveaus.</span>
                            </div>
                            <label class="cb-switch">
                                <input type="checkbox" id="toggleMaps" ${consent.maps ? 'checked' : ''}>
                                <span class="cb-slider"></span>
                            </label>
                        </div>
                    </div>
                    <div class="cb-category">
                        <div class="cb-category-header">
                            <div class="cb-category-info">
                                <span class="cb-category-name">YouTube</span>
                                <span class="cb-category-desc">Aktuelle Videos auf der Startseite. Daten gehen an Google. Daten können in die USA übertragen werden. Es besteht ein Risiko eines geringeren Datenschutzniveaus.</span>
                            </div>
                            <label class="cb-switch">
                                <input type="checkbox" id="toggleYoutube" ${consent.youtube ? 'checked' : ''}>
                                <span class="cb-slider"></span>
                            </label>
                        </div>
                    </div>

                </div>
                <div class="cb-buttons">
                    <button class="cb-btn cb-btn-secondary" id="cbRejectAll">Nur notwendige</button>
                    <button class="cb-btn cb-btn-secondary" id="cbSaveSettings">Auswahl speichern</button>
                    <button class="cb-btn cb-btn-primary" id="cbAcceptAll">Alle akzeptieren</button>
                </div>
            </div>`;

        document.body.appendChild(banner);
        bindEvents();
    }

    function createOverlay() {
        const overlay = document.createElement('div');
        overlay.id = OVERLAY_ID;
        overlay.addEventListener('click', closeBanner);
        document.body.appendChild(overlay);
    }

    function bindEvents() {
        document.getElementById('cbAcceptAll').addEventListener('click', () => {
            const consent = { maps: true, youtube: true };
            saveConsent(consent);
            applyConsent(consent);
            closeBanner();
        });

        document.getElementById('cbRejectAll').addEventListener('click', () => {
            saveConsent({ maps: false, youtube: false });
            closeBanner();
        });

        document.getElementById('cbSaveSettings').addEventListener('click', () => {
            const consent = {
                maps: document.getElementById('toggleMaps').checked,
                youtube: document.getElementById('toggleYoutube').checked,
            };
            saveConsent(consent);
            applyConsent(consent);
            closeBanner();
        });
    }

    function openSettings() {
        if (!document.getElementById(BANNER_ID)) {
            createBanner();
            createOverlay();
        }
        document.getElementById(BANNER_ID).classList.add('cb-visible');
        document.getElementById(OVERLAY_ID).classList.add('cb-visible');
        document.body.style.overflow = 'hidden';
    }

    function closeBanner() {
        const banner = document.getElementById(BANNER_ID);
        const overlay = document.getElementById(OVERLAY_ID);
        if (banner) banner.classList.remove('cb-visible');
        if (overlay) overlay.classList.remove('cb-visible');
        document.body.style.overflow = '';
    }

    function init() {
        if (!hasConsented()) {
            createBanner();
            createOverlay();
            setTimeout(() => {
                const b = document.getElementById(BANNER_ID);
                const o = document.getElementById(OVERLAY_ID);
                if (b) b.classList.add('cb-visible');
                if (o) o.classList.add('cb-visible');
            }, 600);
        } else {
            applyConsent(getConsent());
        }
    }

    return { init, openSettings, getConsent };

})();

document.addEventListener('DOMContentLoaded', DFC_Cookies.init);