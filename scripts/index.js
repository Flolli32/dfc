// Count-up der Stat-Zahlen beim ersten Sichtbarwerden
(function () {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    if (!counters.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function setFinal(el) {
        const target = parseInt(el.dataset.count, 10) || 0;
        el.textContent = target + (el.dataset.suffix || '');
    }

    function animate(el) {
        const target = parseInt(el.dataset.count, 10) || 0;
        const suffix = el.dataset.suffix || '';
        const duration = 1100;
        let startTime = null;

        function step(now) {
            if (startTime === null) startTime = now;
            const progress = Math.min((now - startTime) / duration, 1);
            // easeOutCubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    if (reduceMotion) {
        counters.forEach(setFinal);
        return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animate(entry.target);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    counters.forEach(el => observer.observe(el));
})();

// "Heute"-Hervorhebung bei Trainingszeiten
(function () {
    const entries = document.querySelectorAll('.time-entry[data-days]');
    if (!entries.length) return;

    const today = new Date().getDay(); // So=0 … Sa=6

    entries.forEach(entry => {
        const days = entry.dataset.days.split(',').map(d => parseInt(d, 10));
        if (!days.includes(today)) return;

        entry.classList.add('time-entry--today');
        const title = entry.querySelector('.time-title');
        if (title && !title.querySelector('.time-badge')) {
            const badge = document.createElement('span');
            badge.className = 'time-badge';
            badge.textContent = 'Heute';
            title.appendChild(badge);
        }
    });
})();

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Hide/show nav on scroll – nur auf Desktop (>1024px), auf Tablet/Mobile immer sichtbar
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (!nav) return;
    if (window.innerWidth <= 1024) {
        nav.style.transform = 'translateY(0)';
        lastScroll = window.pageYOffset;
        return;
    }
    const currentScroll = window.pageYOffset;
    if (currentScroll <= 0) {
        nav.style.transform = 'translateY(0)';
    } else if (currentScroll > lastScroll && currentScroll > 100) {
        nav.style.transform = 'translateY(-100%)';
    } else {
        nav.style.transform = 'translateY(0)';
    }
    lastScroll = currentScroll;
}, { passive: true });

// Instagram Ladeplatzhalter verstecken wenn Juicer fertig ist
(function () {
    const loading = document.getElementById("instagramLoading");
    const row = document.getElementById("instagramRow");
    if (!loading || !row) return;

    const observer = new MutationObserver(() => {
        if (row.querySelector(".j-container")) {
            loading.style.display = "none";
            observer.disconnect();
        }
    });

    observer.observe(row, { childList: true, subtree: true });

    setTimeout(() => {
        if (loading) loading.style.display = "none";
    }, 10000);
})();
