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
