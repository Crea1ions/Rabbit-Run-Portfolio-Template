// experience.js - contrôleur des effets (biographie, parallaxe, machine à écrire)
// Respecte l'API de guard exposée par `core.js` (perf:modeChange)

 (function() {
    if (window.__GRF_OPTIMIZED_INIT) {
        return;
    }
    
    window.__GRF_OPTIMIZED_INIT = true;
    const perfApi = window.__GRF_PERF_STATUS;
    const isPerformanceDegraded = () => {
        const attr = document.documentElement.dataset.perf;
        if (attr === 'degraded') return true;
        if (perfApi && typeof perfApi.isDegraded === 'function') {
            return perfApi.isDegraded();
        }
        return perfApi && perfApi.mode === 'degraded';
    };

    // ===== FONCTIONS GLOBALES =====
    function initGlobalFeatures() {
        // Fonctionnalités globales initialisées
        // Parallaxe simple pour index/contact (desktop uniquement)
        const indexHero = document.querySelector('.hero');
        const contactHero = document.querySelector('.contact-hero');
        const isContactPage = document.body.classList.contains('contact-page');

        if (!indexHero && !contactHero) return;

        const DESKTOP_MIN = 1025;
        let globalParallaxEnabled = false;
        let ticking = false;
        const isIndexPage = document.body.classList.contains('index-page');

        function enableGlobalParallax() {
            if (globalParallaxEnabled) return;
            globalParallaxEnabled = true;
            window.addEventListener('scroll', onScroll, { passive: true });
            onScroll();
        }

        function disableGlobalParallax() {
            if (!globalParallaxEnabled) return;
            globalParallaxEnabled = false;
            window.removeEventListener('scroll', onScroll);
            // Reset positions
            if (indexHero) {
                indexHero.classList.remove('parallax-active');
                indexHero.style.removeProperty('--parallax-hero-y');
            }
            if (contactHero) {
                contactHero.classList.remove('parallax-active');
                contactHero.style.removeProperty('--parallax-contact-y');
            }
            // Parallaxe désactivé
        }

        function onScroll() {
            if (ticking || !globalParallaxEnabled) return;
            requestAnimationFrame(updateGlobalParallax);
            ticking = true;
        }

        function updateGlobalParallax() {
            const scrollY = window.scrollY;
            const viewportH = window.innerHeight;

            if (isIndexPage) {
                const target = indexHero || document.body;
                const rect = indexHero ? indexHero.getBoundingClientRect() : document.body.getBoundingClientRect();
                const progress = Math.max(0, Math.min(1, (viewportH - rect.top) / (viewportH * 2)));
                const y = Math.round(progress * 60); // 0 → 60%
                const overlay = Math.max(0.25, Math.min(0.45, 0.45 - progress * 0.2));
                if (scrollY > 50) {
                    document.body.style.setProperty('--page-parallax-y', y + '%');
                    if (indexHero) {
                        indexHero.classList.add('parallax-active');
                        // no overlay on index hero background
                        indexHero.style.setProperty('--index-hero-overlay', '0');
                    }
                } else {
                    document.body.style.setProperty('--page-parallax-y', 'top');
                    if (indexHero) {
                        indexHero.classList.remove('parallax-active');
                        indexHero.style.setProperty('--index-hero-overlay', '0');
                    }
                }
            } else if (indexHero) {
                const rect = indexHero.getBoundingClientRect();
                const progress = Math.max(0, Math.min(1, (viewportH - rect.top) / (viewportH * 2)));
                const y = Math.round(progress * 60); // 0 → 60%
                if (scrollY > 50) {
                    indexHero.classList.add('parallax-active');
                    indexHero.style.setProperty('--parallax-hero-y', y + '%');
                } else {
                    indexHero.classList.remove('parallax-active');
                    indexHero.style.setProperty('--parallax-hero-y', 'top');
                }
            }

            if (isContactPage) {
                // Drive page-level parallax (body ::before) and hero overlay simultaneously
                const rect = contactHero ? contactHero.getBoundingClientRect() : document.body.getBoundingClientRect();
                const progress = Math.max(0, Math.min(1, (viewportH - rect.top) / (viewportH * 2)));
                const y = Math.round(progress * 60); // 0 → 60%
                if (scrollY > 50) {
                    document.body.style.setProperty('--page-parallax-y', y + '%');
                    if (contactHero) {
                        contactHero.classList.add('parallax-active');
                        // no overlay on contact hero background
                    }
                } else {
                    document.body.style.setProperty('--page-parallax-y', 'top');
                    if (contactHero) {
                        contactHero.classList.remove('parallax-active');
                        contactHero.style.setProperty('--contact-hero-overlay', '0');
                    }
                }
            } else if (contactHero) {
                const rect = contactHero.getBoundingClientRect();
                const progress = Math.max(0, Math.min(1, (viewportH - rect.top) / (viewportH * 2)));
                const y = Math.round(progress * 60); // 0 → 60%
                if (scrollY > 50) {
                    contactHero.classList.add('parallax-active');
                    contactHero.style.setProperty('--parallax-contact-y', y + '%');
                    // no overlay on contact hero background
                } else {
                    contactHero.classList.remove('parallax-active');
                    contactHero.style.setProperty('--parallax-contact-y', 'top');
                    contactHero.style.setProperty('--contact-hero-overlay', '0');
                }
            }

            ticking = false;
        }

        function evaluate() {
            if (window.innerWidth >= DESKTOP_MIN) {
                enableGlobalParallax();
            } else {
                disableGlobalParallax();
            }
        }

        // Init + resize listener
        evaluate();
        window.addEventListener('resize', evaluate);
    }
    
    document.addEventListener('DOMContentLoaded', function() {
        
        // Vérifier si on est sur biography.html
        const isBiographyPage = document.querySelector('.biography-hero');
        
        if (isBiographyPage) {
            initBiography(); // Initialiser la biographie complète
        } else {
            initGlobalFeatures(); // Initialiser seulement les fonctionnalités globales
        }
    });
    
    function initBiography() {
        // Déplacer TOUT le code existant de init() ici
        // Initialisation de la biographie
        
                // Vérifier éléments critiques
        const text1 = document.getElementById('typewriter-text-part1');
        const text2 = document.getElementById('typewriter-text-part2');
        if (!text1 || !text2) {
            console.error('❌ Éléments texte manquants');
            return;
        }
        
        // ===== CONFIGURATION OPTIMISÉE POUR i3/Radeon HD 6670 =====
        const CONFIG = {
            typing: {
                normal: 18,      // accéléré (was 35)
                fast: 10,
                pauseDot: 300,
                pauseComma: 150,
                pauseLine: 400
            },
            scroll: {
                autoSpeed: 8,
                maxSpeed: 12,
                minSpeed: 4,
                transitionSpeed: 5,
                interval: 180,   // ~30 FPS max
                threshold: 20
            },
            breakpoints: {
                desktop: 1025,   // Desktop: parallaxe
                tablet: 769,     // Tablet: pas de parallaxe
                mobile: 768      // Mobile: images mobiles           
            },
            performance: {
                maxAnimations: 5,        // Pour i3
                parallaxFPS: 30,         // Pour Radeon HD 6670
                enableAutoScroll: true,  // Désactivé sur mobile
                enableParallax: true
            }
        };
        
        // ===== ÉTAT DE L'APPLICATION =====
    const STATE = {
        hasStarted: false,
        isTyping: false,
        isAutoScrolling: false,
        currentText: 1,
        typingInterval: null,
        scrollInterval: null,
        currentScrollSpeed: CONFIG.scroll.autoSpeed,
        isTransitioning: false,
        isMobileMode: false,
        isTabletMode: false,
        parallaxEnabled: true
    };
    
    // ===== RÉFÉRENCES DOM =====
    const ELEMENTS = {
        text1: document.getElementById('typewriter-text-part1'),
        text2: document.getElementById('typewriter-text-part2'),
        signature: document.querySelector('.signature'),
        containers: document.querySelectorAll('.text-container'),
        skipBtn: document.getElementById('skip-animation-btn'),
        hero: document.querySelector('.biography-hero'),
        section1: document.getElementById('section-1'),
        section2: document.getElementById('section-2'),
        techniques: document.querySelector('.techniques-section'),
        mobileImages: {
            img1: document.getElementById('mobile-image-1'),
            img2: document.getElementById('mobile-image-2')
        },
        finalImage: document.querySelector('.final-image-container')
    };
        
        // ===== TEXTE BIOGRAPHIE =====
    const TEXT = {
        part1: `Je suis le Lapin des Glaces, né quelque part entre un glacier et une ligne de code.

    Mon histoire commence dans les étendues blanches du Nord, où j'ai appris la patience et la précision - des qualités essentielles pour un développeur. Un jour, j'ai découvert un ordinateur abandonné par une expédition scientifique. C'était le début de ma transformation.

    J'ai passé des hivers entiers à apprendre :
    - HTML/CSS : La structure de mon igloo numérique
    - JavaScript : Les incantations qui donnent vie à mes créations
    - Git : Mon carnet de bord d'explorateur versionné
    - React : Pour construire des interfaces aussi solides qu'un igloo

    Ma philosophie ? Créer des expériences aussi pures et rafraîchissantes que l'air polaire. Chaque projet est une nouvelle expédition, chaque bug un défi de survie à surmonter.

    Actuellement, je travaille sur :
    ✓ Mon mini-jeu d'aventure polaire
    ✓ Une bibliothèque d'animations "glacées"
    ✓ Un framework CSS thème hivernal
    ✓ Des tutoriels pour développeurs en herbe

    Mes outils de prédilection :
    ❄️ VS Code configuré thème sombre/glacial
    ❄️ Terminal avec prompt personnalisé polaire
    ❄️ GitHub pour l'archivage des expéditions
    ❄️ Figma pour cartographier mes interfaces
    ❄️ Une tasse de chocolat chaud perpétuelle

    Je crois en un code propre comme la neige fraîche, en des commentaires utiles comme des panneaux indicateurs dans la tempête, et en des commits fréquents comme les traces dans la neige.

    En dehors du code, je pratique :
    - L'escalade de glaciers (pour garder la tête froide)
    - La collecte de cristaux de glace (inspiration design)
    - L'écriture de journaux de bord numériques

    Mon objectif ? Prouver que même dans l'environnement le plus froid, on peut créer des expériences chaleureuses et engageantes.

    Prochaine expédition prévue : Développement d'une application de suivi météo polaire avec React Native.

    Restez à l'écoute, l'aventure ne fait que commencer...`,

        part2: `Signé : Le Lapin des Glaces\nDernière mise à jour : Hiver Éternel 2024`,

        part3: `---

Informations techniques et maintenance :

Ce site est une application statique prête pour l'hébergement sur Netlify (voir netlify.toml).

- Structure des images : placez vos fichiers d'œuvres dans assets/images/oeuvres/<technique>/ (ex : assets/images/oeuvres/fusain/1.jpg).
- artworks.json référence chaque image par son chemin relatif sous oeuvres/ (ex : fusain/1.jpg).
- Tester localement : python3 -m http.server 8000 ou npx serve . puis ouvrir http://localhost:8000.
- Déploiement : connecter le dépôt à Netlify et pousser sur la branche main; Netlify utilisera netlify.toml pour la publication.

Modules clefs : core.js (guard de performance), experience.js (mécanismes UX), gallery.js (chargement et lightbox).
Respectez l'API window.__GRF_PERF_STATUS pour contrôler les modes dégradés.

Pour le débogage des images, activez window.__GRF_DEBUG_IMAGES = true dans la console et utilisez window.__GRF_IMAGE_STATS().
Pour toute mise à jour des données : modifier artworks.json, vérifier les chemins, puis pousser le commit.
`,
    };
        
         // ===== INITIALISATION =====
    function init() {
                        // Initialisation de la biographie
        
        // Vérifier éléments critiques
        if (!ELEMENTS.text1 || !ELEMENTS.text2) {
            console.error('❌ Éléments texte manquants');
            return;
        }
        
        // Détecter mode (desktop/tablet/mobile)
        detectMode();
        
        // Configurer parallaxe selon le mode
        configureParallax();
        
        // Préparer l'interface selon le mode
        setupBiography();
        
        // Configurer événements
        setupEventListeners();

        // Ajuster l'espacement du hero par rapport au header fixe
        syncHeroSpacing();
        
        // Vérifier images
        checkImages();
        
        // Surveiller redimensionnement
        window.addEventListener('resize', handleResize);

        // Mode sécurité si nécessaire
        ensureSafetyMode();
        
        // Prêt - mode déterminé
    }
        
        // ===== DÉTECTION DU MODE CORRIGÉE =====
    function detectMode() {
        const width = window.innerWidth;
        
        if (width >= CONFIG.breakpoints.desktop) {
            // Desktop: parallaxe active
            STATE.isMobileMode = false;
            STATE.isTabletMode = false;
            STATE.parallaxEnabled = true;
        } else if (width >= CONFIG.breakpoints.tablet && width < CONFIG.breakpoints.desktop) {
            // Tablette: pas de parallaxe
            STATE.isMobileMode = false;
            STATE.isTabletMode = true;
            STATE.parallaxEnabled = false;
        } else {
            // Mobile: images mobiles
            STATE.isMobileMode = true;
            STATE.isTabletMode = false;
            STATE.parallaxEnabled = false;
        }
    }
    
    function getModeName() {
        if (STATE.isMobileMode) return 'Mobile';
        if (STATE.isTabletMode) return 'Tablette';
        return 'Desktop';
    }
    
    function handleResize() {
        const oldMode = getModeName();
        const oldParallax = STATE.parallaxEnabled;
        
        detectMode();
        
        const newMode = getModeName();
        const newParallax = STATE.parallaxEnabled;
        
        // Si changement de mode ou parallaxe
        if (oldMode !== newMode || oldParallax !== newParallax) {
            // Mode changé
            
            // Mettre à jour l'interface
            updateInterfaceForMode();
            
            // Reconfigurer parallaxe si nécessaire
            configureParallax();
        }
    }
    
    function ensureSafetyMode() {
        if (isPerformanceDegraded()) {
            applySafetyMode();
        }
    }
    
    function configureParallax() {
        if (STATE.parallaxEnabled) {
            setupParallax();
        } else {
            disableParallax();
        }
    }
    
    function disableParallax() {
        // Retirer classes parallaxe
        if (ELEMENTS.hero) ELEMENTS.hero.classList.remove('parallax-active');
        if (ELEMENTS.section1) ELEMENTS.section1.classList.remove('parallax-active');
        if (ELEMENTS.section2) ELEMENTS.section2.classList.remove('parallax-active');
        
        // Retirer écouteurs de parallaxe
        window.removeEventListener('scroll', parallaxScrollHandler);
    }
    
    function updateInterfaceForMode() {
        if (STATE.isMobileMode) {
            // Mode mobile : activer images intermédiaires
            activateMobileImages();
        } else if (STATE.isTabletMode) {
            // Mode tablette : images intermédiaires mais pas de parallaxe
            activateMobileImages();
        } else {
            // Mode desktop : masquer images intermédiaires
            deactivateMobileImages();
        }
    }
        
        // ===== SETUP BIOGRAPHIE =====
        function setupBiography() {
           // Vider les textes
        ELEMENTS.text1.textContent = '';
        ELEMENTS.text2.textContent = '';
        
        // Masquer signature
        if (ELEMENTS.signature) {
            ELEMENTS.signature.classList.remove('visible');
        }
        
        // Afficher premier container
        if (ELEMENTS.containers[0]) {
            setTimeout(() => {
                ELEMENTS.containers[0].classList.add('visible');
            }, 1000);
        }
        
        // Gérer images selon mode
        if (STATE.isMobileMode || STATE.isTabletMode) {
            // Mode mobile/tablette : préparer images intermédiaires
            prepareMobileImages();
        } else {
            // Mode desktop : masquer images intermédiaires
            deactivateMobileImages();
        }
        
        // Préparer image finale
        if (ELEMENTS.finalImage) {
            ELEMENTS.finalImage.classList.remove('visible');
        }
        
        // Indication de scroll gérée par un autre module (nettoyée)
    }
    function prepareMobileImages() {
        // S'assurer que les containers sont visibles
        if (ELEMENTS.mobileImages.img1) {
            ELEMENTS.mobileImages.img1.style.display = 'block';
            ELEMENTS.mobileImages.img1.classList.remove('visible');
        }
        if (ELEMENTS.mobileImages.img2) {
            ELEMENTS.mobileImages.img2.style.display = 'block';
            ELEMENTS.mobileImages.img2.classList.remove('visible');
        }
    }
    function activateMobileImages() {
        if (ELEMENTS.mobileImages.img1) {
            ELEMENTS.mobileImages.img1.style.display = 'block';
        }
        if (ELEMENTS.mobileImages.img2) {
            ELEMENTS.mobileImages.img2.style.display = 'block';
        }
    }
    
    function deactivateMobileImages() {
        if (ELEMENTS.mobileImages.img1) {
            ELEMENTS.mobileImages.img1.style.display = 'none';
        }
        if (ELEMENTS.mobileImages.img2) {
            ELEMENTS.mobileImages.img2.style.display = 'none';
        }
    }
    
        // ===== CONFIGURATION PARALLAXE CORRIGÉE =====
    let parallaxScrollHandler = null;
    let parallaxTicking = false;
    
    function setupParallax() {
        if (!STATE.parallaxEnabled || !ELEMENTS.hero || !ELEMENTS.section1 || !ELEMENTS.section2) {
            return;
        }
        
        // Configuration parallaxe (desktop seulement)
        
        // Retirer ancien écouteur si existant
        if (parallaxScrollHandler) {
            window.removeEventListener('scroll', parallaxScrollHandler);
        }
        
        parallaxScrollHandler = function() {
            if (!parallaxTicking && STATE.parallaxEnabled) {
                requestAnimationFrame(updateParallax);
                parallaxTicking = true;
            }
        };
        
        window.addEventListener('scroll', parallaxScrollHandler, { passive: true });
        updateParallax(); // Initial update
        
        // Parallaxe configuré pour desktop
    }
    
    function updateParallax() {
        if (!STATE.parallaxEnabled) return;
        
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        
        // Hero (0% → 60%)
        if (ELEMENTS.hero) {
            const rect = ELEMENTS.hero.getBoundingClientRect();
            const progress = Math.max(0, Math.min(1, 
                (viewportHeight - rect.top) / (viewportHeight * 2)
            ));
            
            const backgroundY = progress * 60;
            
            if (scrollY > 50) {
                ELEMENTS.hero.classList.add('parallax-active');
                ELEMENTS.hero.style.backgroundPosition = `center ${backgroundY}%`;
            } else {
                ELEMENTS.hero.classList.remove('parallax-active');
                ELEMENTS.hero.style.backgroundPosition = 'center top';
            }
        }
        
        // Section 1 (30% → 80%)
        if (ELEMENTS.section1) {
            const rect = ELEMENTS.section1.getBoundingClientRect();
            const progress = Math.max(0, Math.min(1,
                (viewportHeight - rect.top) / (viewportHeight * 1.5)
            ));
            
            const backgroundY = 30 + (progress * 50);
            
            if (rect.top < viewportHeight * 0.8 && rect.bottom > 0) {
                ELEMENTS.section1.classList.add('parallax-active');
                ELEMENTS.section1.style.backgroundPosition = `left ${backgroundY}%`;
            } else {
                ELEMENTS.section1.classList.remove('parallax-active');
            }
        }
        
        // Section 2 (30% → 80%)
        if (ELEMENTS.section2) {
            const rect = ELEMENTS.section2.getBoundingClientRect();
            const progress = Math.max(0, Math.min(1,
                (viewportHeight - rect.top) / (viewportHeight * 1.5)
            ));
            
            const backgroundY = 30 + (progress * 50);
            
            if (rect.top < viewportHeight * 0.8 && rect.bottom > 0) {
                ELEMENTS.section2.classList.add('parallax-active');
                ELEMENTS.section2.style.backgroundPosition = `right ${backgroundY}%`;
            } else {
                ELEMENTS.section2.classList.remove('parallax-active');
            }
        }
        
        parallaxTicking = false;
    }
    
    // ===== CONFIGURATION ÉVÉNEMENTS =====
    function setupEventListeners() {
        // Détection premier scroll
        let lastScrollY = window.scrollY;
        
        const handleFirstScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollDelta = Math.abs(currentScrollY - lastScrollY);
            
            if (scrollDelta > CONFIG.scroll.threshold && !STATE.hasStarted) {
                STATE.hasStarted = true;
                
                // Indication de scroll : gérée par un autre fichier
                
                // Démarrer expérience
                startBiographyExperience()
                
                // Retirer écouteur
                window.removeEventListener('scroll', handleFirstScroll);
                
                // Premier scroll détecté
            }
            
            lastScrollY = currentScrollY;
        };
        
        window.addEventListener('scroll', handleFirstScroll, { passive: true });
        
        // Bouton "Tout afficher"
        if (ELEMENTS.skipBtn) {
            ELEMENTS.skipBtn.addEventListener('click', skipAnimations);
        }
        
        // Raccourcis clavier
        document.addEventListener('keydown', handleKeyboard);
        
    }
        
        // ===== DÉMARRER EXPÉRIENCE BIOGRAPHIE =====
        function startBiographyExperience() {
            // Démarrage expérience
        
        showNotification('La biographie se dévoile...');
                    
        // Démarrer machine à écrire texte 1
        startTypewriter(ELEMENTS.text1, TEXT.part1, () => {
            // Texte 1 terminé
            
            // Transition
            STATE.isTransitioning = true;
            STATE.currentScrollSpeed = CONFIG.scroll.transitionSpeed;
            
            // Afficher image intermédiaire 1 (mode mobile/tablette)
            if ((STATE.isMobileMode || STATE.isTabletMode) && ELEMENTS.mobileImages.img1) {
                setTimeout(() => {
                    ELEMENTS.mobileImages.img1.classList.add('visible');
                }, 400);
            }
            
            // Afficher container 2
            if (ELEMENTS.containers[1]) {
                setTimeout(() => {
                    ELEMENTS.containers[1].classList.add('visible');
                }, (STATE.isMobileMode || STATE.isTabletMode) ? 800 : 400);
            }
            
            // Transition vers texte 2
            
            // Démarrer texte 2
            setTimeout(() => {
                startTypewriter(ELEMENTS.text2, TEXT.part2, () => {
                    // Texte 2 terminé
                    STATE.isTransitioning = false;
                    
                    // Afficher image intermédiaire 2 (mode mobile/tablette)
                    if ((STATE.isMobileMode || STATE.isTabletMode) && ELEMENTS.mobileImages.img2) {
                        setTimeout(() => {
                            ELEMENTS.mobileImages.img2.classList.add('visible');
                        }, 400);
                    }
                    
                    // Afficher signature
                    if (ELEMENTS.signature) {
                        ELEMENTS.signature.classList.add('visible');
                    }
                    
                    // Afficher image finale
                    if (ELEMENTS.finalImage) {
                        setTimeout(() => {
                            ELEMENTS.finalImage.classList.add('visible');
                        }, 800);
                    }
                    
                    // Finaliser
                    finalizeExperience();
                });
            }, (STATE.isMobileMode || STATE.isTabletMode) ? 1000 : 600);
        });
     }
        
 // ===== AUTO-SCROLL =====
     function startAutoScroll() {
        if (STATE.isAutoScrolling || !CONFIG.performance.enableAutoScroll) return;

        STATE.isAutoScrolling = true;
        STATE.currentScrollSpeed = CONFIG.scroll.autoSpeed;
        const AUTO_SCROLL_DELAY = 600;
        const AUTO_SCROLL_OFFSET = 120;

        function getActiveTextElement() {
            if (ELEMENTS.text1 && !ELEMENTS.text1.classList.contains('completed')) {
                return ELEMENTS.text1;
            }
            if (ELEMENTS.text2 && !ELEMENTS.text2.classList.contains('completed')) {
                return ELEMENTS.text2;
            }
            return ELEMENTS.text2;
        }

        function scrollTowardsActiveText() {
            if (!STATE.isAutoScrolling) return;

            const activeText = getActiveTextElement();
            const bothCompleted = ELEMENTS.text1 && ELEMENTS.text1.classList.contains('completed')
                && ELEMENTS.text2 && ELEMENTS.text2.classList.contains('completed');
            if (bothCompleted) {
                stopAutoScroll();
                return;
            }
            if (!activeText) {
                stopAutoScroll();
                return;
            }

            const viewportHeight = window.innerHeight;
            const targetTop = Math.max(0, activeText.offsetTop - AUTO_SCROLL_OFFSET);
            const maxScrollTop = document.documentElement.scrollHeight - viewportHeight;
            const destination = Math.min(targetTop, maxScrollTop);

            const currentBottom = window.scrollY + viewportHeight;
            const techniquesTop = ELEMENTS.techniques ? ELEMENTS.techniques.offsetTop : Infinity;
            const distanceToTech = techniquesTop - currentBottom;

            if (distanceToTech < 80) {
                stopAutoScroll();
                return;
            }

            if (Math.abs(destination - window.scrollY) > 5) {
                window.scrollTo({
                    top: destination,
                    behavior: 'smooth'
                });
            }

            STATE.scrollInterval = setTimeout(scrollTowardsActiveText, AUTO_SCROLL_DELAY);
        }

        STATE.scrollInterval = setTimeout(scrollTowardsActiveText, 1200);
    }

    function stopAutoScroll() {
        if (!STATE.isAutoScrolling) return;

        STATE.isAutoScrolling = false;
        if (STATE.scrollInterval) {
            clearTimeout(STATE.scrollInterval);
            STATE.scrollInterval = null;
        }
    }
    
    // ===== MACHINE À ÉCRIRE =====
    function startTypewriter(element, text, onComplete) {
        if (!element || STATE.isTyping) return;
        
        STATE.isTyping = true;
        element.textContent = '';
        element.classList.remove('completed');
        
        let index = 0;
        const totalChars = text.length;
        
        function typeNextChar() {
            if (index >= totalChars || !STATE.isTyping) {
                STATE.isTyping = false;
                element.classList.add('completed');
                if (onComplete) onComplete();
                return;
            }
            
            const char = text.charAt(index);
            element.textContent = text.substring(0, index + 1);
            index++;
            
            // Calculer délai
            let delay = CONFIG.typing.normal;
            
            if (char === '.') delay = CONFIG.typing.pauseDot;
            else if (char === ',') delay = CONFIG.typing.pauseComma;
            else if (char === '\n') delay = CONFIG.typing.pauseLine;
            
            // Suivant
            STATE.typingInterval = setTimeout(typeNextChar, delay);
        }
        
        typeNextChar();
    }
    
    // ===== SAUTER ANIMATIONS =====
    function skipAnimations() {
        // Sauter animations
        
        // Arrêter tout
        STATE.isTyping = false;
        STATE.isAutoScrolling = false;
        STATE.hasStarted = true;
        
        if (STATE.typingInterval) {
            clearTimeout(STATE.typingInterval);
            STATE.typingInterval = null;
        }
        
        stopAutoScroll();
        
        // Afficher tout
        if (ELEMENTS.text1) {
            ELEMENTS.text1.textContent = TEXT.part1;
            ELEMENTS.text1.classList.add('completed');
        }
        
        if (ELEMENTS.text2) {
            ELEMENTS.text2.textContent = TEXT.part2;
            ELEMENTS.text2.classList.add('completed');
        }
        
        ELEMENTS.containers.forEach(container => {
            container.classList.add('visible');
        });
        
        // Afficher images (selon mode)
        if (STATE.isMobileMode || STATE.isTabletMode) {
            if (ELEMENTS.mobileImages.img1) ELEMENTS.mobileImages.img1.classList.add('visible');
            if (ELEMENTS.mobileImages.img2) ELEMENTS.mobileImages.img2.classList.add('visible');
        }
        
        if (ELEMENTS.finalImage) {
            ELEMENTS.finalImage.classList.add('visible');
        }
        
        if (ELEMENTS.signature) {
            ELEMENTS.signature.classList.add('visible');
        }
        
        // Aller aux techniques
        if (ELEMENTS.techniques) {
            setTimeout(() => {
                window.scrollTo({
                    top: ELEMENTS.techniques.offsetTop - 100,
                    behavior: 'smooth'
                });
            }, 300);
        }
        
        showNotification('Texte complet affiché');
    }
    
    // ===== FINALISER EXPÉRIENCE =====
    function finalizeExperience() {
        // Ralentir progressivement
        STATE.currentScrollSpeed = CONFIG.scroll.minSpeed;
        
        setTimeout(() => {
            stopAutoScroll();
            
            // Scroller vers techniques
            setTimeout(() => {
                if (ELEMENTS.techniques) {
                    window.scrollTo({
                        top: ELEMENTS.techniques.offsetTop - 150,
                        behavior: 'smooth'
                    });
                }
            }, 1000);
        }, 2000);
    }
        
    // ===== UTILITAIRES =====
function syncHeroSpacing() {
    const header = document.querySelector('.header');
    const hero = document.querySelector('.biography-hero');
    if (!header || !hero) return;

    const updateMargin = () => {
        hero.style.marginTop = `${header.offsetHeight}px`;
    };

    updateMargin();
    window.addEventListener('resize', updateMargin);
}

function applySafetyMode() {
    if (!isPerformanceDegraded()) return;
    disableParallax();
    stopAutoScroll();
    if (!STATE.hasStarted) {
        STATE.hasStarted = true;
    }
    skipAnimations();
}

function handlePerfModeChange(event) {
    const detail = event && event.detail;
    if (detail && detail.mode === 'degraded') {
        applySafetyMode();
        return;
    }
    if (isPerformanceDegraded()) {
        applySafetyMode();
        return;
    }
    if (detail && detail.mode === 'ok') {
        detectMode();
        configureParallax();
    }
}

window.addEventListener('perf:modeChange', handlePerfModeChange);

    function handleKeyboard(e) {
        // Espace pour sauter
        if (e.key === ' ' && !e.target.matches('input, textarea, button')) {
            e.preventDefault();
            skipAnimations();
        }
        
        // Échap pour arrêter
        if (e.key === 'Escape' && STATE.isAutoScrolling) {
            stopAutoScroll();
            showNotification('⏸️ Auto-scroll arrêté');
        }
        
        // S pour démarrer
        if ((e.key === 's' || e.key === 'S') && !STATE.hasStarted) {
            e.preventDefault();
            STATE.hasStarted = true;
            // startExperience is intentionally named in other module; trigger main start
            startBiographyExperience();
        }
    }
    
    function checkImages() {
        const images = [
            'assets/images/hero/biography-hero.png',
            'assets/images/portfolio/Lapin-Piskel-1.png',
            'assets/images/portfolio/Lapin-Piskel-2.gif',
            'assets/images/portfolio/Lapin-Piskel-3.gif',
            'assets/images/portfolio/Lapin-Piskel-4.jpg'
        ];
        
        images.forEach(img => {
            const image = new Image();
            image.onload = () => {/* image loaded */};
            image.onerror = () => console.warn(`⚠️ Image manquante: ${img}`);
            image.src = img;
        });
    }
    
    function showNotification(message, duration = 2000) {
        const existing = document.querySelector('.user-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = 'user-notification';
        notification.textContent = message;
        notification.setAttribute('role', 'alert');
        
        document.body.appendChild(notification);
        
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(40px)';
            setTimeout(() => notification.remove(), 400);
        }, duration);
    }
    
    // ===== NETTOYAGE =====
    function cleanup() {
        if (STATE.typingInterval) clearTimeout(STATE.typingInterval);
        if (STATE.scrollInterval) clearTimeout(STATE.scrollInterval);
        
        // Retirer écouteurs
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', parallaxScrollHandler);
        
        // Nettoyage effectué
    }
    
    // ===== DÉMARRER =====
    init();
    
    // Nettoyer
    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('pagehide', cleanup);
    }    
})();
