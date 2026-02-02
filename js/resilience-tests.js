(function () {
    'use strict';
    if (window.__GRF_RESILIENCE_TESTS_INIT) return;
    window.__GRF_RESILIENCE_TESTS_INIT = true;

    const tests = [
        {
            name: 'Core guard ready',
            check() {
                const perf = window.__GRF_PERF_STATUS;
                return perf && typeof perf.subscribe === 'function' && typeof perf.isDegraded === 'function';
            }
        },
        {
            name: 'Heartbeat running',
            check() {
                const hb = window.__GRF_HEARTBEAT;
                return hb && typeof hb.subscribe === 'function';
            }
        },
        {
            name: 'Data integrity available',
            check() {
                const integrity = window.__GRF_DATA_INTEGRITY;
                return integrity && typeof integrity.validateArtworks === 'function';
            }
        },
        {
            name: 'User metrics collecting',
            check() {
                const metrics = window.__GRF_USER_METRICS;
                return metrics && typeof metrics.record === 'function';
            }
        },
        {
            name: 'Artworks cache consistent',
            check() {
                const data = window.__ARTWORKS__;
                const version = window.__ARTWORKS_VERSION;
                return Array.isArray(data) && data.length > 0 && typeof version === 'string';
            }
        }
    ];

    function runTest(test) {
        try {
            const passed = Boolean(test.check());
            return { name: test.name, passed };
        } catch (err) {
            return { name: test.name, passed: false, error: err.message || 'error' };
        }
    }

    function runAll() {
        const timestamp = new Date().toISOString();
        const results = tests.map(runTest);
        const passed = results.every(result => result.passed);
        console.group('Resilience tests');
        console.log(`Timestamp: ${timestamp}`);
        results.forEach(result => {
            console[result.passed ? 'info' : 'warn'](
                `${result.passed ? '✅' : '❌'} ${result.name}`,
                result.error || ''
            );
        });
        console.groupEnd();
        console.info('Resilience tests summary', passed ? 'PASSED' : 'FAILED');
        window.__GRF_RESILIENCE_TESTS.lastReport = { timestamp, results, passed };
        return window.__GRF_RESILIENCE_TESTS.lastReport;
    }

    window.__GRF_RESILIENCE_TESTS = {
        runAll,
        getTests() {
            return tests.slice();
        },
        lastReport: null
    };

    window.dispatchEvent(new CustomEvent('resilience:testsReady'));
})();
