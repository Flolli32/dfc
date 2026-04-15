// faq.js
// Burger-Menü wird zentral über includes.js gesteuert

// FAQ Toggle
function toggleFAQ(button) {
    const faqItem  = button.parentElement;
    const answer   = faqItem.querySelector('.faq-answer');
    const isActive = button.classList.contains('active');

    document.querySelectorAll('.faq-question').forEach(q => {
        if (q !== button) {
            q.classList.remove('active');
            q.parentElement.querySelector('.faq-answer').classList.remove('active');
        }
    });

    button.classList.toggle('active', !isActive);
    answer.classList.toggle('active', !isActive);
}

// Smooth Scroll für Kategorie-Links
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({ top: target.offsetTop - 100, behavior: 'smooth' });
        }
    });
});
