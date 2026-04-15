// Verein.js - JavaScript für verein.html
// Burger-Menü wird zentral über includes.js gesteuert

// ============================================
// EHRUNGEN SECTION - TOGGLE FUNKTIONALITÄT
// ============================================

// Toggle für ältere Ehrungen
function toggleAelterEhrungen() {
    const content = document.getElementById('aeltereEhrungen');
    const btn = document.querySelector('.toggle-btn');
    const icon = document.querySelector('.toggle-icon');
    const text = document.querySelector('.toggle-text');

    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        text.textContent = 'Ältere Ehrungen ausblenden';
        icon.textContent = '▲';

        // Berechne Höhe der Timeline (nur bis zur kompakten Liste)
        updateTimelineHeight();
    } else {
        content.style.display = 'none';
        text.textContent = 'Ältere Ehrungen anzeigen (1977-2013)';
        icon.textContent = '▼';
    }
}

// Berechne die Höhe der Timeline für die vertikale Linie
function updateTimelineHeight() {
    setTimeout(() => {
        const altContainer = document.querySelector('.ehrungen-alt');
        const compactList = document.querySelector('.ehrung-compact-list');

        if (altContainer && compactList) {
            // Finde alle ehrung-items vor der compact-list
            const items = altContainer.querySelectorAll('.ehrung-item');
            const lastItem = items[items.length - 1];

            if (lastItem) {
                // Berechne Position des letzten Items relativ zum Container
                const containerTop = altContainer.getBoundingClientRect().top;
                const lastItemBottom = lastItem.getBoundingClientRect().bottom;
                const height = lastItemBottom - containerTop;

                // Setze CSS Variable
                altContainer.style.setProperty('--timeline-height', `${height}px`);
            }
        }
    }, 100); // Kurze Verzögerung damit Display geändert ist
}

// ============================================
// SMOOTH SCROLLING
// ============================================

// Smooth scroll für Anker-Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});