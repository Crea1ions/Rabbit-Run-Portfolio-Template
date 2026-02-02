(function() {
    'use strict';
    if (window.__GRF_PERF_CORE_INIT) return;
    window.__GRF_PERF_CORE_INIT = true;

    const html = document.documentElement;
    const subscribers = new Set();
    const slowNetworkTypes = ['slow-2g', '2g', '3g'];
    const MIN_FPS = 28;
    const RESTORE_FPS = 34;
    const SAMPLE_LIMIT = 180;
    const DEGRADE_DELAY = 300;
    const RESTORE_DELAY = 1500;
    const LOW_FPS_SUSTAIN_MS = 2000; // require sustained low FPS before degrading
    let degradeTimer = null;
    let restoreTimer = null;
    let lastFrame = performance.now();
    const frameSamples = [];
    let lowFpsAccum = 0;

    const state = {
        mode: html.dataset.perf || 'ok',
        reason: 'init'
    };

    html.dataset.perf = state.mode;

    function setMode(mode, reason) {
        reason = reason || 'unknown';
        if (state.mode === mode) {
            state.reason = reason;
            return;
        }

        state.mode = mode;
        state.reason = reason;
        html.dataset.perf = mode;
        if (degradeTimer) {
            clearTimeout(degradeTimer);
            degradeTimer = null;
        }
        if (restoreTimer) {
            clearTimeout(restoreTimer);
            restoreTimer = null;
        }

        console.info(`[PERF] mode ${mode} (${reason})`);
        const event = new CustomEvent('perf:modeChange', {
            detail: { mode, reason }
        });
        window.dispatchEvent(event);
        subscribers.forEach(fn => {
            try {
                fn(mode, { mode, reason });
            } catch (err) {
                console.warn('perf subscriber error', err);
            }
        });
    }

    function scheduleDegrade(reason) {
        if (state.mode === 'degraded' || degradeTimer) return;
        if (restoreTimer) {
            clearTimeout(restoreTimer);
            restoreTimer = null;
        }
        degradeTimer = setTimeout(() => {
            degradeTimer = null;
            setMode('degraded', reason);
        }, DEGRADE_DELAY);
    }

    function scheduleRestore(reason) {
        if (state.mode !== 'degraded' || restoreTimer) return;
        if (degradeTimer) {
            clearTimeout(degradeTimer);
            degradeTimer = null;
        }
        restoreTimer = setTimeout(() => {
            restoreTimer = null;
            setMode('ok', reason);
        }, RESTORE_DELAY);
    }

    function evaluateFps(fps) {
        if (!Number.isFinite(fps)) return;
        // Only schedule restores here — degradations are triggered
        // when low FPS persists over a sustained period (see trackFrame).
        if (fps >= RESTORE_FPS) {
            scheduleRestore('fps-ok');
        }
    }

    function trackFrame(now) {
        if (document.hidden) {
            lastFrame = now;
            requestAnimationFrame(trackFrame);
            return;
        }

        const delta = now - lastFrame;
        lastFrame = now;
        frameSamples.push(delta);
        if (frameSamples.length > SAMPLE_LIMIT) {
            frameSamples.shift();
        }

        if (frameSamples.length >= 30) {
            const avg = frameSamples.reduce((sum, value) => sum + value, 0) / frameSamples.length;
            const fps = 1000 / avg;
            // If FPS drops below threshold, accumulate time spent in low-FPS
            if (fps < MIN_FPS) {
                lowFpsAccum += delta;
                if (lowFpsAccum >= LOW_FPS_SUSTAIN_MS) {
                    lowFpsAccum = 0;
                    scheduleDegrade('low-fps-sustained');
                }
            } else {
                lowFpsAccum = 0;
            }

            evaluateFps(fps);
        }

        requestAnimationFrame(trackFrame);
    }

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
        const label = connection.effectiveType || 'unknown';
        if (connection.saveData || slowNetworkTypes.includes(label)) {
            setMode('degraded', `connection:${label}`);
        }
    }

    const navEntries = performance.getEntriesByType('navigation');
    const navTiming = navEntries && navEntries[0];
    let loadTime = 0;

    if (navTiming && Number.isFinite(navTiming.domContentLoadedEventEnd)) {
        loadTime = navTiming.domContentLoadedEventEnd;
    } else if (performance.timing && performance.timing.domContentLoadedEventEnd) {
        loadTime = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
    }

    if (loadTime > 2400) {
        setMode('degraded', 'slow-dom');
    }

    const perfApi = {
        get mode() {
            return state.mode;
        },
        get reason() {
            return state.reason;
        },
        isDegraded() {
            return state.mode === 'degraded';
        },
        setMode,
        subscribe(fn) {
            if (typeof fn !== 'function') return () => {};
            subscribers.add(fn);
            return () => subscribers.delete(fn);
        }
    };

    window.__GRF_PERF_STATUS = perfApi;

    document.addEventListener('visibilitychange', () => {
        lastFrame = performance.now();
        frameSamples.length = 0;
        if (document.hidden) {
            if (degradeTimer) {
                clearTimeout(degradeTimer);
                degradeTimer = null;
            }
            if (restoreTimer) {
                clearTimeout(restoreTimer);
                restoreTimer = null;
            }
        }
    });

    requestAnimationFrame(trackFrame);
})();