# Préparation du playtest interne

## Objectif du playtest

Valider, avant la démo, que le cœur de boucle (placer/améliorer des tours,
survivre aux vagues, progresser en Story Mode) est jouable de bout en bout
sans bug bloquant, et mesurer où les joueurs décrochent ou se perdent.

## Scénarios à faire jouer

| # | Scénario | Ce qu'on observe |
|---|---|---|
| 1 | Nouveau joueur : inscription → tutoriel → Story Mode niveau 1 | Le joueur comprend-il seul l'objectif (placer, améliorer, fusionner) sans aide ? Temps jusqu'au premier placement de tour. |
| 2 | Progression Story Mode niveaux 1 → 3 | Difficulté perçue croissante et cohérente ? Abandon avant la fin ? |
| 3 | Boss (niveau 5 "Spaghetti") | Le boss est-il perçu comme un pic de difficulté clair (vs frustrant) ? |
| 4 | Mode Infini, 5+ vagues | Le joueur reste-t-il engagé sans objectif de fin explicite ? |
| 5 | AI Tactical Advisor | Les conseils affichés sont-ils lus/jugés utiles, ou ignorés ? |
| 6 | Upgrades permanentes (MODS) après une partie | Le joueur comprend-il l'intérêt des crédits gagnés ? |

## Objectifs mesurables (seuils de succès)

- **Taux de complétion niveau 1** ≥ 80% des testeurs (sans aide extérieure)
- **Temps jusqu'au premier placement de tour** ≤ 60s après le lancement du niveau
- **0 crash / erreur bloquante** sur l'ensemble des sessions playtest
- **Taux d'abandon** (session quittée avant la fin d'une vague en cours) < 20%
- Au moins 3 des 4 types de tours utilisés par joueur en moyenne (mesure de
  la lisibilité du choix stratégique)

## Instrumentation (logs & compteurs)

Le serveur écrit un log structuré JSON (une ligne par évènement) dans
`logs/playtest.log` (non versionné, généré à l'exécution) :

- `session_start` : `userId`, `mode`, `levelId`
- `session_end` : `userId`, `mode`, `levelId`, `isWin`, `wave` atteinte,
  `durationSec`, `towersBuilt` (compteur par type), `kills` (compteur par
  type d'ennemi), `earnedCredits`
- `session_abandoned` : même chose, émis à la déconnexion si la session
  n'a pas été menée à son terme (bug ou abandon)

Exemple de ligne :

```json
{"ts":"2026-07-10T07:44:29.606Z","event":"session_start","userId":108,"mode":"story","levelId":1}
{"ts":"2026-07-10T07:44:35.912Z","event":"session_end","userId":108,"mode":"story","levelId":1,"isWin":true,"wave":4,"durationSec":92,"towersBuilt":{"tower_console":3,"tower_ide":1},"kills":{"enemy_syntax":18},"earnedCredits":102}
```

Pendant/après le playtest, ces lignes permettent de calculer directement les
métriques ci-dessus, par exemple :

```bash
# Taux de complétion niveau 1 (isWin=true / total session_end du niveau 1)
grep '"levelId":1' logs/playtest.log | grep session_end

# Répartition d'usage des tours
grep session_end logs/playtest.log | jq -s 'map(.towersBuilt) | reduce .[] as $t ({}; . * $t)'

# Sessions abandonnées (drop-off) par vague
grep session_abandoned logs/playtest.log
```

## Grille d'observation (à remplir par testeur)

| Joueur | Niveau atteint | Complété ? | Temps 1er placement | A remarqué l'Advisor ? | Point de friction observé |
|---|---|---|---|---|---|
|   |   |   |   |   |   |
