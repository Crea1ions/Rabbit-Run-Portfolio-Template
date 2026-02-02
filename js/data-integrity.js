(function () {
    'use strict';
    if (window.__GRF_DATA_INTEGRITY_INIT) return;
    window.__GRF_DATA_INTEGRITY_INIT = true;

    const perfStatus = window.__GRF_PERF_STATUS;
    // 'dimensions' was removed from the data model during cleanup; keep validation aligned
    const requiredFields = ['id', 'title', 'technique', 'year', 'image'];
    const metadata = window.__ARTWORKS_METADATA || { source: 'artworks.json' };
    const context = {
        lastValidation: null,
        version: window.__ARTWORKS_VERSION || null,
        metadata,
        validateArtworks,
        revalidate
    };

    window.__GRF_DATA_INTEGRITY = context;

    function validateArtworks(payload) {
        const errors = [];
        const seen = new Set();
        const safeList = Array.isArray(payload) ? payload : [];

        if (!Array.isArray(payload)) {
            errors.push('Les œuvres doivent être un tableau.');
        }

        safeList.forEach((item, index) => {
            if (typeof item !== 'object' || item === null) {
                errors.push(`Entrée ${index} invalide.`);
                return;
            }

            requiredFields.forEach(field => {
                if (!item[field]) {
                    errors.push(`Œuvre ${item.id || index} : champ manquant ${field}.`);
                }
            });

            if (item.id) {
                if (seen.has(item.id)) {
                    errors.push(`Œuvre ${item.id} dupliquée.`);
                }
                seen.add(item.id);
            }
        });

        const valid = errors.length === 0;
        return {
            valid,
            errors,
            payload: safeList,
            version: window.__ARTWORKS_VERSION || 'unknown'
        };
    }

    function revalidate() {
        const result = validateArtworks(window.__ARTWORKS__);
        context.lastValidation = {
            timestamp: Date.now(),
            status: result.valid ? 'valid' : 'invalid',
            errors: result.errors.slice(0, 5)
        };

        if (!result.valid) {
            const reason = result.errors[0] || 'data-integrity';
            perfStatus?.setMode('degraded', `data-integrity`);
            console.warn('[DATA INTEGRITY]', reason, result.errors);
        }

        return result;
    }

    function whenArtworksReady(callback) {
        if (Array.isArray(window.__ARTWORKS__)) {
            callback();
            return;
        }

        const listener = () => {
            window.removeEventListener('artworks:ready', listener);
            callback();
        };

        window.addEventListener('artworks:ready', listener);
    }

    document.addEventListener('resilience:data:validate', () => whenArtworksReady(revalidate));
    whenArtworksReady(revalidate);
})();
