## 🎨 Portfolio Artistique - Artist Name

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)
![Canvas](https://img.shields.io/badge/HTML5_Canvas-FF6B6B?style=for-the-badge&logo=html5&logoColor=white)

Portfolio professionnel présentant les œuvres de Artist Name, artiste spécialisé en techniques traditionnelles : brou de noix, fusain et pastel à l'huile.
Dernières mises à jour (Jan 2026) : corrections de l'interface (header/footer), ajustements parallax, et amélioration de l'accessibilité.

## 📦 Utiliser ce dépôt comme template

Ce dossier est prêt à être transformé en template GitHub. Pour l'utiliser :

- Placez vos images d'œuvres dans `assets/images/oeuvres/<technique>/` (ex : `assets/images/oeuvres/fusain/1.jpg`).
- Mettez à jour `artworks.json` : conservez le champ `image` relatif (ex : `fusain/1.jpg`).
- Tester localement :

```bash
python3 -m http.server 8000
# ou
npx serve .
```

- Déployer : reliez le dépôt à Netlify (le fichier `netlify.toml` est fourni). Poussez sur la branche `main` pour déploiement automatique.

Notes : Les scripts `js/gallery.js` et `js/experience.js` gèrent des stratégies de repli pour les images et respectent le guard de performance exposé par `core.js`.

## 📊 Statistiques du projet
| Métrique | Valeur | État |
|----------|--------|------|
| Œuvres cataloguées | 26 œuvres | ✅ Complète |
| Pages HTML | 6 pages fonctionnelles | ✅ Complète |
| Techniques représentées | 3 techniques distinctes | ✅ Complète |
| Images organisées | 30+ images HD | ✅ Optimisée |
| Jeu interactif | Canvas HTML5 60 FPS | ✅ Fonctionnel |

## Répartition des œuvres

    Fusain : 23 œuvres

    Brou de noix : 2 œuvres

    Pastel à l'huile : 1 œuvre

    Total : 26 œuvres documentées dans artworks.json
    
    ## 📸 Aperçu visuel

### 🏠 Page d'accueil
![Capture d'écran de la page d'accueil](screenshots/preview/home.jpg)
*Interface principale avec navigation, hero section et galerie - [Voir en grand](#)*

### 🖼️ Galerie fusain (plein écran)
![Capture de la galerie fusain](screenshots/preview/fusain-gallery.jpg)
*Interface épurée dédiée aux 23 œuvres au fusain - [Voir en grand](#)*

### 🎮 Démonstration technique interactive
![Capture du jeu intégré](screenshots/preview/game-action.jpg)
*Jeu "Mini T-Rex Runner" en action avec obstacles - [Voir en grand](#)*

> *Les captures montrent le design responsive et l'intégration harmonieuse du jeu dans le portfolio artistique.*

## 🚀 Fonctionnalités principales
### 🖼️ Galerie artistique professionnelle

    Navigation par technique : 3 galeries dédiées (fusain, brou de noix, pastel)

    Lightbox intégré : Visualisation plein écran avec navigation clavier

    Base de données JSON : 26 œuvres avec métadonnées complètes (titres, dimensions, années)

    Filtres dynamiques : Tri par technique sur la page d'accueil

## Nouvelles fonctions (mise à jour 2026)
- `experience.js` : module unique qui regroupe l'ensemble des animations, du texte machine à écrire et des effets parallaxe tout en réagissant au `core.js` de résilience.
  - `initGlobalFeatures()` : active/désactive une parallaxe légère selon le breakpoint et la page.
  - `initBiography()` : déplacé/centralisé pour `biography.html` avec configuration optimisée (typing, scroll, breakpoints, performance) et un mode sécurité déclenché par `core.js`.
  - Gestion adaptative du mode (desktop/tablet/mobile) et bascule fine des comportements (parallaxe, images mobiles, animations) en fonction du détecteur de performance.
- `js/gallery.js` : chargement robuste du catalogue
  - `fetchArtworks()` : utilise `XMLHttpRequest` pour compatibilité `file://` avec fallback en mémoire si le chargement échoue.
  - Fonctions utilitaires : `formatDimensions()` et `formatTechnique()` pour afficher proprement les métadonnées.
  - Détection `perf:modeChange` (via `core.js`) pour basculer en mode économie et afficher un message quand la page est lente ou dégradée.
- `js/game/mini-trex.js` : mini-jeu Canvas enrichi
  - Classe `MiniTrexGame` : gestion du jeu, pool d'objets, obstacles variés, particules, sauvegarde du `highScore` dans `localStorage`.
  - Paramètres configurables : vitesse, gravité, jumpForce, activation des effets visuels.
  - Contrôles : Espace / clic pour sauter, `R` pour recommencer.
- `js/game/game-manager.js` : interface UI et boutons qui s'abonnent à `core.js` pour suspendre le jeu et afficher un message de mode dégradé lorsque `perf:modeChange` déclenche une économie de ressources.

## 🛡️ Stratégie de résilience

- **Personas critiques**
  1. **L'explorateur mobile** (4G/3G, milieu rural) : a besoin d'un accès rapide aux œuvres sans attendre les animations.
  2. **Le curateur en galerie** (desktop performant) : attend une expérience premium parallax/typewriter, mais tolère un switch vers `core.js` lorsqu'un signal de perf arrive.
  3. **Le client pressé** (contact/formulaire) : doit pouvoir écrire et soumettre un message même si le reste du site est réduit.

- **Fils conducteurs**
  - `core.js` détecte FPS, latence et connexion, pose `data-perf` et émet `perf:modeChange` avec traces `[PERF] mode ...`.
  - `experience.js`, `gallery.js`, `game/game-manager.js`, `contact.js` et `navigation.js` respectent cette API : ils basculent en mode économie, informent l'utilisateur et restaurent leurs effets quand `perfStatus` redevient `ok`.
  - Une documentation claire (ci-dessous) sert de contrat pour tout contributeur qui souhaite ajouter un module conscient du guard.

## 📢 Communication & changelog

- Release story : versionner chaque push par `doc/communication-plan.md`, qui liste les faits saillants (mode sécurité, guard `core.js`, documentation QA) et les canaux ciblés (clients, amis, Netlify deploy hooks).
- Sommaire pour clients : les nouvelles protections maintiennent l'esthétique tout en fermant les portes à la lenteur (écran de chargement remplacé par un fallback stable, message clair sur les formulaires, jeu optionnel).
- Suite du plan : le `README` et `REFACTORISATION_GLOBALE.md` renvoient vers ces nouvelles `docs/` pour que chaque équipe sache quoi mentionner dans ses communications.
- Lien QA : la [procédure QA](doc/qa-procedure.md) liste les vérifications avant Netlify et explicite le workflow manuel/automatisé associé aux protections.

Ces ajouts sont documentés ici pour ne modifier que les parties concernées du README. Si tu as un backup précis à restaurer, fournis-le et je n'appliquerai que les diff minimaux entre les deux versions.

## 🎮 Démonstration technique interactive

    Jeu "Mini T-Rex Runner" : Adaptation du jeu Chrome Dino en vanilla JavaScript

    Canvas HTML5 optimisé : 60 FPS stables, animations fluides

    Système de progression : Difficulté croissante, record persistant

    Effets visuels : Particules, ombres dynamiques, vibration au collision

## 📱 Design & Performance

    Responsive complet : Mobile-first, 4 breakpoints (480px, 768px, 1024px, 1200px)

    Architecture CSS modulaire : 7 fichiers organisés par fonction

    Chargement optimisé : Lazy loading, scripts defer, images WebP-ready

    Accessibilité : Navigation clavier, contrastes WCAG, ARIA labels

## 🏗️ Structure technique


**portfolio-template/**
- **📄 Pages HTML (6)**
  - `index.html` - Page d'accueil avec jeu intégré
  - `biography.html` - Biographie complète
  - `contact.html` - Formulaire Netlify Forms
  - `galerie-*.html` - 3 galeries techniques

- **🎨 CSS modulaire (7 fichiers)**
  - `main.css` - Import principal
  - `variables.css` - Variables design system
  - `typography.css` - Hiérarchie typographique
  - `layout.css` - Grilles et conteneurs
  - `components.css` - Header, footer, navigation
  - `gallery.css` - Styles galerie et lightbox
  - `gem.css` - Styles spécifiques au jeu

- **⚡ JavaScript organisé**
  - `navigation.js` - Menu responsive
    - `navigation.js` - Menu responsive + gestion de l'état actif dans le footer
  - `gallery.js` - Gestion galerie + JSON
  - `contact.js` - Formulaire avec feedback
  - `utils.js` - Fonctions utilitaires
  - `core.js` - Guard de performance (`perf:modeChange`) partagé par `experience.js`, `gallery.js` et `game-manager.js`
  - **`game/`** - DÉMONSTRATION TECHNIQUE
    - `mini-trex.js` - Jeu principal (Canvas, 1200 lignes)
    - `game-manager.js` - Gestion interactions UI
    - `game-loader.js` - Chargement optimisé
  ## 🛡️ Perf guard partagé

  - `core.js` expose `window.__GRF_PERF_STATUS` : `mode`, `isDegraded()`, `setMode()` et `subscribe(fn)` pour recevoir les changements.
  - Les modules `experience.js`, `gallery.js` et `game/game-manager.js` gardent un singleton performant en vérifiant `isDegraded()` avant d’afficher des animations lourdes et en s’abonnant à `perf:modeChange` pour basculer automatiquement en mode économie.
  - `contact.js` suspend l’envoi et affiche un message quand `isDegraded()` est vrai, pendant que `navigation.js` désactive le scroll header/menu mobile et se repose jusqu’au retour à `ok`.
  - Les galeries plein écran chargent aussi `core.js` puis `experience.js` (avec `navigation.js` quand utile) pour que `gallery-fullscreen.js` puisse respecter le guard, afficher un fallback et réagir à `perf:modeChange`.
  - Exemple de callback :
    ```javascript
    const perfStatus = window.__GRF_PERF_STATUS;
    const unsubscribe = perfStatus.subscribe((mode, payload) => {
        if (mode === 'degraded') {
          // arrêter les gros effets
        } else {
          // restaurer les interactions
        }
    });
    ```
    Le rappel est détaché en appelant `unsubscribe()` quand le module se décharge.

- **📊 Données & Assets**
  - `artworks.json` - Base de données (26 œuvres)
  - **`assets/images/oeuvres/`** - 26 œuvres HD organisées
    - `fusain/` - 23 dessins au fusain
    - `brou_de_noix/` - 2 portraits au brou de noix
    - `pastel_a_huile/` - 1 composition au pastel
  - `favicon/` - Icônes multi-formats

- **`screenshots/`** - Visuels pour README
  - `preview/`
    - `fusain-gallery.jpg`
    - `game-action.jpg`
    - `home.jpg`

- **🔧 Configuration & Docs**
  - `netlify.toml` - Déploiement automatisé
  - `robots.txt` - Optimisation SEO
  - `sitemap.xml` - Sitemap pour moteurs de recherche
  - `README.md` - Cette documentation

## 🎯 Pages du site
🏠 Page d'accueil (/)

    Présentation artistique avec hero image

    Galerie principale avec filtres par technique

    Jeu interactif "Mini T-Rex Runner" intégré

    Navigation vers les galeries spécialisées

## 📖 Biographie (/biography.html)

    Parcours artistique détaillé (texte enrichi)

    Présentation des 3 techniques de prédilection

    Photos d'illustration professionnelles

    Call-to-action vers contact

## 📞 Contact (/contact.html)

    Formulaire Netlify Forms fonctionnel

    Modal de confirmation avec animation

    Coordonnées complètes (email, localisation)

    Validation frontend + backend

## 🖼️ Galeries dédiées (/galerie-*.html)

    Interface plein écran épurée

    Lightbox avec navigation (flèches, ESC, clavier)

    Design noir profond pour mettre en valeur les œuvres



    Navigation fluide entre les galeries

## 🛠️ Stack technique
Frontend

    HTML5 : Structure sémantique + Canvas pour le jeu

    CSS3 : Variables CSS, Grid, Flexbox, Animations

    JavaScript ES6+ : Modules, classes, async/await

    JSON : Base de données structurée des œuvres

Design System

    Polices : Playfair Display (titres) + Inter (corps)

    Palette : Noir profond (#121212) + Crème (#F5F5DC)

    Note de style : Tous les titres et sous-titres du portfolio sont forcés
    à la couleur #8B4513 via une règle globale ajoutée dans `css/optimized.css`.
    Cette surcharge (`!important`) assure une lisibilité cohérente sur
    les fonds sombres et clairs ; modifiez `css/optimized.css` pour personnaliser.

    Espacements : Système cohérent (0.5rem → 8rem)

    Breakpoints : 480px, 768px, 1024px, 1200px

Intégrations

    Google Fonts : Typographie optimisée

    Font Awesome 6 : Icônes vectorielles

    Netlify Forms : Gestion des contacts

    HTML5 Canvas : Jeu interactif

## 🎮 Détails du jeu "Mini T-Rex Runner"
Caractéristiques techniques
javascript

class MiniTrexGame {
    // Canvas 480x120px optimisé pour intégration
    // Physique réaliste : gravité, saut, vitesse progressive
    // 4 types d'obstacles avec difficulté croissante
    // Système de particules pour les effets visuels
    // Sauvegarde locale du record persistant
}

Contrôles

    ESPACE ou CLIC : Sauter

    R : Recommencer (game over)

    ESC : Quitter le lightbox

Optimisations mobiles

    Détection automatique Android/iOS

    Réduction des particules sur mobiles bas de gamme

    Image rendering optimisé (pixelated sur mobile)

    Touch events supportés

☁️ Déploiement sur Netlify
Configuration automatisée (netlify.toml)
toml

[build]
  publish = "."
  command = "echo 'No build needed'"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

Étapes de déploiement

    Push sur Git : git push origin main

    Connecter Netlify : Import depuis dépôt Git

    Configuration automatique : netlify.toml détecté

    Déploiement : ~30 secondes

    HTTPS gratuit : Let's Encrypt automatique

Domain personnalisé

    Nom de domaine : guillhem.fr (configurable)

    DNS : Records A pointant vers Netlify

    HTTPS : Redirection automatique HTTP → HTTPS

## 📈 Métriques de performance

Métrique	            Objectif	                    État actuel

Temps de chargement   	< 3s	                        ✅ Optimisé
Score Lighthouse	    > 90/100	                    ⚡ À mesurer
Accessibilité	WCAG    2.1 AA	                        ✅ 85%+
SEO	Sémantique          complète	                    ✅ Optimisé
Mobile-friendly	     100% responsive	                ✅ Validé

## 🐛 Dépannage

Jeu non fonctionnel
bash

#" Vérifier dans la console :

1. "✅ Jeu initialisé - Desktop/Mobile"
2. Pas d'erreurs rouges
3. Canvas détecté et dimensionné

Images non chargées
bash

## Solutions :
1. Vérifier les chemins dans artworks.json  
3. Tester avec serveur local (pas file://)
3. Vérifier permissions fichiers

Formulaire Netlify
bash

## Étapes :

1. Attendre 5min après déploiement pour activation
2. Vérifier onglet "Forms" dans Netlify Dashboard
3. Tester avec email valide

## 🔄 Workflow de développement

Environnement local
bash

## Méthode Python (recommandée)

1. python3 -m http.server 8000
2. Ouvrir http://localhost:8000

## Alternatives

npx serve .          # Node.js
php -S localhost:8000 # PHP

## 🧱 Résilience & Observabilité

- `docs/resilience-architecture.md` détaille le contrat, les phases, les métriques et les scénarios de chaos (heartbeat, offline, intégrité).
- `js/heartbeat.js`, `js/data-integrity.js` et `js/user-metrics.js` enrichissent `core.js` et alimentent le dashboard `dashboard/resilience-dashboard.html` (opt-in via `localStorage.setItem('grf-resilience-dashboard','enabled')`).
- `scripts/generate-artworks-data.js` sort un bundle `js/artworks-data.js` versionné (SHA-256 + timestamp), `scripts/run-resilience-tests.js` vérifie les données + scénarios, et `.github/workflows/resilience.yml` déclenche la suite sur chaque push.
- `tests/chaos-scenarios.json` formalise les scénarios de chaos que la suite automatisée et les contributeurs doivent reproduire.
- Endpoint santé : `/.netlify/functions/health-check` expose la version du jeu de données, l'état de la build et un statut `200/503` pour Netlify ou les outils de surveillance.
- `dashboard/resilience-dashboard.html` journalise maintenant les `sessions` et `events` dans la console à chaque rafraîchissement, pour suivre visuellement les transitions sans quitter le tableau de bord.

Structure Git
bash

## Commit type

git commit -m "🎨 [DESIGN] Description"
git commit -m "🔧 [FIX] Correction bug"
git commit -m "✨ [FEAT] Nouvelle fonctionnalité"
git commit -m "📝 [DOC] Mise à jour documentation"

## 🤝 Contribution

Ce projet est personnel mais ouvert aux suggestions techniques :

    Fork le projet

    Créer une branche : git checkout -b feature/amelioration

    Commiter : git commit -m '✨ [FEAT] Description claire'

## 📄 Licence & Droits

    Œuvres d'art : © Artist Name - Tous droits réservés

    Code source : Usage personnel et éducatif

    Reproduction : Interdite sans autorisation écrite

## 🙏 Remerciements

    Icônes : Font Awesome 6

    Polices : Google Fonts (Playfair Display, Inter)

    Hébergement : Netlify

    Jeu original : Chrome Dino Game (Google)

    Badges : Shields.io
    
    Deepseek : https://deepseek.com 
           
## Site en ligne : www.guillhem.fr

# Contact technique : contact@example.com

## Releases

- **v1.1.0** (2026-02-01) — Audit & cleanup
  - Déplacement des fichiers de développement vers `archive-dev/` pour alléger la racine.
  - Restauration des fichiers runtime et assets essentiels nécessaires en production (`js/core.js`, autres `js/`, `css/`, images).
  - Ajout de `doc/qa-procedure.md` et `doc/communication-plan.md` pour standardiser les vérifications et la communication.
  - Tag annoté `v1.1.0` créé et poussé vers `origin`.
  - Validations exécutées: `verify.sh`, vérifications JS, contrôles HTTP sur pages publiques et test du formulaire contact (Netlify).

Voir les fichiers `doc/` pour les procédures et le plan de communication détaillés.




