# 📋 Document de Cadrage - EVOLUTION.SYS

- **Module :** Développement d'application front/back
- **Étudiant :** SAUGUES Pierre
- **Dépôt GitHub :** [LIEN GITHUB]

---

## 🎯 1. Brief Projet

### 1.1 Présentation générale
- **Nom du projet** : EVOLUTION.SYS
- **Description courte** : Un jeu de Tower Defense cyberpunk où le joueur incarne un administrateur système défendant un serveur de production. Il doit déployer des unités de défense (outils de développement) pour contrer des vagues de "bugs" (erreurs de syntaxe, fuites de mémoire, crashs critiques). Le jeu propose un mode histoire progressif et un mode survie infini.
- **Problème résolu** : Allier l'aspect ludique du jeu vidéo à l'univers technique du développement logiciel, permettant aux étudiants et développeurs de s'amuser tout en se familiarisant avec des concepts informatiques via une métaphore visuelle.
- **Public cible** : Étudiants en informatique, développeurs, et passionnés de jeux de stratégie.

### 1.2 Arborescence (Arbo)
```
[Node d'Accès] (Auth)
├── [HUB Principal] (Menu)
│   ├── [Mode Histoire] (Sélection de build)
│   ├── [Build Infini] (Survie)
│   ├── [Hardware Mods] (Upgrades permanentes)
│   ├── [System Logs] (Entity Database / Dex)
│   ├── [Hall of Fame] (Leaderboard)
│   └── [System Manual] (Tutorial)
└── [Production Node] (Zone de Jeu)
    ├── HUD (Ressources, Intégrité, Vagues)
    ├── Grille de Build (Placement des tours)
    └── AI Advisor Panel (Conseils IA)
```

### 1.3 Wireframes (Descriptions)

- **Page d'Accueil (Auth)** : Interface "CRT" rétro-informatique avec un terminal central demandant un identifiant et une clé d'accès (Password). Design minimaliste avec des effets de lueurs vertes/ambres.
- **Menu Principal (HUB)** : Tableau de bord centralisé affichant les statistiques de l'utilisateur (Crédits, Niveau Max). Boutons larges style "bouton de console" pour accéder aux différents modules.
- **Zone de Jeu (Battlefield)** :
    - **Gauche** : Grille de jeu (canvas) avec le chemin des ennemis et l'emplacement des tours.
    - **Droite** : Panneau de sélection des unités (STDOUT, IDE, CI/CD, AI Assistant).
    - **Haut** : Barre d'état (Caféine/Ressources, Intégrité du Système, Numéro de Vague).
    - **Bas** : Logs système en temps réel et zone de message de l'IA Tactical Advisor.
- **Hardware Mods (Upgrades)** : Interface type "Arbre de compétences" ou liste d'améliorations (Puissance de calcul, Efficacité énergétique) avec des icônes CPU/RAM.

### 1.4 Liste des fonctionnalités (Features)

| Priorité | Fonctionnalité | Description courte | Rôle concerné |
|----------|----------------|--------------------|---------------|
| 🔴 Must | Authentification | Inscription/Connexion sécurisée (JWT + Cookies). | Tous |
| 🔴 Must | Game Engine TD | Placement, amélioration, vente et mouvement de tours sur une grille. | Joueur |
| 🔴 Must | Story Mode | 10 niveaux progressifs avec des boss spécifiques (Spaghetti Code). | Joueur |
| 🔴 Must | Permanent Upgrades | Amélioration des statistiques via les crédits gagnés. | Joueur |
| 🔴 Must | AI Advisor | Analyse du jeu et conseils stratégiques en temps réel. | Joueur |
| 🟡 Should | Leaderboard | Classement mondial des meilleurs scores (vagues max). | Tous |
| 🟡 Should | Entity Database | Bestiaire débloqué au fur et à mesure des rencontres. | Joueur |
| 🟢 Nice | AI Lore Gen | Génération de noms et de "lore" uniques pour les boss. | Joueur |

---

## 💾 2. Modélisation de la base de données

### 2.1 MCD — Modèle Conceptuel de Données
- **ENTITÉ User**
    - username (String, Unique)
    - password (String, Hashed)
    - credits (Int)
    - maxWave (Int)
    - maxLevel (Int)
    - damageLevel (Int)
    - fusionLimitLevel (Int)
    - coffeeStartLevel (Int)
    - enemyKills (JSON String)
    - towersBuilt (JSON String)
    - discoveredEnemies (JSON String)
    - discoveredTowers (JSON String)

*(Note: Le projet étant centré sur le jeu, les relations sont simplifiées par l'usage de types JSON pour le tracking des statistiques au sein de l'entité User pour optimiser les performances de lecture/écriture en session).*

### 2.2 MLD — Modèle Logique de Données
```
user (id, username, password, credits, maxWave, maxLevel, damageLevel, fusionLimitLevel, coffeeStartLevel, enemyKills, towersBuilt, discoveredEnemies, discoveredTowers, createdAt)
```

### 2.3 MPD — Modèle Physique de Données (SQL)
```sql
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "maxWave" INTEGER NOT NULL DEFAULT 0,
    "maxLevel" INTEGER NOT NULL DEFAULT 1,
    "damageLevel" INTEGER NOT NULL DEFAULT 1,
    "fusionLimitLevel" INTEGER NOT NULL DEFAULT 1,
    "coffeeStartLevel" INTEGER NOT NULL DEFAULT 1,
    "enemyKills" TEXT NOT NULL DEFAULT '{}',
    "towersBuilt" TEXT NOT NULL DEFAULT '{}',
    "discoveredEnemies" TEXT NOT NULL DEFAULT '[]',
    "discoveredTowers" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
```

---

## 🛠️ 3. Définition de la Stack Technique

### 3.1 Frontend
| Élément | Choix | Justification |
|---------|-------|---------------|
| Framework | React 19 | Standard industriel, gestion efficace de l'état (Hooks, Context). |
| UI / CSS | Tailwind CSS | Rapidité de prototypage et design utilitaire pour le look CRT. |
| Icons | Lucide React | Bibliothèque d'icônes vectorielles légères et modernes. |
| Communication | Socket.io-client | Communication bidirectionnelle en temps réel pour le gameplay. |

### 3.2 Backend
| Élément | Choix | Justification |
|---------|-------|---------------|
| Runtime | Node.js (Express) | Performance pour les I/O, large écosystème. |
| Real-time | Socket.io | Gestion des sessions de jeu et des ticks du moteur de jeu. |
| Auth | JWT + Cookies | Authentification stateless sécurisée et facile à implémenter. |
| ORM | Prisma | Type-safety, migrations simplifiées et DX (Developer Experience) supérieure. |

### 3.3 Base de données
| Élément | Choix | Justification |
|---------|-------|---------------|
| SGBD | SQLite | Idéal pour un projet de jeu solo/multi léger, facilité de déploiement. |
| Hébergement | Local / Railway | Simplicité pour le développement et l'exposition de l'API. |

---

## 🤖 4. Fonctionnalités IA

### 4.1 Description des fonctionnalités
1.  **AI Tactical Advisor** : Un assistant "Senior Dev" qui analyse l'état actuel de la partie (position des tours, ressources restantes, vagues à venir). Il fournit des conseils stratégiques dans le log système (ex: "Attention, ta couverture mémoire est faible à l'entrée du segment B").
2.  **AI Lore & Boss Generator** : À l'apparition d'un boss, l'IA génère un nom unique, une description technique fantaisiste et un court background (lore) lié au thème du bug en question.

### 4.2 Choix technique
- **Modèle** : Google Gemini 1.5 Flash (via API).
- **Intégration** : Intégration côté backend. Le serveur envoie l'état du jeu (GameState) au modèle avec un "system prompt" spécifique pour obtenir une réponse concise et thématique.
- **Entrées** : JSON du GameState (tours, ennemis, caféine, santé).
- **Sorties** : Texte court formaté en "Logs système".

---
