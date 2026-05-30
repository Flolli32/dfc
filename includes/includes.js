// Header und Footer automatisch laden
document.addEventListener('DOMContentLoaded', function () {

    // ── Header laden ──────────────────────────────────────────────
    fetch('/includes/header.html')
        .then(response => response.text())
        .then(html => {
            const headerEl = document.getElementById('header');
            if (headerEl) headerEl.innerHTML = html;

            // Aktiven Navlink hervorheben (erst nach Header-Inject)
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            document.querySelectorAll('.nav-menu a').forEach(link => {
                const linkPage = link.getAttribute('href').split('/').pop();
                if (linkPage === currentPage) link.classList.add('active');
            });

            // Burger-Menü initialisieren (erst nach Header-Inject verfügbar)
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            const navMenu = document.querySelector('.nav-menu');
            if (!mobileMenuBtn || !navMenu) return;

            function openMenu() {
                navMenu.classList.add('active');
                mobileMenuBtn.classList.add('open');
                mobileMenuBtn.setAttribute('aria-expanded', 'true');
                mobileMenuBtn.setAttribute('aria-label', 'Menü schließen');
            }

            function closeMenu() {
                navMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('open');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileMenuBtn.setAttribute('aria-label', 'Menü öffnen');
            }

            mobileMenuBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                navMenu.classList.contains('active') ? closeMenu() : openMenu();
            });

            navMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => closeMenu());
            });

            document.addEventListener('click', (e) => {
                if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                    closeMenu();
                }
            });

            window.addEventListener('scroll', () => closeMenu(), { passive: true });
        })
        .catch(error => console.error('Fehler beim Laden des Headers:', error));

    // ── Footer laden ──────────────────────────────────────────────
    fetch('/includes/footer.html')
        .then(response => response.text())
        .then(data => {
            const footerEl = document.getElementById('footer');
            if (footerEl) footerEl.innerHTML = data;
        })
        .catch(error => console.error('Fehler beim Laden des Footers:', error));

    // ── "Nach oben"-Button ────────────────────────────────────────
    (function () {
        const btn = document.createElement('button');
        btn.className = 'back-to-top';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Nach oben');
        btn.innerHTML =
            '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
            '<path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" stroke-width="2.2" ' +
            'stroke-linecap="round" stroke-linejoin="round"/></svg>';
        document.body.appendChild(btn);

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function onScroll() {
            btn.classList.toggle('is-visible', window.pageYOffset > 300);
        }

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        });

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    })();
});