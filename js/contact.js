// Gestion accessible et fiable du formulaire de contact (Netlify)
document.addEventListener('DOMContentLoaded', function() {
    const perfStatus = window.__GRF_PERF_STATUS;
    const userMetrics = window.__GRF_USER_METRICS;
    let isPerfDegraded = perfStatus && typeof perfStatus.isDegraded === 'function'
        ? perfStatus.isDegraded()
        : false;
    let perfUnsubscribe = null;

    const form = document.getElementById('contactForm');
    const modal = document.getElementById('confirmationModal');
    const closeModalBtn = document.getElementById('closeModalBtn') || document.querySelector('.close-modal');
    const statusBox = document.getElementById('contactFormStatus');
    let lastFocused = null;

    function openModal(message) {
        if (!modal) return;
        lastFocused = document.activeElement;
        modal.setAttribute('aria-hidden', 'false');
        modal.style.display = 'flex';
        const msgEl = modal.querySelector('#confirmationMessage');
        if (msgEl) msgEl.textContent = message || 'Message envoyé avec succès !';
        if (closeModalBtn) closeModalBtn.focus();
    }

    function closeModal() {
        if (!modal) return;
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';
        if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    function handlePerfMode(mode, payload = {}) {
        const reason = payload.reason || 'perf';
        isPerfDegraded = mode === 'degraded';
        userMetrics?.record('contact:perf-mode', { mode, reason });
        if (mode === 'degraded') {
            userMetrics?.record('contact:degraded', { reason });
        }
        if (statusBox) {
            statusBox.textContent = isPerfDegraded
                ? 'Mode économie d’énergie — le formulaire est temporairement désactivé.'
                : '';
        }
    }

    if (perfStatus && typeof perfStatus.subscribe === 'function') {
        perfUnsubscribe = perfStatus.subscribe(handlePerfMode);
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            closeModal();
        });
    }

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.getAttribute('aria-hidden') === 'false') {
            closeModal();
        }
    });

    if (form) {
        const submitBtn = form.querySelector('.submit-btn');
        handlePerfMode(isPerfDegraded ? 'degraded' : 'ok');

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            if (isPerfDegraded) {
                if (statusBox) {
                    statusBox.textContent = 'Désolé, mode économie activé. Reviens un peu plus tard.';
                }
                userMetrics?.record('contact:submit-blocked', { reason: 'perf-degraded' });
                return;
            }

            userMetrics?.record('contact:submit:attempt');

            const originalText = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
                submitBtn.disabled = true;
            }

            if (statusBox) {
                statusBox.textContent = '';
            }

            try {
                const formData = new FormData(form);
                if (!formData.get('form-name')) {
                    formData.append('form-name', form.getAttribute('name') || 'contact');
                }

                const action = form.getAttribute('action') || window.location.pathname;
                const response = await fetch(action, {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    openModal('Message envoyé — merci, je vous répondrai bientôt.');
                    form.reset();
                    userMetrics?.record('contact:submit:success');
                } else {
                    const text = await response.text().catch(() => 'Erreur lors de l\'envoi');
                    if (statusBox) statusBox.textContent = 'Erreur: ' + (text || response.statusText);
                    else alert('Erreur lors de l\'envoi du formulaire.');
                    userMetrics?.record('contact:submit:error', {
                        status: response.status,
                        message: text || response.statusText
                    });
                }
            } catch (err) {
                if (statusBox) statusBox.textContent = 'Erreur réseau: veuillez réessayer.';
                else alert('Erreur réseau: veuillez réessayer.');
                userMetrics?.record('contact:submit:error', { message: err.message });
            } finally {
                if (submitBtn) {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            }
        });
    }

    window.addEventListener('beforeunload', function() {
        if (typeof perfUnsubscribe === 'function') {
            perfUnsubscribe();
        }
    });
});
