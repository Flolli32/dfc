// mannschaften.js
// Burger-Menü wird zentral über includes.js gesteuert

// Spieler-Liste Toggle
function togglePlayers(button) {
    const playersList = button.nextElementSibling;
    const isActive = playersList.classList.contains('active');

    if (isActive) {
        playersList.classList.remove('active');
        button.classList.remove('active');
        button.querySelector('span:first-child').textContent = 'Spieler anzeigen';
    } else {
        playersList.classList.add('active');
        button.classList.add('active');
        button.querySelector('span:first-child').textContent = 'Spieler ausblenden';
    }
}

// Terminplan Tab-Umschaltung
function showTerminplan(id, btn) {
    document.querySelectorAll('.terminplan-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.terminplan-tab').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');
}
