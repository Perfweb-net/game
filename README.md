# EVOLUTION.SYS

Tower Defense cyberpunk où le joueur incarne un administrateur système défendant un serveur de production contre des vagues de "bugs". Voir [`cadrage.md`](./cadrage.md) pour le brief complet (fonctionnalités, MCD/MLD/MPD, choix techniques, fonctionnalités IA).

**Repo :** https://github.com/Perfweb-net/game

## Stack

- **Frontend** : React 19 + Vite, Tailwind CSS, Lucide React, Socket.io-client
- **Backend** : Node.js / Express 5, Socket.io, JWT + cookies pour l'auth
- **Base de données** : SQLite via Prisma ORM
- **IA** : AI Tactical Advisor (heuristique locale par défaut, ou LLM via une API OpenAI-compatible — Groq, etc.)

## Arborescence

```
server/            API Express + logique temps réel (Socket.io)
  controllers/      auth, game
  middleware/        auth (JWT)
  socket/            moteur de jeu (gameLogic) + IA tactique (tacticalAdvisor)
client/             App React (Vite)
  src/
    components/      composants UI
    game/             logique/rendu canvas côté client
    hooks/            hooks (socket, état de jeu)
prisma/             schéma + migrations SQLite
tests/              tests end-to-end (Playwright)
```

## Prérequis

- Node.js ≥ 18
- npm

## Installation

Une seule commande, à la racine :

```bash
npm install
```

Elle installe les dépendances serveur, puis déclenche automatiquement
(`scripts/postinstall.js`) : l'installation des dépendances client, la
création de `.env` depuis `.env.example` (si absent), et l'application des
migrations Prisma (base SQLite). Rien d'autre à faire avant de lancer le
projet — voir plus bas.

Éditer `.env` seulement si besoin (activer l'IA via une vraie clé, changer
le port...) : voir [Variables d'environnement](#variables-denvironnement).

## Lancer en développement

Deux process en parallèle :

```bash
# Terminal 1 : API + Socket.io (port défini dans .env, 3000 par défaut)
npm run dev

# Terminal 2 : client Vite (proxy /api et /socket.io vers le serveur)
npm --prefix client run dev
```

Le client de dev est servi par Vite (voir `client/vite.config.js`) sur son propre port, avec proxy vers l'API.

## Build & lancement en production (serveur unique)

Le serveur Express sert le build du client directement depuis `public/` :

```bash
npm run build   # build le client dans ../public
npm start       # sert l'API + le front buildé sur le même port
```

`public/` est généré par le build et n'est pas versionné (voir `.gitignore`) — il faut lancer `npm run build` avant tout déploiement qui ne le fait pas automatiquement.

## Tests

Tests end-to-end avec Playwright :

```bash
npx playwright install   # une seule fois
npm test
```

Détail des scénarios couverts, bugs corrigés grâce aux tests, et protocole de test manuel : voir [`TESTING.md`](./TESTING.md).

## Variables d'environnement

Voir `.env.example` :

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | chemin de la base SQLite (Prisma) |
| `PORT` | port du serveur Express (3000 par défaut) |
| `JWT_SECRET` | secret de signature des tokens JWT (auth). Optionnel en local (valeur par défaut de secours dans le code), à définir explicitement pour toute utilisation réelle. Génère une valeur avec `openssl rand -base64 32`. |
| `ADVISOR_API_KEY` | (optionnel) active l'AI Tactical Advisor via un vrai LLM (service externe Groq, gratuit sans CB) ; sans clé, fallback heuristique 100% local, aucun compte requis |
| `ADVISOR_API_URL` / `ADVISOR_MODEL` | (optionnel) pour pointer vers une API OpenAI-compatible autre que Groq |

Aucun service externe n'est requis pour lancer le projet : la base est du
SQLite local (fichier, pas de compte à créer) et l'IA fonctionne sans clé
(mode heuristique). Groq n'est nécessaire que si on veut activer les
conseils générés par un vrai LLM.

## Suivi de projet

- **Board (MoSCoW, backlog)** : https://github.com/users/Perfweb-net/projects/2
- **Cadrage complet** (arbo, wireframes, MCD/MLD/MPD, dépendances) : [`cadrage.md`](./cadrage.md)
- **Préparation playtest** (scénarios, objectifs, instrumentation) : [`PLAYTEST.md`](./PLAYTEST.md)
- **Script de démo** : [`DEMO.md`](./DEMO.md)
