# Stratégie de test & stabilité

## Tests automatisés (E2E — Playwright)

`tests/ui.spec.js` couvre les parcours critiques via navigateur réel :

| Test | Parcours couvert |
|---|---|
| Verify Game UI and Tower Interaction | Inscription → menu → Story Mode → niveau 1 → placement de tour → sélection de tour |
| Upgrade then sell a tower updates resources | Placement → amélioration → vente d'une tour, cohérence des ressources (☕) |
| Permanent upgrades screen | Écran MODS, achat refusé si crédits insuffisants |
| Leaderboard screen loads without error | Navigation Hall of Fame sans erreur |

```bash
npm run build         # build client -> public/
npm start              # lance le serveur (autre terminal)
npx playwright install # une seule fois
npm test               # lance les 4 tests
```

Ces tests ont été exécutés **20+ fois consécutives sans échec** pendant cette
session de stabilisation (voir historique git) — cible : 0 flakiness avant
playtest.

### Bugs critiques corrigés grâce à ces tests
1. **Socket connecté avant authentification** : le cookie JWT posé par
   `/api/signup`/`/api/login` arrivait après l'établissement du handshake
   Socket.io, donc toute première partie d'un nouvel utilisateur échouait
   silencieusement (aucune session créée côté serveur).
2. **Décalage d'un clic sur le canvas** : la position cliquée était lue depuis
   un state React (`mousePos`) mis à jour de façon asynchrone par
   `onMouseMove`, pouvant ne pas être encore "flush" au moment du clic.
3. **Clic perdu pendant la création de session** : `createSession` fait un
   `await prisma.user.findUnique(...)` ; un clic de placement arrivant avant
   la fin de cette requête était silencieusement ignoré par le serveur
   (`if (!s) return;`). Le client ignore désormais les clics tant que le
   premier `gameStateUpdate` n'est pas arrivé.

## Protocole de test manuel (ce que l'E2E ne couvre pas)

À exécuter avant chaque playtest interne :

- [ ] **Auth** : inscription, déconnexion, reconnexion avec le même compte,
      tentative de connexion avec un mauvais mot de passe (message d'erreur clair)
- [ ] **Story Mode** : compléter le niveau 1 en entier (victoire), vérifier le
      déblocage du niveau 2, perdre volontairement une partie (0 intégrité)
      et vérifier l'écran `SYSTEM_CRASH`
- [ ] **Boss** : atteindre le niveau 5 (Spaghetti) et 10 (Production Down),
      vérifier que le boss inflige bien la perte totale de vies au passage
- [ ] **Mode Infini** : jouer au moins 5 vagues, vérifier la montée en
      difficulté (fréquence/variété d'ennemis)
- [ ] **4 types de tours** : placer, améliorer au niveau max (fusionLimit),
      déplacer, vendre — pour chacun des 4 types
- [ ] **AI Tactical Advisor** : vérifier qu'un conseil apparaît (mode LLM si
      `ADVISOR_API_KEY` configurée, sinon fallback heuristique) sans bloquer
      le jeu si l'appel échoue/timeout
- [ ] **Persistance** : crédits/niveau max/stats bien sauvegardés en base
      après une partie (rafraîchir la page, vérifier `/api/me`)
- [ ] **Vitesse de jeu** : x1/x2/x4 et pause fonctionnent sans désync serveur/client
- [ ] **Responsive minimal** : jouable sur une fenêtre réduite (pas de zone
      cliquable hors-champ)

## Limites connues / dette de test

- Pas de tests unitaires sur `gameLogic.js` (moteur de combat, spawning,
  pathing) — seulement couvert indirectement par l'E2E niveau 1.
- Pas de CI configurée (les tests ne tournent qu'en local pour l'instant).
- `tacticalAdvisor.js` (appel LLM externe) n'est pas testé automatiquement.
