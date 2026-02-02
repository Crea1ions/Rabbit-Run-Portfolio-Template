<!-- Plan de communication minimal pour release et incidents -->
# Plan de communication — Release & incidents

Objectif
- Communiquer clairement les releases et incidents aux parties prenantes.

Parties prenantes
- Propriétaire du site (contact principal)
- Équipe technique / mainteneur
- Utilisateurs finaux (via site / email)

Canaux
- Déploiement automatique (Netlify) — notifications configurées en externe.
- GitHub releases / tags — publier release annotée.
- Email / Slack pour alertes critiques.

Template annonce release
- Titre: `Release vX.Y.Z — date`
- Résumé: changements clés (ex: restauration d'assets, nettoyage archive-dev, correctifs).
- Actions recommandées: nettoyer cache, vérifications post-déploiement.

Gestion d'incident
1. Identifier et isoler (logs, rollback si nécessaire).
2. Notifier parties prenantes via Slack/Email avec statut et ETA.
3. Appliquer correctif, tester sur staging, déployer.
4. Rédiger post-mortem bref et le stocker dans `doc/`.
# Plan de communication & changelog

## Objectif
Documenter la façon dont les nouvelles protections résilientes sont présentées aux clients, amis, relais presse ou communautés techniques, en insistant sur la combinaison d'une forme premium (parallaxe, typewriter) et d'un gardien de performance invisible (`core.js`).

## Points clés à mentionner
1. **Resilience as a feature** : le portfolio garde son élégance (hero parallex, expériences immersives) tout en dégradant silencieusement les effets quand la performance chute (`[PERF] mode degraded`).
2. **Contrat de stabilisation** : `core.js` détecte FPS, DOMContentLoaded et connexion pour déposer un `data-perf` et solliciter tous les modules (nav, galerie, jeu, contact) afin qu’ils ralentissent ensemble.
3. **Expérience invisible** : les modules utilisent `perfStatus.subscribe()` pour se mettre en pause, afficher un message clair et restaurer leurs interactions dès que la plate-forme redevient stable.
4. **Focus sur les clients** : les formulaires restent disponibles, la navigation fonctionne sans JS gourmand, la galerie affiche un fallback statique si `artworks.json` ne charge pas.

## Changelog recommandé pour la prochaine release
- Ajout d’un gardien `core.js` qui détecte la chute de FPS et notifie tous les modules via `perf:modeChange`.
- Fusion des scripts lourds dans `experience.js` et alignement sur le guard pour les animations, la biographie et les effets globaux.
- Ressources critiques (`gallery.js`, `game-manager.js`, `contact.js`, `navigation.js`) abonnés au mode dégradé pour rester accessibles dans tous les cas.
- Documentation résilience enrichie (README, REFACTORISATION_GLOBALE, docs/communication-plan.md, docs/qa-procedure.md) pour partager la stratégie avec les contributeurs et clients.

## Canaux & cadence
- **Email** : envoyer un court message aux référents (art director, mécènes) avec un lien vers le README mis à jour et la preuve de [PERF] logs.
- **Netlify deploy hook** : mentionner dans le post-deploy message (via Slack ou RSS) que la release contient `core.js` et les docs QA.
- **Documentation publique** : mettre en avant la section `🎯 Stratégie de résilience` du README sur la page GitHub/Netlify.
- **Suivi** : conserver une entrée `changelog` dans ce doc ou un résumé `CHANGES.md` si besoin ultérieur.
