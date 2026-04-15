// Galerie JavaScript – mit Public/Private Login
let allAlbums = [];
let filteredAlbums = [];
let currentAlbumData = null;
let currentImageIndex = 0;
let currentFilter = { decade: 'all', category: 'all', year: 'all' };
let isLoggedIn = false;

// ==========================================
// INITIALISIERUNG
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    loadAlbums();
    initFilterButtons();
    initKeyboardShortcuts();
    initLoginModal();
});

// ==========================================
// ALBEN LADEN
// ==========================================

async function loadAlbums() {
    const loading = document.getElementById('loading');
    try {
        const response = await fetch('php/get-albums.php');
        const data = await response.json();

        if (data.success) {
            allAlbums = data.albums;
            filteredAlbums = allAlbums;
            isLoggedIn = data.isLoggedIn;

            updateAuthUI();
            populateYearFilter();
            renderAlbums();
        } else {
            showError('Fehler beim Laden der Alben');
        }
    } catch (error) {
        console.error('Fehler:', error);
        showError('Konnte Alben nicht laden');
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

// ==========================================
// AUTH UI
// ==========================================

function updateAuthUI() {
    const loginBtn = document.getElementById('galleryLoginBtn');
    const logoutBtn = document.getElementById('galleryLogoutBtn');
    const privateBadge = document.getElementById('privateBadge');

    if (loginBtn) loginBtn.style.display = isLoggedIn ? 'none' : 'inline-flex';
    if (logoutBtn) logoutBtn.style.display = isLoggedIn ? 'inline-flex' : 'none';
    if (privateBadge) privateBadge.style.display = isLoggedIn ? 'inline-flex' : 'none';
}

// ==========================================
// LOGIN MODAL
// ==========================================

function initLoginModal() {
    const modal = document.getElementById('loginModal');
    const form = document.getElementById('loginForm');
    const closeBtn = document.getElementById('loginModalClose');
    const loginBtn = document.getElementById('galleryLoginBtn');
    const logoutBtn = document.getElementById('galleryLogoutBtn');

    if (!modal) return;

    // Modal öffnen
    loginBtn?.addEventListener('click', () => {
        modal.classList.add('active');
        document.getElementById('loginPassword')?.focus();
    });

    // Modal schließen
    closeBtn?.addEventListener('click', closeLoginModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeLoginModal();
    });

    // Login absenden
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('loginPassword').value;
        const errorEl = document.getElementById('loginError');
        const submitBtn = form.querySelector('button[type="submit"]');

        submitBtn.disabled = true;
        submitBtn.textContent = 'Anmelden...';
        if (errorEl) errorEl.style.display = 'none';

        try {
            const formData = new FormData();
            formData.append('action', 'login');
            formData.append('password', password);

            const res = await fetch('php/auth.php', { method: 'POST', body: formData });
            const data = await res.json();

            if (data.success) {
                closeLoginModal();
                isLoggedIn = true;
                updateAuthUI();
                // Alben neu laden (jetzt mit privaten)
                await loadAlbums();
            } else {
                if (errorEl) {
                    errorEl.textContent = data.error || 'Falsches Passwort';
                    errorEl.style.display = 'block';
                }
                document.getElementById('loginPassword').value = '';
                document.getElementById('loginPassword').focus();
            }
        } catch (err) {
            if (errorEl) {
                errorEl.textContent = 'Verbindungsfehler. Bitte erneut versuchen.';
                errorEl.style.display = 'block';
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Anmelden';
        }
    });

    // Logout
    logoutBtn?.addEventListener('click', async () => {
        const formData = new FormData();
        formData.append('action', 'logout');
        await fetch('php/auth.php', { method: 'POST', body: formData });
        isLoggedIn = false;
        updateAuthUI();
        await loadAlbums();
    });
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.classList.remove('active');
    document.getElementById('loginPassword').value = '';
    const errorEl = document.getElementById('loginError');
    if (errorEl) errorEl.style.display = 'none';
}

// ==========================================
// JAHR-FILTER
// ==========================================

function populateYearFilter() {
    const yearContainer = document.querySelector('.year-scroll-container');
    if (!yearContainer) return;

    // Bestehende Jahr-Buttons entfernen (nicht "Alle")
    yearContainer.querySelectorAll('.year-btn:not([data-year="all"])').forEach(b => b.remove());

    const years = [...new Set(allAlbums.map(a => a.year))].sort((a, b) => b - a);

    years.forEach(year => {
        const btn = document.createElement('button');
        btn.className = 'year-btn';
        btn.setAttribute('data-year', year);
        btn.textContent = year;
        yearContainer.appendChild(btn);

        btn.addEventListener('click', () => {
            document.querySelectorAll('.year-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter.year = year.toString();
            applyFilters();
        });
    });

    const allBtn = document.querySelector('.year-btn[data-year="all"]');
    if (allBtn) {
        allBtn.addEventListener('click', () => {
            document.querySelectorAll('.year-btn').forEach(b => b.classList.remove('active'));
            allBtn.classList.add('active');
            currentFilter.year = 'all';
            applyFilters();
        });
    }
}

// ==========================================
// ALBEN RENDERN
// ==========================================

function renderAlbums() {
    const grid = document.getElementById('galerieGrid');
    const noImages = document.getElementById('noImages');
    const loading = document.getElementById('loading');

    grid.innerHTML = '';
    if (loading) loading.style.display = 'none';

    if (filteredAlbums.length === 0) {
        noImages.style.display = 'block';
        return;
    }
    noImages.style.display = 'none';

    filteredAlbums.forEach(album => {
        grid.appendChild(createAlbumCard(album));
    });

    // Hinweis für nicht eingeloggte: private Alben vorhanden?
    if (!isLoggedIn) {
        const hint = document.createElement('div');
        hint.className = 'private-hint';
        hint.innerHTML = `<span>🔒</span> <span>Weitere Alben für Mitglieder verfügbar – <button onclick="document.getElementById('galleryLoginBtn').click()">Jetzt anmelden</button></span>`;
        grid.appendChild(hint);
    }
}

function createAlbumCard(album) {
    const card = document.createElement('div');
    card.className = 'album-item' + (album.visibility === 'private' ? ' album-private' : '');
    card.setAttribute('data-decade', album.decade);
    card.setAttribute('data-category', album.category);
    card.setAttribute('data-year', album.year);
    card.onclick = () => openAlbum(album);

    const privateBadgeHtml = album.visibility === 'private'
        ? '<span class="album-private-badge">🔒 Mitglieder</span>'
        : '';

    card.innerHTML = `
        <img src="${album.coverImage}" alt="${album.title}" loading="lazy">
        <div class="album-overlay">
            <div class="album-info">
                ${privateBadgeHtml}
                <h3>${album.title}</h3>
                <p><span class="photo-count">${album.photoCount} Fotos</span></p>
            </div>
        </div>
    `;
    return card;
}

// ==========================================
// FILTER
// ==========================================

function initFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter.decade = btn.getAttribute('data-filter');
            applyFilters();
        });
    });

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter.category = btn.getAttribute('data-category');
            applyFilters();
        });
    });
}

function applyFilters() {
    filteredAlbums = allAlbums.filter(album => {
        const decadeMatch = currentFilter.decade === 'all' || album.decade === currentFilter.decade;
        const yearMatch = currentFilter.year === 'all' || album.year == currentFilter.year;
        const categoryMatch = currentFilter.category === 'all' || album.category === currentFilter.category;
        return decadeMatch && yearMatch && categoryMatch;
    });
    renderAlbums();
}

// ==========================================
// ALBUM ÖFFNEN / SCHLIEßEN
// ==========================================

function openAlbum(album) {
    currentAlbumData = album;
    document.querySelector('.galerie-section').style.display = 'none';
    const albumView = document.getElementById('albumView');
    albumView.style.display = 'block';
    document.getElementById('albumTitle').textContent = album.title;
    document.getElementById('albumCount').textContent = `${album.photoCount} Fotos`;

    const photosGrid = document.getElementById('albumPhotosGrid');
    photosGrid.innerHTML = '';
    album.photos.forEach((photo, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'album-photo-item';
        photoItem.onclick = () => openLightbox(index);
        const img = document.createElement('img');
        img.src = photo;
        img.alt = `${album.title} - Bild ${index + 1}`;
        img.loading = 'lazy';
        photoItem.appendChild(img);
        photosGrid.appendChild(photoItem);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeAlbum() {
    document.querySelector('.galerie-section').style.display = 'block';
    document.getElementById('albumView').style.display = 'none';
    currentAlbumData = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// LIGHTBOX
// ==========================================

function openLightbox(index) {
    if (!currentAlbumData) return;
    currentImageIndex = index;
    const lightbox = document.getElementById('lightbox');
    document.getElementById('lightboxImg').src = currentAlbumData.photos[currentImageIndex];
    document.getElementById('lightboxImg').alt = `${currentAlbumData.title} - Bild ${currentImageIndex + 1}`;
    document.getElementById('lightboxTitle').textContent = currentAlbumData.title;
    document.getElementById('lightboxDesc').textContent = `Bild ${currentImageIndex + 1} von ${currentAlbumData.photoCount}`;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = '';
}

function changeLightboxImage(direction) {
    if (!currentAlbumData) return;
    currentImageIndex = (currentImageIndex + direction + currentAlbumData.photos.length) % currentAlbumData.photos.length;
    document.getElementById('lightboxImg').src = currentAlbumData.photos[currentImageIndex];
    document.getElementById('lightboxDesc').textContent = `Bild ${currentImageIndex + 1} von ${currentAlbumData.photoCount}`;
}

// ==========================================
// KEYBOARD
// ==========================================

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        const lightbox = document.getElementById('lightbox');
        if (lightbox.classList.contains('active')) {
            if (e.key === 'Escape') closeLightbox();
            else if (e.key === 'ArrowLeft') changeLightboxImage(-1);
            else if (e.key === 'ArrowRight') changeLightboxImage(1);
        } else {
            const modal = document.getElementById('loginModal');
            if (modal?.classList.contains('active') && e.key === 'Escape') closeLoginModal();
        }
    });
}

document.getElementById('lightbox')?.addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') closeLightbox();
});

// ==========================================
// ERROR
// ==========================================

function showError(message) {
    document.getElementById('galerieGrid').innerHTML = `
        <div class="error-message">
            <p>⚠️ ${message}</p>
            <button onclick="location.reload()">Seite neu laden</button>
        </div>`;
}
