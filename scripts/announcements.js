const DFC_Announcement = (function () {

    const BANNER_ID = 'announcementBanner';
    const OVERLAY_ID = 'announcementOverlay';

    // Zeitraum festlegen
    const START_DATE = '2026-03-24';
    const END_DATE = '2026-03-27';


    function isActive() {

        const now = new Date();

        if (START_DATE && now < new Date(START_DATE)) return false;

        if (END_DATE && now > new Date(END_DATE)) return false;

        return true;
    }


    function createBanner() {

        const banner = document.createElement('div');

        banner.id = BANNER_ID;

        banner.innerHTML = `
            <div class="ab-box">

                <div class="ab-header">
                    <h3>Mitteilung</h3>
                </div>

                <div class="ab-text">
                    <strong>Training fällt aus:</strong><br>
                    Dienstag und Donnerstag findet wegen Hallenreinigung kein Training statt.
                </div>

                <div class="ab-buttons">
                    <button class="ab-btn ab-btn-primary" id="abClose">
                        Verstanden
                    </button>
                </div>

            </div>
        `;

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

        document.getElementById('abClose')
            ?.addEventListener('click', closeBanner);

    }


    function closeBanner() {

        document.getElementById(BANNER_ID)
            ?.classList.remove('cb-visible');

        document.getElementById(OVERLAY_ID)
            ?.classList.remove('cb-visible');

    }


    function init() {

        // prüfen ob Mitteilung aktiv ist
        if (!isActive()) return;

        createBanner();

        createOverlay();

        setTimeout(() => {

            document.getElementById(BANNER_ID)
                ?.classList.add('cb-visible');

            document.getElementById(OVERLAY_ID)
                ?.classList.add('cb-visible');

        }, 500);

    }

    return { init };

})();

document.addEventListener('DOMContentLoaded', DFC_Announcement.init);