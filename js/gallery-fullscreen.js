const perfStatus = window.__GRF_PERF_STATUS;
const hasPerfGuard = perfStatus && typeof perfStatus.isDegraded === 'function';
let isPerfDegraded = hasPerfGuard ? perfStatus.isDegraded() : (perfStatus && perfStatus.mode === 'degraded');
const perfFallbackMessage = 'Mode économie d’énergie : la galerie est désactivée.';
let perfSubscription = null;

(function () {
    document.addEventListener('DOMContentLoaded', function () {
        const grid = document.getElementById('galleryGridFullscreen');
        if (!grid) return;

        const lightbox = document.getElementById('fullscreenLightbox');
        const lightboxImage = document.getElementById('lightboxImageFullscreen');
        const lightboxClose = document.getElementById('lightboxCloseFullscreen');
        const lightboxPrev = document.getElementById('lightboxPrev');
        const lightboxNext = document.getElementById('lightboxNext');
        const imageCounter = document.getElementById('imageCounter');

        const technique = document.body.dataset.technique;
        let artworks = [];
        let currentIndex = 0;
        let lastFocused = null;

        const basePath = 'assets/images/oeuvres/';

        function showFallback(message) {
            grid.innerHTML = `<div class="loading">${message}</div>`;
        }

        function resolvePath(path) {
            if (!path) return '';
            if (path.startsWith('assets/') || path.startsWith('http') || path.startsWith('/')) {
                return path;
            }
            return basePath + path;
        }

        function renderArtworks() {
            grid.innerHTML = '';
            if (!artworks.length) {
                showFallback('Aucune œuvre disponible pour le moment.');
                return;
            }

            grid.classList.toggle('single-artwork', artworks.length === 1);

            artworks.forEach((artwork, index) => {
                const card = document.createElement('div');
                card.className = 'artwork-card-fullscreen';
                card.innerHTML = `
                    <img src="${resolvePath(artwork.thumbnail)}"
                         alt="${artwork.title}"
                         class="artwork-image-fullscreen"
                         loading="lazy">
                    <div class="artwork-overlay">
                        <h3>${artwork.title}</h3>
                        ${artwork.subtitle ? `<p class="artwork-subtitle-fullscreen">${artwork.subtitle}</p>` : ''}
                    </div>
                `;
                card.addEventListener('click', () => openLightbox(index));
                grid.appendChild(card);
            });
        }

        function updateLightbox() {
            const artwork = artworks[currentIndex];
            if (!artwork) return;
            lightboxImage.src = resolvePath(artwork.image);
            lightboxImage.alt = artwork.title || 'Œuvre';
            if (imageCounter) {
                imageCounter.textContent = `${currentIndex + 1} / ${artworks.length}`;
            }

            const multiple = artworks.length > 1;
            if (lightboxPrev) lightboxPrev.style.display = multiple ? 'flex' : 'none';
            if (lightboxNext) lightboxNext.style.display = multiple ? 'flex' : 'none';
        }

        function openLightbox(index) {
            if (!lightbox) return;
            currentIndex = index;
            updateLightbox();
            lightbox.classList.add('active');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            lastFocused = document.activeElement;
            if (lightboxClose) lightboxClose.focus();
        }

        function closeLightbox() {
            if (!lightbox) return;
            lightbox.classList.remove('active');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = 'auto';
            if (lastFocused && typeof lastFocused.focus === 'function') {
                lastFocused.focus();
            }
        }

        function navigate(delta) {
            if (artworks.length <= 1) return;
            currentIndex = (currentIndex + delta + artworks.length) % artworks.length;
            updateLightbox();
        }

        lightboxClose?.addEventListener('click', closeLightbox);
        lightboxPrev?.addEventListener('click', () => navigate(-1));
        lightboxNext?.addEventListener('click', () => navigate(1));

        lightbox?.addEventListener('click', (event) => {
            if (event.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (!lightbox || !lightbox.classList.contains('active')) return;
            if (event.key === 'Escape') {
                closeLightbox();
            } else if (event.key === 'ArrowLeft') {
                navigate(-1);
            } else if (event.key === 'ArrowRight') {
                navigate(1);
            }
        });

        async function fetchArtworks() {
            if (window.location.protocol === 'file:' && Array.isArray(window.__ARTWORKS__)) {
                return window.__ARTWORKS__;
            }
            return await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', 'artworks.json', true);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200 || xhr.status === 0) {
                            try {
                                resolve(JSON.parse(xhr.responseText));
                            } catch (e) {
                                reject(new Error('Erreur de parsing JSON'));
                            }
                        } else {
                            reject(new Error(`Erreur HTTP: ${xhr.status}`));
                        }
                    }
                };
                xhr.onerror = () => reject(new Error('Erreur réseau'));
                xhr.send();
            });
        }

        async function hydrateAndRender() {
            if (isPerfDegraded) {
                showFallback(perfFallbackMessage);
                return;
            }

            try {
                const data = await fetchArtworks();
                const all = Array.isArray(data) ? data : [];
                artworks = technique ? all.filter(item => item.technique === technique) : all;
                renderArtworks();
            } catch (error) {
                if (Array.isArray(window.__ARTWORKS__)) {
                    const all = window.__ARTWORKS__;
                    artworks = technique ? all.filter(item => item.technique === technique) : all;
                    renderArtworks();
                    return;
                }
                console.warn('Galerie plein écran : fallback activé', error);
                showFallback('Aucune œuvre disponible pour le moment.');
            }
        }

        function enterPerformanceFallback() {
            if (isPerfDegraded) {
                showFallback(perfFallbackMessage);
                return;
            }
            isPerfDegraded = true;
            showFallback(perfFallbackMessage);
        }

        function exitPerformanceFallback() {
            if (!isPerfDegraded) return;
            isPerfDegraded = false;
            hydrateAndRender().catch(() => enterPerformanceFallback());
        }

        function handlePerfModeChange(mode) {
            if (mode === 'degraded') {
                enterPerformanceFallback();
            } else {
                exitPerformanceFallback();
            }
        }

        function bootstrap() {
            if (isPerfDegraded) {
                enterPerformanceFallback();
                return;
            }

            hydrateAndRender().catch(() => enterPerformanceFallback());

            if (hasPerfGuard && typeof perfStatus.subscribe === 'function' && !perfSubscription) {
                perfSubscription = perfStatus.subscribe(handlePerfModeChange);
            }
        }

        bootstrap();

        window.addEventListener('beforeunload', function () {
            if (typeof perfSubscription === 'function') {
                perfSubscription();
            }
        });
    });
})();
