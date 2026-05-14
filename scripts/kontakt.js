// kontakt.js
// Google Maps wird über den Cookie-Banner (cookies.js) gesteuert.
// DFC_Cookies.init() ruft enableMaps() automatisch auf, wenn Einwilligung vorliegt.

// Kontaktformular per AJAX absenden – kein Seitenwechsel, Feedback inline
document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.contact-form form');
    if (!form) return;

    const status = document.getElementById('form-status');
    const button = form.querySelector('button[type="submit"]');

    function showStatus(type, text) {
        if (!status) return;
        status.className = 'form-status form-status-' + type;
        status.textContent = text;
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        button.disabled = true;
        showStatus('info', 'Wird gesendet …');

        try {
            const res = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form)
            });
            const result = (await res.text()).trim();

            if (res.ok && result === 'success') {
                showStatus('success', 'Danke! Deine Nachricht wurde gesendet. Wir melden uns bald.');
                form.reset();
            } else if (result === 'ratelimit') {
                showStatus('error', 'Zu viele Anfragen. Bitte versuche es später erneut.');
            } else {
                showStatus('error', 'Senden fehlgeschlagen. Bitte prüfe deine Eingaben oder schreib uns direkt eine E-Mail.');
            }
        } catch (err) {
            showStatus('error', 'Netzwerkfehler. Bitte versuche es später erneut oder schreib uns direkt eine E-Mail.');
        } finally {
            button.disabled = false;
        }
    });
});
