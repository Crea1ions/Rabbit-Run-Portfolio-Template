(function () {
    const perfStatus = window.__GRF_PERF_STATUS;
    const integrity = window.__GRF_DATA_INTEGRITY;
    const userMetrics = window.__GRF_USER_METRICS;

    function publishGalleryEvent(type, detail) {
        if (!userMetrics || typeof userMetrics.record !== 'function') return;
        userMetrics.record(type, detail);
    }

    // Liste d'assets de secours présents dans le dossier `assets/`
    const FALLBACK_ASSETS = [
        'assets/Lapin-Piskel-1.png',
        'assets/Lapin-Piskel-2.gif',
        'assets/Lapin-Piskel-3.gif',
        'assets/Lapin-Piskel-4.jpg',
        'assets/Lapin-Piskel-5.jpg',
        'assets/Lapin-Piskel-6.jpg'
    ];

    function resolveArtworkPath(imagePath) {
        // Première tentative : chemin prévu dans le JSON (sous assets/images/oeuvres/)
        const primary = `assets/images/oeuvres/${imagePath}`;
        // Deuxième tentative : image directement sous assets/ (cas où l'utilisateur a déposé ses images là)
        const fallbackCandidate = `assets/${imagePath.split('/').pop()}`;
        // Retourne un object avec primary et fallback (le fallback peut être une liste)
        const fallbacks = [fallbackCandidate].concat(FALLBACK_ASSETS);
        return { primary, fallbacks };
    }

    document.addEventListener('DOMContentLoaded', function () {
        const grid = document.getElementById('galleryGrid');
        const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
        const lightbox = document.getElementById('lightbox');
        const lightboxClose = document.getElementById('lightboxClose');
        const isDegraded = perfStatus && typeof perfStatus.isDegraded === 'function'
            ? perfStatus.isDegraded()
            : false;

        if (!grid) {
            return;
        }

        let artworks = [];
        let currentFilter = 'all';
        let perfSubscription = null;
        let hasInitialized = false;
        let isLocked = false;
        let currentIndex = 0;
        let currentFiltered = [];
        let lastFocused = null;
        const isHomepage = document.body.classList.contains('index-page');

        // Smart lazy-loading manager: preload images near viewport and cancel loads
        const pendingLoads = new Map(); // imgEl -> { onLoad, onError }
        const loadQueue = [];
        let activeLoads = 0;
        const MAX_CONCURRENT_LOADS = 6;
        const OBSERVER_ROOT_MARGIN = '600px 0px 600px 0px';
        // simple instrumentation
        const imageStats = { started: 0, cancelled: 0, errors: 0, completed: 0 };

        function processQueue() {
            while (activeLoads < MAX_CONCURRENT_LOADS && loadQueue.length) {
                const img = loadQueue.shift();
                startLoad(img);
            }
        }

        function startLoad(img) {
            if (!img || img.dataset.loaded === 'true' || pendingLoads.has(img)) return;
            const primary = img.dataset.srcPrimary || img.dataset.src || '';
            const fallbacks = (img.dataset.srcFallbacks && img.dataset.srcFallbacks.length)
                ? JSON.parse(img.dataset.srcFallbacks)
                : [];
            if (!primary && !fallbacks.length) return;
            let src = primary || (fallbacks.length ? fallbacks[0] : '');
            activeLoads += 1;
            const onLoad = () => {
                img.dataset.loaded = 'true';
                imageStats.completed += 1;
                cleanup();
            };
            const onError = () => {
                // Try fallbacks in order before using generic placeholder
                imageStats.errors += 1;
                const tried = parseInt(img.dataset._fbIndex || '0', 10);
                if (fallbacks && fallbacks.length && tried < fallbacks.length) {
                    img.dataset._fbIndex = String(tried + 1);
                    img.src = fallbacks[tried];
                    return; // don't cleanup yet
                }
                img.dataset.loaded = 'true';
                img.dataset.error = 'true';
                try {
                    img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23888" font-size="16">Image&nbsp;manquante</text></svg>';
                } catch (e) {}
                cleanup();
            };

            function cleanup() {
                img.removeEventListener('load', onLoad);
                img.removeEventListener('error', onError);
                pendingLoads.delete(img);
                activeLoads = Math.max(0, activeLoads - 1);
                try { observer.unobserve(img); } catch (e) {}
                processQueue();
            }

            img.addEventListener('load', onLoad);
            img.addEventListener('error', onError);
            img.decoding = 'async';
            // Kick off load by assigning src
            img.src = src;
            pendingLoads.set(img, { onLoad, onError });
            imageStats.started += 1;
        }

        function scheduleLoad(img) {
            if (img.dataset.loaded === 'true') return;
            if (activeLoads < MAX_CONCURRENT_LOADS) {
                startLoad(img);
            } else if (!loadQueue.includes(img)) {
                loadQueue.push(img);
            }
        }

        function cancelLoad(img) {
            if (!img) return;
            // If queued, remove from queue
            const qi = loadQueue.indexOf(img);
            if (qi !== -1) {
                loadQueue.splice(qi, 1);
                imageStats.cancelled += 1;
                return;
            }
            // If currently loading, abort by clearing src and removing listeners
            if (pendingLoads.has(img)) {
                const { onLoad, onError } = pendingLoads.get(img);
                img.removeEventListener('load', onLoad);
                img.removeEventListener('error', onError);
                try { img.src = ''; } catch (e) {}
                pendingLoads.delete(img);
                activeLoads = Math.max(0, activeLoads - 1);
                imageStats.cancelled += 1;
                processQueue();
            }
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const img = entry.target;
                if (entry.isIntersecting) {
                    scheduleLoad(img);
                } else {
                    cancelLoad(img);
                }
            });
        }, { root: null, rootMargin: OBSERVER_ROOT_MARGIN, threshold: 0.01 });

        // expose a debugging helper
        window.__GRF_IMAGE_STATS = function() {
            try { console.table(imageStats); } catch (e) { console.log('imageStats', imageStats); }
            return Object.assign({}, imageStats);
        };

        // Periodic debug log when debugging is enabled via global flag
        if (window.__GRF_DEBUG_IMAGES) {
            setInterval(() => {
                console.debug('Image stats:', imageStats, 'pendingLoads=', pendingLoads.size, 'activeLoads=', activeLoads, 'queue=', loadQueue.length);
            }, 2000);
        }

        function disableFilters(disabled) {
            filterBtns.forEach(btn => {
                btn.disabled = disabled;
                if (disabled) {
                    btn.classList.remove('active');
                }
            });
        }

        function closeLightbox() {
            if (!lightbox) return;
            if (lightbox.classList.contains('active')) {
                lightbox.classList.remove('active');
                lightbox.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = 'auto';
                if (lastFocused && typeof lastFocused.focus === 'function') {
                    lastFocused.focus();
                }
            }
        }

        function showFallback(message, withSpinner = false) {
            if (!grid) return;
            if (withSpinner) {
                grid.innerHTML = `
                    <div class="loading-indicator" role="status" aria-live="polite">
                        <span class="spinner" aria-hidden="true"></span>
                        <span class="sr-only">${message}</span>
                    </div>
                `;
            } else {
                grid.innerHTML = `<p class="loading-text">${message}</p>`;
            }
        }

        function applyHomepageMask(list) {
            if (!isHomepage) return list;
            return list.filter(artwork => !artwork.homepageExclude);
        }

        function renderArtworks(filter = 'all') {
            if (!grid) return;
            grid.innerHTML = '';
            const filtered = filter === 'all'
                ? artworks
                : artworks.filter(artwork => artwork.technique === filter);

            const visibleArtworks = applyHomepageMask(filtered);

            currentFiltered = visibleArtworks;

            if (visibleArtworks.length === 0) {
                showFallback('Aucune œuvre disponible pour le moment.', false);
                return;
            }

            visibleArtworks.forEach((artwork, index) => {
                const card = document.createElement('div');
                card.className = 'artwork-card';
                // Use data-src to delay assignment of src until requested by observer
                card.innerHTML = `
                    <img data-src="" 
                         alt="${artwork.title}"
                         class="artwork-image lazy"
                         src="">
                    <div class="artwork-info">
                        <h3 class="artwork-title">${artwork.title}</h3>
                        ${artwork.subtitle ? `<p class="artwork-subtitle">${artwork.subtitle}</p>` : ''}
                    </div>
                `;
                card.addEventListener('click', () => openLightbox(index));
                grid.appendChild(card);
                const imgEl = card.querySelector('img[data-src]');
                if (imgEl) {
                    // Resolve candidate paths and attach fallback list
                    const resolved = resolveArtworkPath(artwork.image);
                    imgEl.dataset.srcPrimary = resolved.primary;
                    imgEl.dataset.srcFallbacks = JSON.stringify(resolved.fallbacks);
                    observer.observe(imgEl);
                }
            });
        }

        function openLightbox(index) {
            if (!lightbox || isLocked) return;
            currentIndex = index;
            const artwork = currentFiltered[currentIndex];
            if (!artwork) return;
            const imageEl = document.getElementById('lightboxImage');
            // Attach resilient handlers to avoid retries on corrupt images
            if (imageEl) {
                const onLbLoad = () => {
                    imageEl.dataset.loaded = 'true';
                    imageEl.removeEventListener('load', onLbLoad);
                    imageEl.removeEventListener('error', onLbError);
                };
                const onLbError = () => {
                    try {
                        imageEl.dataset.error = 'true';
                        imageEl.dataset.loaded = 'true';
                        imageEl.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="%23eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23888" font-size="20">Image%20manquante</text></svg>';
                    } catch (e) {}
                    imageStats.errors += 1;
                    imageEl.removeEventListener('load', onLbLoad);
                    imageEl.removeEventListener('error', onLbError);
                };
                imageEl.addEventListener('load', onLbLoad);
                imageEl.addEventListener('error', onLbError);
            }
            imageEl.src = `assets/images/oeuvres/${artwork.image}`;
            imageEl.alt = artwork.title || 'Œuvre';
            document.getElementById('lightboxTitle').textContent = artwork.title;
            // Only show the user-provided subtitle here (legacy dimensions/description removed)
            document.getElementById('lightboxDetails').textContent = artwork.subtitle || '';
            document.getElementById('lightboxDescription').textContent = '';
            lightbox.classList.add('active');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            lastFocused = document.activeElement;
            lightboxClose?.focus();
        }

        function navigateLightbox(delta) {
            if (!currentFiltered.length || !lightbox?.classList.contains('active')) return;
            currentIndex = (currentIndex + delta + currentFiltered.length) % currentFiltered.length;
            const artwork = currentFiltered[currentIndex];
            if (!artwork) return;
            const imageEl = document.getElementById('lightboxImage');
            if (imageEl) {
                imageEl.dataset.loaded = '';
                imageEl.dataset.error = '';
                const onLbLoad = () => {
                    imageEl.dataset.loaded = 'true';
                    imageEl.removeEventListener('load', onLbLoad);
                    imageEl.removeEventListener('error', onLbError);
                };
                const onLbError = () => {
                    try { imageEl.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="%23eee"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23888" font-size="20">Image%20manquante</text></svg>'; } catch (e) {}
                    imageStats.errors += 1;
                    imageEl.dataset.error = 'true';
                    imageEl.dataset.loaded = 'true';
                    imageEl.removeEventListener('load', onLbLoad);
                    imageEl.removeEventListener('error', onLbError);
                };
                imageEl.addEventListener('load', onLbLoad);
                imageEl.addEventListener('error', onLbError);
            }
            imageEl.src = `assets/images/oeuvres/${artwork.image}`;
            imageEl.alt = artwork.title || 'Œuvre';
            document.getElementById('lightboxTitle').textContent = artwork.title;
            document.getElementById('lightboxDetails').textContent = artwork.subtitle || '';
            document.getElementById('lightboxDescription').textContent = '';
        }

        lightboxClose?.addEventListener('click', () => {
            closeLightbox();
        });

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
                navigateLightbox(-1);
            } else if (event.key === 'ArrowRight') {
                navigateLightbox(1);
            }
        });

        filterBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                if (btn.disabled || isLocked) {
                    return;
                }
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter || 'all';
                renderArtworks(currentFilter);
            });
        });

        async function hydrateArtworks() {
            try {
                const data = await fetchArtworks();
                const validation = integrity
                    ? integrity.validateArtworks(data)
                    : {
                        valid: Array.isArray(data),
                        payload: Array.isArray(data) ? data : [],
                        version: window.__ARTWORKS_VERSION || 'unknown'
                    };
                publishGalleryEvent('gallery:data-validation', {
                    valid: validation.valid,
                    version: validation.version
                });
                if (!validation.valid) {
                    showFallback('Données corrompues — tentez un rechargement.', false);
                    throw new Error('Validation des données échouée');
                }
                artworks = validation.payload;
                if (!artworks.length) {
                    showFallback('Aucune œuvre disponible pour le moment.', false);
                    return;
                }
                publishGalleryEvent('gallery:data-ready', {
                    count: artworks.length,
                    version: validation.version
                });
            } catch (error) {
                publishGalleryEvent('gallery:data-error', { message: error.message });
                console.warn('Galerie : fallback activé', error);
                throw error;
            }
        }

        async function initializeGallery() {
            if (isLocked) {
                showFallback('Mode économie d’énergie activé — galerie réduite.', true);
                return;
            }

            if (!artworks.length) {
                await hydrateArtworks();
            }

            renderArtworks(currentFilter);
            hasInitialized = true;
        }

        function enterDegradedMode(reason = 'unknown') {
            isLocked = true;
            disableFilters(true);
            closeLightbox();
            showFallback('Mode économie d’énergie : la galerie est désactivée.', true);
            publishGalleryEvent('gallery:degraded', { reason });
        }

        function exitDegradedMode() {
            if (!isLocked) return;
            isLocked = false;
            disableFilters(false);
            if (hasInitialized && artworks.length) {
                renderArtworks(currentFilter);
            } else {
                initializeGallery().catch(() => enterDegradedMode());
            }
            publishGalleryEvent('gallery:recovered', { filter: currentFilter });
        }

        function handlePerfModeChange(mode, payload = {}) {
            const reason = payload.reason || 'perf-mode';
            publishGalleryEvent('gallery:perf-mode-change', { mode, reason });
            if (mode === 'degraded') {
                enterDegradedMode(reason);
            } else {
                exitDegradedMode();
            }
        }

        function bootstrap() {
            if (isDegraded) {
                enterDegradedMode();
                showFallback('Mode économie d’énergie activé — galerie réduite.', true);
                return;
            }

            initializeGallery().catch(() => enterDegradedMode('init-error'));

            if (perfStatus && typeof perfStatus.subscribe === 'function') {
                perfSubscription = perfStatus.subscribe(handlePerfModeChange);
            }
            showFallback('Mode économie d’énergie : la galerie est désactivée.', true);
            publishGalleryEvent('gallery:bootstrap', { degraded: isDegraded });
        }

        bootstrap();
    });

    async function fetchArtworks() {
        if (window.location.protocol === 'file:' && Array.isArray(window.__ARTWORKS__)) {
            return window.__ARTWORKS__;
        }
        try {
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
        } catch (error) {
            console.error('Erreur de chargement des œuvres:', error);
            if (Array.isArray(window.__ARTWORKS__)) {
                return window.__ARTWORKS__;
            }
            return [];
        }
    }

    function formatDimensions(dimensions) {
        if (!dimensions || dimensions === 'Non spécifiée') {
            return 'Dimensions non spécifiées';
        }
        return dimensions;
    }

    function formatTechnique(technique) {
        const techniques = {
            brou_de_noix: 'Brou de noix',
            fusain: 'Fusain',
            pastel_a_huile: 'Pastel à l\'huile'
        };
        return techniques[technique] || technique;
    }

    function formatAvailability(availability) {
        if (!availability) return '';
        return ` • ${availability}`;
    }
})();
