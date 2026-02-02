(function () {
    'use strict';
    if (window.__GRF_USER_METRICS_INIT) return;
    window.__GRF_USER_METRICS_INIT = true;

    const STORAGE_KEY = 'grf-resilience-metrics';
    const DASHBOARD_KEY = 'grf-resilience-dashboard';
    const MAX_EVENTS = 60;
    const MAX_SESSIONS = 20;
    const perfStatus = window.__GRF_PERF_STATUS;
    const heartbeat = window.__GRF_HEARTBEAT;
    const defaultMetrics = {
        events: [],
        sessions: [],
        heartbeat: {
            lastTick: null,
            drift: null
        }
    };

    let degradeStart = null;
    let metrics = loadMetrics();

    function loadMetrics() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (err) {
            console.warn('metrics load failed', err);
        }
        return JSON.parse(JSON.stringify(defaultMetrics));
    }

    function persistMetrics() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
        } catch (err) {
            console.warn('metrics save failed', err);
        }
    }

    function record(type, detail) {
        const entry = {
            type,
            detail: detail || {},
            timestamp: new Date().toISOString()
        };
        metrics.events.unshift(entry);
        metrics.events = metrics.events.slice(0, MAX_EVENTS);
        persistMetrics();
        return entry;
    }

    function recordPerfEvent(mode, payload) {
        record(`perf:${mode}`, payload);
        if (mode === 'degraded') {
            degradeStart = Date.now();
            metrics.sessions.unshift({
                reason: payload?.reason || 'unknown',
                start: new Date(degradeStart).toISOString(),
                end: null,
                durationMs: null
            });
            metrics.sessions = metrics.sessions.slice(0, MAX_SESSIONS);
            persistMetrics();
        } else if (mode === 'ok' && degradeStart) {
            const duration = Date.now() - degradeStart;
            const session = metrics.sessions[0];
            if (session && !session.end) {
                session.end = new Date().toISOString();
                session.durationMs = Math.round(duration);
            }
            degradeStart = null;
            record('perf:recovery', { durationMs: Math.round(duration) });
            persistMetrics();
        }
    }

    function handleHeartbeat(signal) {
        metrics.heartbeat.lastTick = signal.timestamp;
        metrics.heartbeat.drift = signal.drift;
        record('heartbeat:tick', {
            drift: signal.drift,
            online: signal.online
        });
    }

    function getSummary() {
        const degradeCount = metrics.sessions.length;
        const recoveries = metrics.sessions.filter(s => s.durationMs != null);
        const average = recoveries.length
            ? Math.round(recoveries.reduce((sum, s) => sum + s.durationMs, 0) / recoveries.length)
            : 0;
        return {
            degradeCount,
            averageRecovery: average,
            lastRecovery: recoveries[0] || null,
            lastHeartbeat: metrics.heartbeat.lastTick,
            events: metrics.events.slice(0, 10)
        };
    }

    function resetMetrics() {
        metrics = JSON.parse(JSON.stringify(defaultMetrics));
        persistMetrics();
    }

    function isDashboardOptedIn() {
        try {
            return localStorage.getItem(DASHBOARD_KEY) === 'enabled';
        } catch (err) {
            return false;
        }
    }

    function optInDashboard() {
        try {
            localStorage.setItem(DASHBOARD_KEY, 'enabled');
        } catch (err) {
            console.warn('dashboard opt-in failed', err);
        }
    }

    function optOutDashboard() {
        try {
            localStorage.removeItem(DASHBOARD_KEY);
        } catch (err) {
            console.warn('dashboard opt-out failed', err);
        }
    }

    if (perfStatus && typeof perfStatus.subscribe === 'function') {
        perfStatus.subscribe((mode, detail) => {
            recordPerfEvent(mode, detail || {});
        });
    }

    if (heartbeat && typeof heartbeat.subscribe === 'function') {
        heartbeat.subscribe(handleHeartbeat);
    }

    window.__GRF_USER_METRICS = {
        record,
        getSummary,
        getEvents() {
            return metrics.events.slice();
        },
        getSessions() {
            return metrics.sessions.slice();
        },
        reset: resetMetrics,
        isDashboardOptedIn,
        optInDashboard,
        optOutDashboard,
        storageKey: STORAGE_KEY
    };
})();
