// mini-trex.js - Version finale
(function() {
    'use strict';
    
    class MiniTrexGame {
        constructor(canvasId, options = {}) {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) {
                console.error(`Canvas ${canvasId} non trouvé`);
                return;
            }
            
            this.ctx = this.canvas.getContext('2d');
            this.options = {
                width: 576,
                height: 144,
                speed: 5,
                gravity: 0.45,
                jumpForce: -9,
                enableShadows: true,
                enableParticles: true,
                ...options
            }

            this.theme = {
                black: '#121212',
                cream: '#F5F5DC',
                white: '#FFFFFF',
                gray: '#888888',
                brown: '#8B4513',
                brownDark: '#5a331a'
            };
            
            this.scaleFactor = 1.3; // +30%
            
            this.objectPool = {
                particles: [],
                obstacles: [],
                mountains: []
            };
            
            // État du jeu
            this.gameState = {
                playing: false,
                score: 0,
                highScore: localStorage.getItem('trexHighScore') || 0,
                gameOver: false
            };
            
            // Lapin
            this.rabbit = {
                x: 50,
                y: this.options.height - 35,
                width: 25,
                height: 30,
                velocityY: 0,
                isJumping: false,
                jumpCount: 0
            };
            
            // Animation des oreilles
            this.rabbitEarPosition = 0;
            
            // EFFETS VISUELS
            this.particles = [];
            this.maxParticles = 15;
            this.shake = {
                intensity: 0,
                duration: 0,
                active: false
            };

            this.fx = {
                startAt: 0,
                endAt: 0
            };
            
            this.obstacles = [];
            this.gameLoopId = null;
            this.lastTime = 0;
            this.obstacleTimer = 0;
            
            // ARRIÈRE-PLAN - Montagnes
            
            this.mountains = [];
            this.mountainTimer = 0;
            this.generateInitialMountains();
            
            // DEMI-LUNE BIEN VISIBLE
            this.moon = {
                x: 80,      // Un peu à droite
                y: 55,       // Un peu plus bas
                radius: 35,  // Légèrement plus gros (28 au lieu de 24)
                phases: 0.5, // ← DEMI-LUNE (50% visible)
                glow: 0.03,     // Pas de pulsation
                craters: this.generateMoonCraters()
            };
            
            // ============ ÉTOILES FIXES SIMPLES ============
            
           this.stars = {
			   
           // ============ Étoiles ============  
           
    bigDipper: [
              ,{ x: 380, y: 110 },
               { x: 124, y: 28 },                                    
              ],   
               brightStars: [
               { x: 480, y: 10 },   
              ]        
            };
            
            // Types d'obstacles pixel art
            
            this.obstacleTypes = [
            
            // 1. PETIT CACTUS
                {
                    name: 'smallCactus',
                    width: 21,
                    height: 33,
                    isGround: true,
                    draw: (ctx, x, y) => {
            // VERSION SIMPLIFIÉE - SEULEMENT 3 RECTANGLES
                        ctx.fillStyle = this.getObstacleRampColor('cactus');
                        ctx.fillRect(x + 8, y, 6, 33); // 6×33
                        ctx.fillRect(x + 2, y + 12, 6, 6); // 6×6
                        ctx.fillRect(x + 14, y + 21, 6, 6); // 6×6
                    }
                },
            // CHIEN 8-bit ultra simple
                {
                    name: 'dog8bit',
                    width: 36,
                    height: 28,
                    isGround: true,
                    draw: (ctx, x, y) => {
                        ctx.fillStyle = this.getObstacleRampColor('dog');
                        ctx.fillRect(x + 12, y + 12, 20, 9);
                        ctx.fillRect(x + 4, y + 8, 8, 8);
                        ctx.fillRect(x, y + 12, 8, 4);
                        ctx.fillRect(x + 6, y + 4, 4, 7);
                        ctx.fillRect(x + 12, y + 4, 3, 6);
                        ctx.fillRect(x + 24, y + 12, 4, 16);
                        ctx.fillRect(x + 26, y + 12, 15, 4);
                        ctx.fillRect(x + 16, y + 20, 4, 8);
                        ctx.fillRect(x + 16, y + 20, 4, 8);
                        
                        ctx.fillStyle = this.theme.white;
                        ctx.fillRect(x + 5, y + 11, 2, 2);
                        ctx.fillRect(x + 8, y + 11, 2, 2);
                       
                        ctx.fillStyle = this.theme.black;
                        ctx.fillRect(x + 1, y + 13, 2, 2);
                    }
                },    
              // FLÈCHE MINIMALISTE (très légère)
                {
                    name: 'arrow',
                    width: 36,
                    height: 18,
                    draw: (ctx, x, y) => {
                        ctx.fillStyle = this.getObstacleRampColor('arrow');
                        ctx.fillRect(x, y + 1, 4, 2);
                        ctx.beginPath();
                        ctx.moveTo(x, y + 2);
                        ctx.lineTo(x + 4, y);
                        ctx.lineTo(x + 4, y + 4);
                        ctx.closePath();
                        ctx.fill();
                        
                        ctx.fillRect(x + 4, y + 1, 20, 2);
                        ctx.fillRect(x + 16, y, 8, 1);
                        ctx.fillRect(x + 16, y + 2, 8, 1);
                        ctx.fillRect(x + 16, y + 3, 8, 1);
                        ctx.fillRect(x + 20, y - 1, 4, 1);
                        ctx.fillRect(x + 20, y + 4, 4, 1);
                    }
                },
              // FLÈCHE HAUTE (position aérienne)
                {
                    name: 'arrowHigh',
                    width: 36,
                    height: 18,
                    isHigh: true,
                    draw: (ctx, x, y) => {
                        ctx.fillStyle = this.getObstacleRampColor('arrow');
                        ctx.fillRect(x, y + 1, 4, 2);
                        ctx.beginPath();
                        ctx.moveTo(x, y + 2);
                        ctx.lineTo(x + 4, y);
                        ctx.lineTo(x + 4, y + 4);
                        ctx.closePath();
                        ctx.fill();
                        
                        ctx.fillRect(x + 4, y + 1, 20, 2);
                        ctx.fillRect(x + 16, y, 8, 1);
                        ctx.fillRect(x + 16, y + 2, 8, 1);
                        ctx.fillRect(x + 16, y + 3, 8, 1);
                        ctx.fillRect(x + 20, y - 1, 4, 1);
                        ctx.fillRect(x + 20, y + 4, 4, 1);
                    }
                }
            ];

            // Paramètres de jeu
            this.baseSpeed = 7;
            this.speedIncrement = 0.09;
            this.maxSpeed = 18;
            
            // Niveaux de difficulté
            this.difficultyLevels = [
                { min: 0, max: 20, intervals: [1800, 3000, 4500], weights: [0.7, 0.2, 0.1] },
                { min: 21, max: 50, intervals: [1500, 2500, 4000], weights: [0.6, 0.25, 0.15] },
                { min: 51, max: 100, intervals: [1200, 2200, 3500], weights: [0.5, 0.3, 0.2] },
                { min: 101, max: 200, intervals: [1000, 1900, 3200], weights: [0.4, 0.35, 0.25] },
                { min: 201, max: 9999, intervals: [800, 1600, 2800], weights: [0.3, 0.4, 0.3] }
            ];
        }
        
        // ============ MÉTHODES D'EFFETS VISUELS AMÉLIORÉES ============
        
        generateInitialMountains() {
            for (let i = 0; i < 4; i++) {
                this.mountains.push(this.createMountain(
                    i * (this.options.width / 3),
                    true
                ));
            }
        }

        createMountain(xOffset = 0, firstBatch = false) {
            const types = [
                { height: 25, width: 80, color: '#f5f5dc' },
                { height: 35, width: 120, color: '#ffffff' },
                { height: 45, width: 160, color: '#9a9a9a' }
            ];
            
            const type = types[Math.floor(Math.random() * types.length)];
            
            return {
                x: firstBatch ? xOffset : this.options.width,
                y: this.options.height - type.height - 10,
                width: type.width,
                height: type.height,
                color: type.color,
                speed: 0.35 + Math.random() * 0.45,
                peaks: this.generateMountainPeaks(type.width, type.height)
            };
        }

        generateMountainPeaks(width, height) {
            const peaks = [];
            const peakCount = 3 + Math.floor(Math.random() * 3);
            const segmentWidth = width / (peakCount - 1);
            
            for (let i = 0; i < peakCount; i++) {
                peaks.push({
                    x: i * segmentWidth,
                    y: height * (0.3 + Math.random() * 0.7),
                    width: segmentWidth * 0.8
                });
            }
            
            return peaks;
        }

        // ============ GÉNÉRATION DES CRATÈRES DE LUNE ============
                 generateMoonCraters() {
            const craters = [];
            
            // 1-2 CRATÈRES GÉANTS
            const giantCount = 1 + Math.floor(Math.random() * 2); // 1 ou 2
            
            for (let i = 0; i < giantCount; i++) {
                // Pour couvrir TOUTE la surface : -35 à +35 (radius: 35)
                const angle = Math.random() * Math.PI * 2; // Angle aléatoire complet
                const distance = Math.random() * 25; // 0 à 25 du centre
                
                craters.push({
                    x: Math.cos(angle) * distance,      // Position circulaire
                    y: Math.sin(angle) * distance,
                    radius: 7.0 + Math.random() * 5.0,  // 7.0-12.0px (GÉANT)
                    depth: 0.6 + Math.random() * 0.4    // 0.6-1.0 (très profond)
                });
            }
            
            // 2-3 CRATÈRES MOYENS
            const mediumCount = 2 + Math.floor(Math.random() * 2); // 2-3
            
            for (let i = 0; i < mediumCount; i++) {
                // Répartition uniforme sur tout le disque
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 30; // 0 à 30 du centre
                
                craters.push({
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    radius: 3.0 + Math.random() * 3.0,   // 3.0-6.0px
                    depth: 0.3 + Math.random() * 0.4     // 0.3-0.7
                });
            }
            
            return craters;
        }
        createJumpParticles() {
    for (let i = 0; i < 8; i++) {
        let particle;
        if (this.objectPool.particles.length > 0) {
            particle = this.objectPool.particles.pop();
            // Réinitialiser
             particle.x = this.rabbit.x + 10;
             particle.y = this.rabbit.y + 25;
             particle.vx = (Math.random() - 0.5) * 3;
             particle.vy = Math.random() * -2 - 1;
             particle.size = 1 + Math.random() * 2;
             particle.life = 20 + Math.random() * 10;
             particle.color = `rgba(0, 0, 0, ${0.9 + Math.random() * 0.1})`;
        } else {
            particle = {
                x: this.rabbit.x + 10,
                y: this.rabbit.y + 25,
                vx: (Math.random() - 0.5) * 3,
                vy: Math.random() * -2 - 1,
                size: 1 + Math.random() * 2,
                life: 20 + Math.random() * 10,
                color: `rgba(0, 0, 0, ${0.9 + Math.random() * 0.1})`
            };
        }
        this.particles.push(particle);
    }
}
        
        updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.life--;
        
        if (p.life <= 0) {
            // Recycler au lieu de supprimer
            this.objectPool.particles.push(this.particles.splice(i, 1)[0]);
        }
    }
}
        
        drawParticles() {
            this.particles.forEach(p => {
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(p.x, p.y, p.size, p.size);
            });
        }
        
        applyShake(intensity = 10, duration = 15) {
            this.shake = {
                intensity: intensity,
                duration: duration,
                active: true
            };
        }
        
        updateShake() {
            if (this.shake.active && this.shake.duration > 0) {
                this.shake.duration--;
            } else {
                this.shake.active = false;
                this.shake.intensity = 0;
            }
        }
        
        // ============ DESSIN OBSTACLES SANS OMBRES ============
        drawObstacleSimple(obstacle) {
            const ctx = this.ctx;
    
            if (obstacle.type && obstacle.type.draw) {
                obstacle.type.draw(ctx, obstacle.x, obstacle.y);
            } else {
                const baseColor = obstacle.color || this.theme.brown;
                ctx.fillStyle = this.getObstacleRampColor('generic', baseColor);
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            }
        }
        
        // ============ MÉTHODES PRINCIPALES ============
        
       init() {
    // Configuration Canvas de base
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
    this.ctx = this.canvas.getContext('2d');
    
    // Détection plateforme pour optimisations
    this.isAndroid = /Android/.test(navigator.userAgent);
    this.isMobile = /Mobi|Android/i.test(navigator.userAgent);
    
    // Optimisations MOBILE (Android + iOS)
    if (this.isMobile) {
        // Mode mobile: activer optimisations silencieuses
        
        // 1. Réduire les particules
        this.maxParticles = 8;
        
        // 2. Désactiver effets gourmands sur Android bas de gamme
        const cores = navigator.hardwareConcurrency || (this.isAndroid ? 2 : 4);
        if (this.isAndroid && cores <= 2) {
            this.options.enableShadows = false;
            this.options.enableParticles = false;
        }
        
        // 3. Optimisations rendering mobile
        this.canvas.style.imageRendering = 'pixelated';
        this.ctx.imageSmoothingEnabled = false;
    }
    
    // Style visuel
    this.canvas.style.background = 'rgba(18, 18, 18, 0.6)';
    this.canvas.style.borderRadius = '2px';
    this.canvas.style.filter = 'grayscale(0.1) contrast(1)';
    
    this.bindEvents();
    
    // Jeu initialisé (log supprimé pour production)
}
        
        bindEvents() {
            document.addEventListener('keydown', (e) => {
                if (e.code === 'Space' && this.gameState.playing) {
                    this.jump();
                    e.preventDefault();
                }
                
                if (e.code === 'KeyR' && this.gameState.gameOver) {
                    this.restart();
                }
            });
            
            this.canvas.addEventListener('click', () => {
                if (this.gameState.playing) {
                    this.jump();
                }
            });
        }
        
       start() {
            if (this.gameState.playing) return;
            
            
            this.gameState.playing = true;

            const gameContainer = document.querySelector('.game-preview');
            if (gameContainer) {
                gameContainer.classList.remove('replay-state');
                const replayNote = gameContainer.querySelector('.game-replay-note');
                if (replayNote) replayNote.remove();
            }
            const playButton = document.getElementById('playButton');
            if (playButton) {
                playButton.classList.remove('replay-ready');
            }
           
            this.gameState.score = 0;
            this.rabbit.y = this.options.height - 44;
            this.rabbit.velocityY = 0;
            this.rabbit.isJumping = false;
            this.rabbit.jumpCount = 0; 
            this.obstacles = [];
            this.obstacleTimer = 0;
            this.particles = [];
            this.shake = { intensity: 0, duration: 0, active: false };
            
            this.lastTime = performance.now();
            this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));

            this.fx.startAt = performance.now();
            
            // CONDITION : filtre seulement si PAS un restart après game over
            
       if (!this.gameState.gameOver) {
		   
            // Premier démarrage → filtre actif
            
            this.canvas.style.filter = 'grayscale(0.5) contrast(1)';
            this.canvas.style.transition = 'filter 0.5s ease';
    } else {
            // Restart après game over → pas de filtre
            
            this.canvas.style.filter = 'none';
            this.canvas.style.opacity = '1';
    }
    
            // MAINTENANT on reset gameOver
            this.gameState.gameOver = false;
    
            this.updateUI();
}
        
        pause() {
            this.gameState.playing = false;
            if (this.gameLoopId) {
                cancelAnimationFrame(this.gameLoopId);
                this.gameLoopId = null;
            }
        }
        
        restart() {
            if (this.gameLoopId) {
                cancelAnimationFrame(this.gameLoopId);
                this.gameLoopId = null;
            }
            
            this.gameState = {
                playing: false,
                score: 0,
                highScore: localStorage.getItem('trexHighScore') || this.gameState.highScore,
                gameOver: false
            };
            
            this.rabbit = {
                x: 50,
                y: this.options.height - 35,
                width: 25,
                height: 30,
                velocityY: 0,
                isJumping: false,
                jumpCount: 0
            };
            
            this.obstacles = [];
            this.obstacleTimer = 0;
            this.particles = [];
            this.shake = { intensity: 0, duration: 0, active: false };
            
            //  Supprimer le filtre visuel
            this.canvas.style.filter = 'none';
            this.canvas.style.opacity = '1';
    
            this.draw();
            
            setTimeout(() => {
                this.start();
            }, 150);
        }
        
        jump() {
            if (!this.gameState.playing) return;

            if (!this.rabbit.isJumping) {
                this.rabbit.velocityY = this.options.jumpForce;
                this.rabbit.isJumping = true;
                this.rabbit.jumpCount++;
                
                this.createJumpParticles();
            }
        }
        
      gameLoop(currentTime) {
    if (!this.lastFrameTime) this.lastFrameTime = currentTime;
    let deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
    
    // CORRECTION CRITIQUE POUR ANDROID
    if (this.isAndroid) {
        // Limiter les variations extrêmes (app en background, etc.)
        deltaTime = Math.min(deltaTime, 100);  // Max 100ms = 10 FPS minimum
        deltaTime = Math.max(deltaTime, 8);    // Min 8ms = 125 FPS maximum
    }
    
    if (!this.gameState.playing) return;
    
    this.update(deltaTime);
    this.draw();
    
    this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
}
        
        update(deltaTime) {
    // Normaliser le deltaTime pour des mouvements constants à 60 FPS
    const timeScale = deltaTime / 16.67; // 16.67ms = 1 frame à 60 FPS
    
    this.rabbitEarPosition += 0.1 * timeScale; // Animation synchronisée
    
    this.updateParticles();
    this.updateShake();
    
    if (this.rabbit.isJumping && Math.random() > 0.7) {
        this.particles.push({
            x: this.rabbit.x + 5,
            y: this.rabbit.y + 35,
            vx: -1 - Math.random(),
            vy: Math.random() * 0.5,
            size: 1,
            life: 15,
            color: 'rgba(0, 0, 0, 0.45)'
        });
    }
    
    if (this.rabbit.y >= this.options.height - 44 && this.rabbit.velocityY > 0) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: this.rabbit.x + 10,
                y: this.options.height - 35,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 3,
                size: 1 + Math.random(),
                life: 10,
                color: 'rgba(120, 120, 120, 0.5)'
            });
        }
    }
    
    this.rabbit.velocityY += this.options.gravity * timeScale;
    this.rabbit.y += this.rabbit.velocityY * timeScale;

    if (this.rabbit.y > this.options.height - 35) {
        this.rabbit.y = this.options.height - 35;
        this.rabbit.velocityY = 0;
        this.rabbit.isJumping = false;
        this.rabbit.jumpCount = 0;
    }

    const speedMultiplier = 1 + (Math.floor(this.gameState.score / 10) * this.speedIncrement);
    const currentSpeed = Math.min(this.baseSpeed * speedMultiplier, this.maxSpeed);

    this.obstacleTimer += deltaTime; // Utiliser deltaTime réel pour le timer
    
    const currentLevel = this.difficultyLevels.find(
        level => this.gameState.score >= level.min && this.gameState.score <= level.max
    ) || this.difficultyLevels[0];
    
    const rand = Math.random();
    let chosenInterval;
    let cumulativeWeight = 0;
    
    for (let i = 0; i < currentLevel.intervals.length; i++) {
        cumulativeWeight += currentLevel.weights[i];
        if (rand < cumulativeWeight) {
            chosenInterval = currentLevel.intervals[i];
            break;
        }
    }
    
    const variation = 0.8 + Math.random() * 0.9;
    const actualInterval = chosenInterval * variation;

    if (this.obstacleTimer > actualInterval) {
        let obstacleType;
        const score = this.gameState.score;
        
        if (score < 20) {
            const groundTypes = this.obstacleTypes.filter(type => !type.isHigh);
            obstacleType = groundTypes[Math.floor(Math.random() * groundTypes.length)];
        } else if (score < 50) {
            if (Math.random() < 0.15) {
                const highTypes = this.obstacleTypes.filter(type => type.isHigh);
                obstacleType = highTypes[Math.floor(Math.random() * highTypes.length)];
            } else {
                const groundTypes = this.obstacleTypes.filter(type => !type.isHigh);
                obstacleType = groundTypes[Math.floor(Math.random() * groundTypes.length)];
            }
        } else if (score < 100) {
            if (Math.random() < 0.25) {
                const highTypes = this.obstacleTypes.filter(type => type.isHigh);
                obstacleType = highTypes[Math.floor(Math.random() * highTypes.length)];
            } else {
                const groundTypes = this.obstacleTypes.filter(type => !type.isHigh);
                obstacleType = groundTypes[Math.floor(Math.random() * groundTypes.length)];
            }
        } else {
            if (Math.random() < 0.40) {
                const highTypes = this.obstacleTypes.filter(type => type.isHigh);
                obstacleType = highTypes[Math.floor(Math.random() * highTypes.length)];
            } else {
                const groundTypes = this.obstacleTypes.filter(type => !type.isHigh);
                obstacleType = groundTypes[Math.floor(Math.random() * groundTypes.length)];
            }
        }
        
        let baseY;
        let yVariation;
        
        if (obstacleType.isHigh) {
            const minHeight = this.options.height * 0.3;
            const maxHeight = this.options.height * 0.5;
            baseY = minHeight + Math.random() * (maxHeight - minHeight);
            yVariation = 0;
        } else if (obstacleType.isGround) {
            baseY = this.options.height - obstacleType.height - 8;
            yVariation = 0;
        } else {
            baseY = this.options.height - obstacleType.height - 8;
            yVariation = Math.random() * 15 - 7.5;
        }
        
        const newObstacle = {
            x: this.options.width,
            y: baseY + yVariation,
            width: obstacleType.width,
            height: obstacleType.height,
            speed: currentSpeed,
            type: obstacleType
        };
        
        if (this.obstacles.length > 0) {
            const lastObstacle = this.obstacles[this.obstacles.length - 1];
            const distance = newObstacle.x - (lastObstacle.x + lastObstacle.width);
            
            const score = this.gameState.score;
            let minSpacing;
            
            if (score < 5) {
                minSpacing = 150;
            } else if (score < 10) {
                minSpacing = 100;
            } else if (score < 20) {
                minSpacing = 70;
            } else if (score < 30) {
                minSpacing = 50;
            } else if (score < 40) {
                minSpacing = 35;
            } else if (score < 50) {
                minSpacing = 25;
            } else if (score < 60) {
                minSpacing = 18;
            } else if (score < 70) {
                minSpacing = 13;
            } else if (score < 80) {
                minSpacing = 9;
            } else if (score < 90) {
                minSpacing = 6;
            } else if (score < 100) {
                minSpacing = 4;
            } else {
                minSpacing = 3;
            }
            
            if (distance < minSpacing) {
                newObstacle.x += minSpacing - distance;
            }
        }
        
        this.obstacles.push(newObstacle);
        this.obstacleTimer = 0;
    }
    
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obstacle = this.obstacles[i];
        
        // CORRECTION CRITIQUE : Appliquer timeScale au déplacement
        const speedVariation = 0.9 + Math.random() * 0.2;
        obstacle.x -= obstacle.speed * speedVariation * timeScale;
        
        if (this.checkCollision(this.rabbit, obstacle)) {
            this.gameOver();
            return;
        }
        
        if (obstacle.x + obstacle.width < 0) {
            this.obstacles.splice(i, 1);
            this.gameState.score += 1;
            
            if (this.gameState.score > this.gameState.highScore) {
                this.gameState.highScore = this.gameState.score;
                localStorage.setItem('trexHighScore', this.gameState.highScore);
            }
            
            this.updateUI();
        }
    }
    
    this.mountainTimer += deltaTime;

    if (this.mountainTimer > 3000 + Math.random() * 2000) {
        this.mountains.push(this.createMountain());
        this.mountainTimer = 0;
    }

    for (let i = this.mountains.length - 1; i >= 0; i--) {
        const mountain = this.mountains[i];
        // CORRECTION : Appliquer timeScale aux montagnes aussi
        mountain.x -= currentSpeed * mountain.speed * 0.5 * timeScale;
        
        if (mountain.x + mountain.width < 0) {
            this.mountains.splice(i, 1);
        }
    }
}
        
        draw() {
            const ctx = this.ctx;
            const now = performance.now();
            
            ctx.save();
            
            if (this.shake.active) {
                const shakeAmount = this.shake.intensity * (this.shake.duration / 20);
                const offsetX = (Math.random() - 0.5) * shakeAmount;
                const offsetY = (Math.random() - 0.5) * shakeAmount;
                ctx.translate(offsetX, offsetY);
            }
            
            ctx.clearRect(0, 0, this.options.width, this.options.height);
            
            ctx.fillRect(0, 0, this.options.width, this.options.height);
            
            // ============ DÉGRADÉ DE FOND ============
    const bgGradient = ctx.createLinearGradient(
        0, 0,
        0, this.options.height
    );
    
   
    bgGradient.addColorStop(0, 'rgba(26, 26, 26, 0.95)');  
    bgGradient.addColorStop(0.4, 'rgba(40, 40, 40, 0.9)'); 
    bgGradient.addColorStop(0.7, 'rgba(56, 56, 56, 0.85)'); 
    bgGradient.addColorStop(0.9, 'rgba(74, 74, 74, 0.85)'); 
    bgGradient.addColorStop(1, 'rgba(92, 92, 92, 0.85)');   
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, this.options.width, this.options.height);
            
            this.drawMoon();
            this.drawStars();
            this.mountains.forEach(mountain => {
                this.drawMountain(mountain);
            });
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fillRect(0, this.options.height - 8, this.options.width, 8);
            
            this.drawParticles();
            
            this.drawRabbitWithEnhancedShadow();
            
            this.obstacles.forEach(obstacle => {
                this.drawObstacleSimple(obstacle);
            });
            
            ctx.fillStyle = "rgba(245, 245, 220, 0.9)";
            ctx.font = 'bold 14px "Courier New", monospace';
            ctx.textAlign = "right";
            const scoreX = this.options.width - 15;
            ctx.fillText(`Score: ${this.gameState.score}`, scoreX, 28);
            ctx.fillText(`Record: ${this.gameState.highScore}`, scoreX, 50);
            ctx.textAlign = "left";
            
            if (this.gameState.playing && this.fx.startAt) {
                const startElapsed = now - this.fx.startAt;
                if (startElapsed < 1400) {
                    const fadeIn = Math.min(1, startElapsed / 250);
                    const fadeOut = startElapsed > 1100 ? 1 - (startElapsed - 1100) / 300 : 1;
                    const alpha = Math.max(0, Math.min(fadeIn, fadeOut));
                    ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.35})`;
                    ctx.fillRect(0, 0, this.options.width, this.options.height);

                    ctx.textAlign = 'center';
                    ctx.fillStyle = `rgba(245, 245, 220, ${alpha})`;
                    ctx.font = '16px "Courier New", monospace';
                    ctx.fillText(startElapsed < 550 ? 'Prêt ?' : 'Go !', this.options.width / 2, this.options.height / 2);
                    ctx.textAlign = 'left';
                } else {
                    this.fx.startAt = 0;
                }
            }
            
            ctx.restore();
        }
        
        drawStars() {
    const ctx = this.ctx;
    
    // Dessiner la Grande Ourse - petits points blancs
    this.stars.bigDipper.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, 1.3, 0, Math.PI * 4); // Taille fixe 1.2px
        ctx.fillStyle = 'rgba(245, 245, 220, 0.8)';
        ctx.fill();
    });
    
    // Dessiner les 3 étoiles brillantes - un peu plus grosses
    this.stars.brightStars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, 1.6, 0, Math.PI * 2); // 1.6px pour les brillantes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();
    });
}
        
        drawMountain(mountain) {
            const ctx = this.ctx;
            const x = mountain.x;
            const y = mountain.y;
            const width = mountain.width;
            const height = mountain.height;
            
            ctx.fillStyle = mountain.color;
            
            ctx.beginPath();
            ctx.moveTo(x, y + height);
            
            mountain.peaks.forEach((peak, index) => {
                const peakX = x + peak.x;
                const peakY = y + (height - peak.y);
                
                if (index === 0) {
                    ctx.lineTo(peakX, peakY);
                } else {
                    const prevPeak = mountain.peaks[index - 1];
                    const midX = x + prevPeak.x + prevPeak.width / 2;
                    ctx.lineTo(midX, y + height * 0.7);
                    ctx.lineTo(peakX, peakY);
                }
            });
            
            ctx.lineTo(x + width, y + height);
            ctx.closePath();
            ctx.fill();
        }
        
        drawMoon() {
            const ctx = this.ctx;
            const moon = this.moon;
            
            // Animation plus lente
            moon.glow = (moon.glow + 0.015) % (Math.PI * 2); 
            
            ctx.save();
            ctx.translate(moon.x, moon.y);
            
            // GRADIENT PLUS CONTRASTÉ
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, moon.radius * 1.1);
            gradient.addColorStop(0, 'rgba(245, 245, 220, 0.08)');
            gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.05)');
            gradient.addColorStop(1, 'rgba(230, 230, 230, 0.03)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, moon.radius, 0, Math.PI * 2);
            ctx.fill();
            
           // PARTIE SOMBRE PLUS OPACITÉ
            if (moon.phases < 1) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
                ctx.beginPath();
                const phaseAngle = Math.PI * 2 * moon.phases;
                ctx.arc(0, 0, moon.radius, phaseAngle - Math.PI/2, phaseAngle + Math.PI/2);
                ctx.lineTo(0, 0);
                ctx.closePath();
                ctx.fill();
            }
            
            // ============ 5 CRATÈRES ESSENTIELS ============

            // Les 5 plus grands cratères seulement
            const craters = [...moon.craters]
                  .sort((a, b) => b.radius - a.radius)
                  .slice(0, 5);

                   craters.forEach(crater => {
            // Un seul cercle par cratère
                   ctx.beginPath();
                   ctx.arc(crater.x, crater.y, crater.radius, 0, Math.PI * 2);
                   ctx.fillStyle = 'rgba(120, 120, 120, 0.3)';
                   ctx.fill();
       });

ctx.restore();
		  }
                                     
             // ============ MÉTHODE UTILITAIRE POUR AJUSTER LES COULEURS ============
        adjustColor(color, amount) {
            let usePound = false;
            
            if (color[0] === "#"){ 
                color = color.slice(1);
                usePound = true;
            }
            
            const num = parseInt(color, 16);
            let r = (num >> 16) + amount;
            let g = ((num >> 8) & 0x00FF) + amount;
            let b = (num & 0x0000FF) + amount;
            
            r = Math.min(Math.max(0, r), 255);
            g = Math.min(Math.max(0, g), 255);
            b = Math.min(Math.max(0, b), 255);
            
            return (usePound ? "#" : "") + (b | (g << 8) | (r << 16)).toString(16).padStart(6, '0');
        }

        getObstacleProgress() {
            const score = Math.min(this.gameState.score || 0, 150);
            return Math.max(0, Math.min(1, score / 150));
        }

        getObstacleRampColor(type, fallbackHex) {
            const ramps = {
                dog: ['#d0d0d0', '#000000'],
                cactus: ['#39ff14', '#0f2a12'],
                arrow: ['#c26a1d', '#5a331a'],
                generic: ['#c26a1d', '#5a331a']
            };
            const ramp = ramps[type] || [fallbackHex || this.theme.brown, '#5a331a'];
            return this.lerpHex(ramp[0], ramp[1], this.getObstacleProgress());
        }

        lerpHex(from, to, t) {
            const a = this.hexToRgb(from);
            const b = this.hexToRgb(to);
            if (!a || !b) return from;
            const r = Math.round(a.r + (b.r - a.r) * t);
            const g = Math.round(a.g + (b.g - a.g) * t);
            const bl = Math.round(a.b + (b.b - a.b) * t);
            return this.rgbToHex(r, g, bl);
        }

        hexToRgb(hex) {
            const clean = hex.replace('#', '');
            if (clean.length !== 6) return null;
            return {
                r: parseInt(clean.slice(0, 2), 16),
                g: parseInt(clean.slice(2, 4), 16),
                b: parseInt(clean.slice(4, 6), 16)
            };
        }

        rgbToHex(r, g, b) {
            const toHex = (value) => value.toString(16).padStart(2, '0');
            return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }
        
        drawRabbitWithEnhancedShadow() {
            const ctx = this.ctx;
            const rabbit = this.rabbit;
            const x = rabbit.x;
            const y = rabbit.y;
            const groundY = this.options.height - 8;
            
            const shadowSize = 12 + (rabbit.y / this.options.height) * 8;
            const shadowX = x + 6 - (shadowSize - 12) / 2;
            
            if (rabbit.isJumping) {
                const heightRatio = rabbit.y / this.options.height;
                let baseOpacity;
                let shadowHeight;
                
                if (rabbit.velocityY < -3) {
                    baseOpacity = 0.10;
                    shadowHeight = 2;
                } else if (rabbit.velocityY < 0) {
                    baseOpacity = 0.15 + heightRatio * 0.10;
                    shadowHeight = 3;
                } else if (rabbit.velocityY < 3) {
                    baseOpacity = 0.20;
                    shadowHeight = 3;
                } else {
                    baseOpacity = 0.25 + heightRatio * 0.20;
                    shadowHeight = 4;
                }
                
                ctx.fillStyle = `rgba(0, 0, 0, ${baseOpacity})`;
                ctx.fillRect(shadowX, groundY - 2, shadowSize, shadowHeight);
            } else {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.80)';
                ctx.fillRect(x + 6, groundY - 4, 14, 4);
                
                ctx.fillStyle = 'rgba(0, 0, 0, 0.40)';
                ctx.fillRect(x + 8, groundY - 6, 10, 2);
                
                ctx.fillStyle = 'rgba(0, 0, 0, 0.70)';
                ctx.fillRect(x + 7, groundY - 2, 12, 2);
                
                ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
                ctx.fillRect(x + 4, groundY - 5, 18, 1);
            }
            
            const dark = '#000';
            const medium = '#444';
            const light = '#888';

            ctx.fillStyle = medium;
            ctx.fillRect(x + 6, y + 10, 16, 12);

            ctx.fillStyle = dark;
            ctx.fillRect(x + 8, y + 5, 12, 10);

            const earOffset = Math.sin(this.rabbitEarPosition) * 1.5;

            ctx.fillRect(x + 9, y - 4 + earOffset, 4, 11);
            ctx.fillRect(x + 15, y - 6 + earOffset, 4, 13);

            ctx.fillStyle = light;
            ctx.fillRect(x + 10, y - 3 + earOffset, 2, 7);
            ctx.fillRect(x + 16, y - 5 + earOffset, 2, 9);

            ctx.fillStyle = light;
            ctx.fillRect(x + 2, y + 15, 6, 6);

            ctx.fillStyle = '#fff';
            ctx.fillRect(x + 11, y + 8, 3, 3);
            ctx.fillRect(x + 18, y + 8, 3, 3);
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(x + 12, y + 9, 1, 1);
            ctx.fillRect(x + 19, y + 9, 1, 1);

            ctx.fillStyle = dark;
            ctx.fillRect(x + 13, y + 12, 4, 3);

            ctx.fillStyle = dark;
            ctx.fillRect(x + 8, y + 22, 4, 6);
            ctx.fillRect(x + 18, y + 22, 4, 6);
            ctx.fillRect(x + 4, y + 20, 5, 8);
            ctx.fillRect(x + 21, y + 20, 5, 8);
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(x + 8, y + 10, 12, 2);
        }
        
        checkCollision(rabbit, obstacle) {
            return rabbit.x < obstacle.x + obstacle.width &&
                   rabbit.x + rabbit.width > obstacle.x &&
                   rabbit.y < obstacle.y + obstacle.height &&
                   rabbit.y + rabbit.height > obstacle.y;
        }
        
        gameOver() {
            // Game over (log supprimé pour production)
            
            this.applyShake(8, 12);
            
            setTimeout(() => {
                const gameContainer = document.querySelector('.game-preview');
                if (gameContainer) {
                    gameContainer.classList.add('replay-state');
                    const oldScore = gameContainer.querySelector('.ultra-score');
                    if (oldScore) oldScore.remove();
                    const oldNote = gameContainer.querySelector('.game-replay-note');
                    if (oldNote) oldNote.remove();

                    const note = document.createElement('div');
                    note.className = 'game-replay-note';
                    note.innerHTML = `<strong>Score:</strong> ${this.gameState.score} <span>• Appuie sur “Rejouer”</span>`;

                    const btn = gameContainer.querySelector('.play-button');
                    if (btn) btn.after(note);
                }
            }, 50);
            
            this.gameState.playing = false;
            this.gameState.gameOver = true;
            
            if (this.gameLoopId) {
                cancelAnimationFrame(this.gameLoopId);
                this.gameLoopId = null;
            }
            
            this.canvas.style.filter = 'none';
            
            const playButton = document.getElementById('playButton');
            if (playButton) {
                setTimeout(() => {
                    playButton.innerHTML = '<i class="fas fa-redo"></i> Rejouer';
                    playButton.classList.add('replay-ready');
                    playButton.disabled = false;
                }, 100);
            }
            
            this.updateUI();
        }
        
        updateUI() {
            const scoreElement = document.getElementById('miniScore');
            if (scoreElement) {
                scoreElement.textContent = this.gameState.score;
            }
            
            const gamePreview = document.getElementById('gamePreview');
            if (gamePreview) {
                if (this.gameState.playing) {
                    gamePreview.classList.add('playing');
                } else {
                    gamePreview.classList.remove('playing');
                }
            }
        }
    }
    
    window.MiniTrexGame = MiniTrexGame;
})();
