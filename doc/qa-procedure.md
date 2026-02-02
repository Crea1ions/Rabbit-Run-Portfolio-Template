<!-- Procedure de QA concise pour vérification avant mise en ligne -->
# Procédure QA — Vérification rapide

But
- Assurer l'intégrité fonctionnelle et visuelle du site avant push/merge.

Fréquence
- Avant tout push sur `main` pour mise en production ou release.

Étapes (rapide)
1. Exécuter le script d'intégrité: `bash verify.sh`.
2. Vérifier la syntaxe JS: `node --check js/*.js js/game/*.js`.
3. Lancer un contrôle HTTP local: ouvrir `index.html`, `biography.html`, `contact.html` et pages galerie.
4. Vérifier les assets: assurer qu'aucune image référencée ne renvoie 404.
5. Tester le formulaire contact en pré-prod (envoyer un message de test).
6. Vérifications perf: contrôler les logs `core.js` pour messages anormaux.

Critères d'acceptation
- Pas de 404 critiques sur pages publiques.
- Scripts essentiels chargés (`core.js`, `experience.js`, `data-integrity.js`, etc.).
- Formulaire de contact fonctionnel sur l'environnement de staging/production.

Responsables
- Auteur du changement: déclenche la procédure.
- Responsable QA/maintien: validation finale et merge.

Remarques
- Pour les contrôles plus approfondis, lancer la suite de tests automatisés (si disponible) et consulter les logs CI/Netlify.
# Procédure QA avant déploiement

Objectif : garantir que le portfolio se comportera correctement sur Netlify, que les guards activent des modes dégradés silencieux et que les fonctions critiques (formulaire, galerie, jeu) restent accessibles.

## Étapes
1. **Installer les dépendances locales** (si besoin) :
   ```bash
   npm install  # si tu ajoutes des outils lint/tests
   ```
2. **Vérifications rapides** :
   ```bash
   bash verify.sh
   ```
   - `components.css` contient bien `.nav` (coverage basic) ;
   - `gallery.css` contient deux ombres (vérifie que le CSS n'est pas vide) ;
   - `gallery.js` recharge des templates `innerHTML` ;
   - Au moins une image est présente dans `assets/images/oeuvres/`.
3. **Nouvelle étape QA : mode performance**
   - Vérifie `core.js` contient `console.info("[PERF]")` et `window.__GRF_PERF_STATUS` ;
   - `js/contact.js` et `js/navigation.js` doivent mentionner `isPerfDegraded`/`perfStatus.subscribe`.
   - `doc/communication-plan.md` et `doc/qa-procedure.md` sont ajoutés et listés dans `README`.
4. **Tests manuels**
   - Ouvrir `index.html`, déclencher le jeu et observer les logs `[PERF] mode degraded`. Lorsque le focus revient, vérifier que `game-manager` réinitialise le bouton.
   - Ouvrir `contact.html`, désactiver JavaScript (si possible) et vérifier que le formulaire reste utilisable (basic HTML fallback).
   - Parcourir `galerie-fusain.html` et `biography.html` pour vérifier que les fallbacks s'affichent si un `perf` degrade.
5. **Documenter les résultats**
   - Ajouter dans un ticket ou log (ou résumé dans `doc/communication-plan.md`) les anomalies détectées.
   - S'assurer que `README` mentionne les sections QA (liens additionnels) et que la procédure correspond à ton check-list.

## Fréquence
- Avant chaque push vers `main`/`production`.
- Après modification des assets critiques (`assets/`, `js/game/`, `js/gallery.js`).
- Après introduction de nouveaux scripts/perf guard.
