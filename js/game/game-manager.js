(function() {
    const perfStatus = window.__GRF_PERF_STATUS;
    const perfNoticeClass = 'game-perf-notice';

    document.addEventListener('DOMContentLoaded', function() {
        const gameSection = document.querySelector('.interactive-gem');
        if (!gameSection) {
            return;
        }

        const playButton = document.getElementById('playButton');
        const canvas = document.getElementById('trexMiniCanvas');
        const helpButton = document.getElementById('toggleHelp');
        const detailsBtn = document.getElementById('techDetailsBtn');
        const detailsPanel = document.getElementById('techDetailsPanel');
        const soundButton = document.getElementById('toggleSound');
        const gamePreview = document.getElementById('gamePreview');
        const defaultPlayContent = playButton ? playButton.innerHTML : 'Démarrer';

        let gameInstance = null;
        let initTimeoutId = null;
        let scrollTimeoutId = null;
        let hintTimeoutId = null;
        let focusTimeoutId = null;
        let hasAppeared = false;
        let isPerfDegraded = perfStatus && typeof perfStatus.isDegraded === 'function'
            ? perfStatus.isDegraded()
            : false;
        let currentGameTime = 0;
        let playHandlerAttached = false;

        function disableControls(disabled) {
            if (playButton) {
                playButton.disabled = disabled;
                playButton.style.pointerEvents = disabled ? 'none' : '';
                if (!disabled) {
                    playButton.style.cursor = '';
                }
            }
            if (detailsBtn) {
                detailsBtn.disabled = disabled;
            }
            if (helpButton) {
                helpButton.disabled = disabled;
            }
            if (soundButton) {
                soundButton.disabled = disabled;
            }
        }

        function showPerfNotice(message) {
            let notice = gameSection.querySelector(`.${perfNoticeClass}`);
            if (!notice) {
                notice = document.createElement('p');
                notice.className = perfNoticeClass;
                notice.style.cssText = 'margin-top: 1rem; padding: 0.6rem 0.9rem; border-radius: 6px; background: rgba(0,0,0,0.65); color: #f3f3f3; font-size: 0.85rem; text-align: center;';
                notice.setAttribute('aria-live', 'polite');
                gameSection.appendChild(notice);
            }
            notice.textContent = message;
            return notice;
        }

        function hidePerfNotice() {
            const notice = gameSection.querySelector(`.${perfNoticeClass}`);
            if (notice) {
                notice.remove();
            }
        }

        function dimVisuals() {
            gameSection.style.opacity = '0.7';
            if (canvas) {
                canvas.style.opacity = '0.6';
            }
        }

        function restoreVisuals() {
            gameSection.style.opacity = '1';
            if (canvas) {
                canvas.style.opacity = '';
            }
        }

        function clearPlayTimeouts() {
            [hintTimeoutId, focusTimeoutId, scrollTimeoutId].forEach(id => {
                if (id) {
                    clearTimeout(id);
                }
            });
            hintTimeoutId = focusTimeoutId = scrollTimeoutId = null;
        }

        function checkScroll() {
            if (hasAppeared || isPerfDegraded) {
                if (scrollTimeoutId) {
                    clearTimeout(scrollTimeoutId);
                    scrollTimeoutId = null;
                }
                return;
            }

            const rect = gameSection.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            if (rect.top < windowHeight * 0.8) {
                gameSection.style.opacity = '1';
                gameSection.style.transition = 'opacity 1.2s ease';
                hasAppeared = true;
                window.removeEventListener('scroll', checkScroll);
                if (scrollTimeoutId) {
                    clearTimeout(scrollTimeoutId);
                    scrollTimeoutId = null;
                }
            }
        }

        function scheduleScrollCheck() {
            if (scrollTimeoutId) {
                clearTimeout(scrollTimeoutId);
            }
            scrollTimeoutId = setTimeout(checkScroll, 3000);
        }

        function handlePlayClick(event) {
            if (isPerfDegraded || !playButton) {
                return;
            }

            // Ensure the game is initialized on first interaction
            if (!gameInstance) {
                ensureGameInitialized();
            }

            if (!gameInstance) {
                // still not initialized
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            currentGameTime = 0;

            if (gamePreview) {
                gamePreview.style.transition = 'all 0.3s ease';
                gamePreview.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                gamePreview.style.borderColor = 'rgba(120, 120, 120, 0.4)';
                setTimeout(() => {
                    if (gamePreview) {
                        gamePreview.style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)';
                    }
                }, 300);
            }

            gameInstance.start();

            playButton.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> En cours...';
            playButton.style.background = 'rgba(150, 150, 150, 0.2)';
            playButton.style.color = '#777';
            playButton.style.cursor = 'default';
            playButton.disabled = true;

            clearPlayTimeouts();
            hintTimeoutId = setTimeout(() => {
                if (isPerfDegraded) {
                    return;
                }
                const hint = document.querySelector('.preview-hint');
                if (hint) {
                    hint.style.display = 'block';
                    hint.style.opacity = '0';
                    hint.style.transition = 'opacity 1s ease';
                    setTimeout(() => {
                        hint.style.opacity = '0.7';
                    }, 50);
                }
            }, 500);

            focusTimeoutId = setTimeout(() => {
                if (canvas) {
                    canvas.focus();
                }
            }, 100);
        }

        function handleHelpClick() {
            if (isPerfDegraded) {
                return;
            }

            const helpMsg = document.createElement('div');
            helpMsg.style.cssText = 'position: fixed; bottom: 60px; right: 20px; background: rgba(50, 50, 50, 0.85); color: #ccc; padding: 8px 12px; border-radius: 4px; font-size: 11px; z-index: 9999; max-width: 180px; border-left: 2px solid #777; font-family: monospace; backdrop-filter: blur(2px);';
            helpMsg.innerHTML = '🎮 <strong>Contrôles:</strong><br>• ESPACE = sauter<br>• R = recommencer<br><br><em>Bon jeu !</em>';
            document.body.appendChild(helpMsg);

            setTimeout(() => {
                helpMsg.style.opacity = '0';
                helpMsg.style.transition = 'opacity 0.5s ease';
                setTimeout(() => helpMsg.remove(), 500);
            }, 3500);
        }

        function resetPlayButtonAppearance() {
            if (!playButton) {
                return;
            }
            playButton.innerHTML = defaultPlayContent;
            playButton.style.background = '';
            playButton.style.color = '';
            playButton.style.cursor = '';
            playButton.disabled = false;
        }

        function enterPerfDegradedMode() {
            if (isPerfDegraded) {
                return;
            }
            isPerfDegraded = true;
            clearTimeout(initTimeoutId);
            initTimeoutId = null;
            clearPlayTimeouts();
            resetPlayButtonAppearance();
            disableControls(true);
            dimVisuals();
            window.removeEventListener('scroll', checkScroll);
            showPerfNotice('Mode économie d’énergie — le jeu est momentanément désactivé.');
            if (gameInstance) {
                gameInstance.pause();
                gameInstance = null;
            }
        }

        function exitPerfDegradedMode() {
            if (!isPerfDegraded) {
                return;
            }
            isPerfDegraded = false;
            hidePerfNotice();
            restoreVisuals();
            disableControls(false);
            resetPlayButtonAppearance();
            hasAppeared = false;
            currentGameTime = 0;
            initTimeoutId = setTimeout(initGame, 800);
        }

        function handlePerfModeChange(mode) {
            if (mode === 'degraded') {
                enterPerfDegradedMode();
            } else {
                exitPerfDegradedMode();
            }
        }

        // Initialize the game instance on-demand (user interaction)
        function ensureGameInitialized() {
            if (gameInstance) return;
            if (isPerfDegraded) return;
            if (!canvas) {
                console.warn('Canvas du jeu non trouvé');
                return;
            }

            gameSection.style.display = 'block';
            gameInstance = new MiniTrexGame('trexMiniCanvas');
            gameInstance.init();

            const originalLoop = gameInstance.gameLoop;
            gameInstance.gameLoop = function(currentTime) {
                if (originalLoop) {
                    originalLoop.call(gameInstance, currentTime);
                }

                if (gameInstance.gameState.playing) {
                    currentGameTime += 16;
                    if (helpButton && currentGameTime > 8000) {
                        helpButton.style.transition = 'opacity 0.8s ease';
                        helpButton.style.opacity = '0.5';
                        helpButton.style.pointerEvents = 'auto';
                    }
                }
            };
        }

        function initGame() {
            if (isPerfDegraded) {
                showPerfNotice('Mode économie d’énergie — le jeu reste en pause.');
                return;
            }
            // ensure initialization has occurred (init may be triggered by interaction)
            ensureGameInitialized();

            if (playButton && !playHandlerAttached) {
                playButton.addEventListener('click', handlePlayClick);
                playHandlerAttached = true;
            }

            disableControls(false);
            window.addEventListener('scroll', checkScroll, { passive: true });
            scheduleScrollCheck();
        }

        function handleDetailsToggle(event) {
            if (isPerfDegraded) {
                return;
            }
            event.preventDefault();
            const button = event.currentTarget;
            if (!detailsPanel) {
                return;
            }
            if (detailsPanel.style.display === 'none' || detailsPanel.style.display === '') {
                detailsPanel.style.display = 'block';
                button.innerHTML = '<i class="fas fa-code"></i> Cacher les détails';
            } else {
                detailsPanel.style.display = 'none';
                button.innerHTML = '<i class="fas fa-code"></i> Détails techniques';
            }
        }

        function handleSoundToggle() {
            if (isPerfDegraded) {
                return;
            }
            if (!soundButton) {
                return;
            }
            const icon = soundButton.querySelector('i');
            if (!icon) {
                return;
            }
            if (icon.classList.contains('fa-volume-mute')) {
                icon.classList.remove('fa-volume-mute');
                icon.classList.add('fa-volume-up');
                soundButton.title = 'Son activé';
            } else {
                icon.classList.remove('fa-volume-up');
                icon.classList.add('fa-volume-mute');
                soundButton.title = 'Son désactivé';
            }
        }

        function bootstrap() {
            if (isPerfDegraded) {
                    enterPerfDegradedMode();
                } else {
                    // Do not auto-init the game to avoid CPU at page load.
                    // Initialize on user interaction (play button) or when the section appears in viewport.
                    if (playButton && !playHandlerAttached) {
                        playButton.addEventListener('click', handlePlayClick);
                        playHandlerAttached = true;
                    }
                    window.addEventListener('scroll', checkScroll, { passive: true });
                    // perform an immediate check after a short delay to allow layout to settle
                    setTimeout(checkScroll, 300);
                }

            if (helpButton) {
                helpButton.style.opacity = '0';
                helpButton.style.pointerEvents = 'none';
                helpButton.addEventListener('click', handleHelpClick);
            }

            if (detailsBtn) {
                detailsBtn.addEventListener('click', handleDetailsToggle);
            }

            if (soundButton) {
                soundButton.addEventListener('click', handleSoundToggle);
            }

            if (perfStatus && typeof perfStatus.subscribe === 'function') {
                perfStatus.subscribe(handlePerfModeChange);
            }
        }

        bootstrap();
    });
})();
