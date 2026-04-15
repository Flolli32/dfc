// jugend.js
// Burger-Menü wird zentral über includes.js gesteuert

// FAQ Toggle
function toggleFAQ(button) {
    const faqItem = button.parentElement;
    const answer  = faqItem.querySelector('.faq-answer');
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

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
