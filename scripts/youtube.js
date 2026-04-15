// youtube.js – lädt Videos über PHP-Proxy (API Key bleibt serverseitig)
// Wird nur aufgerufen wenn Cookie-Einwilligung für "youtube" vorliegt (via cookies.js)

const MAX_RESULTS = 2;

async function loadYouTubeVideos() {
    const container = document.getElementById('youtube-videos');
    if (!container) return;

    // Consent-Hint ausblenden, Skeleton zeigen
    container.innerHTML = `
        <div class="yt-skeleton">
            <div class="yt-skeleton-card"><div class="yt-skeleton-thumb"></div><div class="yt-skeleton-title"></div><div class="yt-skeleton-date"></div></div>
            <div class="yt-skeleton-card"><div class="yt-skeleton-thumb"></div><div class="yt-skeleton-title"></div><div class="yt-skeleton-date"></div></div>
        </div>`;

    try {
        const response = await fetch('/php/youtube-proxy.php');
        if (!response.ok) throw new Error('Proxy-Fehler');

        const data = await response.json();
        if (!data.items || data.items.length === 0) {
            container.innerHTML = '<div class="error-message">Keine Videos gefunden.</div>';
            return;
        }

        displayVideos(data.items.slice(0, MAX_RESULTS));

    } catch (error) {
        console.error('YouTube Fehler:', error);
        container.innerHTML = '<div class="error-message">Videos konnten nicht geladen werden.</div>';
    }
}

function displayVideos(videos) {
    const container = document.getElementById('youtube-videos');
    container.innerHTML = '';

    videos.forEach(video => {
        const videoId = video.id.videoId;
        const title = video.snippet.title;
        const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        const publishedDate = formatDate(new Date(video.snippet.publishedAt));

        container.innerHTML += `
            <div class="video-card" onclick="openVideo('${videoId}')">
                <div class="video-thumbnail">
                    <img src="${thumbnail}" alt="${title}">
                    <div class="video-play-overlay"></div>
                </div>
                <div class="video-info">
                    <h3 class="video-title">${title}</h3>
                    <div class="video-meta">
                        <span class="video-date">${publishedDate}</span>
                    </div>
                </div>
            </div>`;
    });
}

function openVideo(videoId) {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
}

function formatDate(date) {
    const diffDays = Math.floor((Date.now() - date) / 86400000);
    if (diffDays === 0) return 'Heute';
    if (diffDays === 1) return 'Gestern';
    if (diffDays < 7)   return `vor ${diffDays} Tagen`;
    if (diffDays < 30)  return `vor ${Math.floor(diffDays / 7)} Wochen`;
    if (diffDays < 365) return `vor ${Math.floor(diffDays / 30)} Monaten`;
    return `vor ${Math.floor(diffDays / 365)} Jahren`;
}
// Kein DOMContentLoaded – wird durch DFC_Cookies.init() getriggert
