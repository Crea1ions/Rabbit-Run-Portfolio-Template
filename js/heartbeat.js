(function () {
    'use strict';
    if (window.__GRF_HEARTBEAT_INIT) return;
    window.__GRF_HEARTBEAT_INIT = true;

    const perfStatus = window.__GRF_PERF_STATUS;
    const subscribers = new Set();
    const root = document.documentElement;
    const INTERVAL = 2000;
    const BLOCK_THRESHOLD = 1200;
    const BLOCK_CONSECUTIVE_REQUIRED = 2; // require consecutive blocks before degrading
    const GOOD_CONSECUTIVE_REQUIRED = 2; // require consecutive good ticks before restoring
    const OFFLINE_THRESHOLD = 4000;
    let lastTick = performance.now();
    let offlineSince = null;
    let blockConsecutive = 0;
    let goodConsecutive = 0;

    function notify(payload) {
        subscribers.forEach(fn => {
            try {
                fn(payload);
            } catch (err) {
                console.warn('heartbeat subscriber error', err);
            }
        });
    }

    function degrade(reason) {
        if (!perfStatus) return;
        perfStatus.setMode('degraded', `heartbeat:${reason}`);
    }

    function restore(reason) {
        if (!perfStatus || !perfStatus.isDegraded()) return;
        if (perfStatus.reason && !perfStatus.reason.startsWith('heartbeat:')) return;
        perfStatus.setMode('ok', `heartbeat:${reason}-ok`);
    }

    function evaluate(now, drift) {
        const online = navigator.onLine;
        const payload = {
            timestamp: now,
            drift: Math.max(0, Math.round(drift)),
            online,
            reason: null
        };

        if (!online) {
            offlineSince = offlineSince || now;
            if (now - offlineSince >= OFFLINE_THRESHOLD) {
                degrade('offline');
                payload.reason = 'offline';
            }
        } else {
            offlineSince = null;
            restore('offline');
        }

        if (drift > BLOCK_THRESHOLD) {
            blockConsecutive += 1;
            goodConsecutive = 0;
            if (blockConsecutive >= BLOCK_CONSECUTIVE_REQUIRED) {
                degrade('event-loop');
                payload.reason = payload.reason || 'event-loop';
            }
        } else {
            // good tick
            goodConsecutive += 1;
            blockConsecutive = 0;
            if (goodConsecutive >= GOOD_CONSECUTIVE_REQUIRED) {
                if (perfStatus && perfStatus.reason === 'heartbeat:event-loop') {
                    restore('event-loop');
                }
            }
        }

        root.dataset.heartbeat = online ? 'online' : 'offline';
        notify(payload);
        window.dispatchEvent(new CustomEvent('heartbeat:tick', { detail: payload }));
    }

    function tick() {
        const now = performance.now();
        const drift = now - lastTick - INTERVAL;
        lastTick = now;
        evaluate(now, drift);
    }

    const intervalId = setInterval(tick, INTERVAL);
    tick();

    window.__GRF_HEARTBEAT = {
        subscribe(fn) {
            if (typeof fn !== 'function') return () => {};
            subscribers.add(fn);
            return () => subscribers.delete(fn);
        },
        get lastTick() {
            return lastTick;
        },
        isOnline() {
            return navigator.onLine;
        }
    };

    window.addEventListener('beforeunload', () => clearInterval(intervalId));
})();
