// navigation.js - Gestion unifiée du menu mobile (toutes les pages)
document.addEventListener('DOMContentLoaded', function() {
    if (window.__GRF_NAV_INIT) return;
    window.__GRF_NAV_INIT = true;

    const perfStatus = window.__GRF_PERF_STATUS;
    let isPerfDegraded = perfStatus && typeof perfStatus.isDegraded === 'function'
        ? perfStatus.isDegraded()
        : false;
    let perfUnsubscribe = null;
    let scrollAttached = false;

    // Sélecteurs DOM
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelector('.nav-links');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');

    if (!nav || !navLinks || !mobileMenuBtn) {
        console.warn('⚠️ Navigation: éléments manquants');
        return;
    }

    // === GESTION DU CLIC SUR LE BOUTON MOBILE ===
    mobileMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = navLinks.classList.toggle('active');
        this.classList.toggle('active');
        this.setAttribute('aria-expanded', isOpen);
    });

    // === FERMER LE MENU EN CLIQUANT SUR UN LIEN ===
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        });
    });

    // === FERMER LE MENU EN CLIQUANT À L'EXTÉRIEUR ===
    document.addEventListener('click', function(event) {
        if (!nav.contains(event.target) && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
    });

    // === MARQUER LE LIEN ACTIF ===
    function setActiveNav() {
        const currentPath = window.location.pathname;
        navLinks.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            const isActive = currentPath.endsWith(href) || (currentPath === '/' && href === 'index.html');
            link.classList.toggle('active', isActive);
        });
    }
    
    // === FOOTER NAV: ensure presence and active state ===
    function ensureFooterNav() {
        const footer = document.querySelector('.footer');
        if (!footer) return;

        // Look for an existing footer navigation section
        let footerSection = footer.querySelector('.footer-section.nav-links-footer');
        if (!footerSection) {
            // Try to find a plain footer-section with a Navigation header
            footerSection = footer.querySelector('.footer-section');
        }

        // If still not found, create one (safe fallback)
        if (!footerSection) {
            footerSection = document.createElement('div');
            footerSection.className = 'footer-section nav-links-footer';
            footerSection.innerHTML = `
                <h3>Navigation</h3>
                <ul>
                    <li><a href="index.html">Accueil</a></li>
                    <li><a href="biography.html">Biographie</a></li>
                    <li><a href="contact.html">Contact</a></li>
                </ul>`;
            const content = footer.querySelector('.footer-content') || footer;
            content.prepend(footerSection);
        } else {
            // Ensure the markup contains the list of links (defensive)
            const ul = footerSection.querySelector('ul');
            if (!ul) {
                footerSection.innerHTML = `
                    <h3>Navigation</h3>
                    <ul>
                        <li><a href="index.html">Accueil</a></li>
                        <li><a href="biography.html">Biographie</a></li>
                        <li><a href="contact.html">Contact</a></li>
                    </ul>`;
            }
        }

        // Mark the active footer link to match header state
        const footerLinks = footerSection.querySelectorAll('a');
        const current = window.location.pathname;
        footerLinks.forEach(link => {
            const href = link.getAttribute('href');
            const isActive = current.endsWith(href) || (current === '/' && href === 'index.html');
            link.classList.toggle('active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
            // Ensure accessibility and visibility
            link.setAttribute('tabindex', '0');
            link.style.visibility = 'visible';
            link.style.opacity = '1';
        });
    }
    setActiveNav();
    ensureFooterNav();
    // === GESTION DU SCROLL : bascule la classe `scrolled` sur le header ===
    const header = document.querySelector('.header');
    function onScroll() {
        if (!header) return;
        const should = window.scrollY > 50;
        header.classList.toggle('scrolled', should);
    }

    function attachScrollListener() {
        if (scrollAttached) return;
        window.addEventListener('scroll', onScroll, { passive: true });
        scrollAttached = true;
    }

    function detachScrollListener() {
        if (!scrollAttached) return;
        window.removeEventListener('scroll', onScroll);
        scrollAttached = false;
    }

    function setPerfMode(mode) {
        const degraded = mode === 'degraded';
        isPerfDegraded = degraded;
        if (degraded) {
            detachScrollListener();
            header?.classList.add('perf-muted');
            navLinks.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            mobileMenuBtn.disabled = true;
        } else {
            mobileMenuBtn.disabled = false;
            header?.classList.remove('perf-muted');
            attachScrollListener();
            onScroll();
        }
    }

    if (perfStatus && typeof perfStatus.subscribe === 'function') {
        perfUnsubscribe = perfStatus.subscribe(setPerfMode);
    }
    setPerfMode(isPerfDegraded ? 'degraded' : 'ok');

    window.addEventListener('beforeunload', function() {
        if (typeof perfUnsubscribe === 'function') {
            perfUnsubscribe();
        }
    });
});
