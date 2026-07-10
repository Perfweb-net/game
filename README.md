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

```bash
# à la racine : dépendances serveur
npm install

# dépendances client
npm --prefix client install

# variables d'environnement
cp .env.example .env
# éditer .env si besoin (clé IA optionnelle, port...)

# base de données (SQLite + Prisma)
npm run migrate
```

## Lancer en développement

Deux process en parallèle :

```bash
# Terminal 1 : API + Socket.io (port défini dans .env, 3001 par défaut)
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
| `PORT` | port du serveur Express |
| `ADVISOR_API_KEY` | (optionnel) active l'AI Tactical Advisor via un vrai LLM ; sans clé, fallback heuristique local |
| `ADVISOR_API_URL` / `ADVISOR_MODEL` | (optionnel) pour pointer vers une API OpenAI-compatible autre que Groq |
