const { PrismaClient } = require('@prisma/client');
const { createAdvisor } = require('./tacticalAdvisor');
const { logEvent } = require('../playtestLogger');
const prisma = new PrismaClient();

const createEmptyGrid = () => Array.from({ length: 15 }, () => Array(20).fill(0));

const LEVELS = [
    {
        id: 1, name: "Initial Commit", reward: 100, lives: 20, startCoffee: 150,
        map: (() => {
            const g = createEmptyGrid();
            for(let x=0; x<15; x++) g[2][x] = 1;
            g[0][0] = 3; g[1][0] = 1; g[2][0] = 1; g[2][14] = 2;
            return g;
        })(),
        path: [{x:0,y:0},{x:0,y:1},{x:0,y:2},{x:1,y:2},{x:2,y:2},{x:3,y:2},{x:4,y:2},{x:5,y:2},{x:6,y:2},{x:7,y:2},{x:8,y:2},{x:9,y:2},{x:10,y:2},{x:11,y:2},{x:12,y:2},{x:13,y:2},{x:14,y:2}],
        waves: [{ count: 6, type: 'enemy_syntax', interval: 55 }, { count: 10, type: 'enemy_syntax', interval: 40 }, { count: 14, type: 'enemy_syntax', interval: 30 }]
    },
    {
        id: 2, name: "Merge Hell", reward: 150, lives: 18, startCoffee: 200,
        map: (() => {
            const g = createEmptyGrid();
            g[0][0] = 3; g[1][0] = 1; 
            for(let x=0; x<20; x++) g[2][x] = 1;
            g[3][19] = 1;
            for(let x=1; x<20; x++) g[4][x] = 1;
            g[4][1] = 2;
            return g;
        })(),
        path: [{x:0,y:0},{x:0,y:1},{x:0,y:2},{x:1,y:2},{x:2,y:2},{x:3,y:2},{x:4,y:2},{x:5,y:2},{x:6,y:2},{x:7,y:2},{x:8,y:2},{x:9,y:2},{x:10,y:2},{x:11,y:2},{x:12,y:2},{x:13,y:2},{x:14,y:2},{x:15,y:2},{x:16,y:2},{x:17,y:2},{x:18,y:2},{x:19,y:2},{x:19,y:3},{x:19,y:4},{x:18,y:4},{x:17,y:4},{x:16,y:4},{x:15,y:4},{x:14,y:4},{x:13,y:4},{x:12,y:4},{x:11,y:4},{x:10,y:4},{x:9,y:4},{x:8,y:4},{x:7,y:4},{x:6,y:4},{x:5,y:4},{x:4,y:4},{x:3,y:4},{x:2,y:4},{x:1,y:4}],
        waves: [{ count: 10, type: 'enemy_syntax', interval: 45 }, { count: 6, type: 'enemy_bus', interval: 70 }, { count: 14, type: 'enemy_syntax', interval: 30 }]
    },
    {
        id: 3, name: "Memory Leak", reward: 200, lives: 15, startCoffee: 220,
        map: (() => {
            const g = createEmptyGrid();
            for(let y=0; y<10; y++) g[y][5] = 1;
            for(let x=5; x<15; x++) g[9][x] = 1;
            g[0][5] = 3; g[9][14] = 2;
            return g;
        })(),
        path: [{x:5,y:0},{x:5,y:1},{x:5,y:2},{x:5,y:3},{x:5,y:4},{x:5,y:5},{x:5,y:6},{x:5,y:7},{x:5,y:8},{x:5,y:9},{x:6,y:9},{x:7,y:9},{x:8,y:9},{x:9,y:9},{x:10,y:9},{x:11,y:9},{x:12,y:9},{x:13,y:9},{x:14,y:9}],
        waves: [{ count: 8, type: 'enemy_memory', interval: 50 }, { count: 6, type: 'enemy_syntax', interval: 35 }, { count: 12, type: 'enemy_memory', interval: 35 }]
    },
    {
        id: 5, name: "Spaghetti Monster (Boss)", isBoss: true, reward: 500, lives: 15, startCoffee: 250,
        map: (() => {
            const g = createEmptyGrid();
            for(let x=0; x<10; x++) g[0][x] = (x===0?3:1);
            g[1][9] = 1;
            for(let x=1; x<10; x++) g[2][x] = 1;
            g[2][0] = 2;
            return g;
        })(),
        path: [{x:0,y:0},{x:1,y:0},{x:2,y:0},{x:3,y:0},{x:4,y:0},{x:5,y:0},{x:6,y:0},{x:7,y:0},{x:8,y:0},{x:9,y:0},{x:9,y:1},{x:9,y:2},{x:8,y:2},{x:7,y:2},{x:6,y:2},{x:5,y:2},{x:4,y:2},{x:3,y:2},{x:2,y:2},{x:1,y:2},{x:0,y:2}],
        waves: [
            { count: 8, type: 'enemy_syntax', interval: 45 },
            { count: 6, type: 'enemy_bus', interval: 60 },
            { count: 10, type: 'enemy_syntax', interval: 30 },
            { count: 1, type: 'boss_spaghetti', interval: 100 }
        ]
    },
    {
        id: 10, name: "Production Down (BIG BOSS)", isBoss: true, reward: 2000, lives: 25, startCoffee: 450,
        map: (() => {
            const g = createEmptyGrid();
            for(let x=0; x<20; x++) g[7][x] = 1;
            g[7][0] = 3; g[7][19] = 2;
            return g;
        })(),
        path: Array.from({length:20}, (_,i) => ({x:i, y:7})),
        waves: [
            { count: 12, type: 'enemy_syntax', interval: 40 },
            { count: 8, type: 'enemy_bus', interval: 55 },
            { count: 10, type: 'enemy_memory', interval: 40 },
            { count: 8, type: 'enemy_bus', interval: 45 },
            { count: 1, type: 'boss_outage', interval: 120 }
        ]
    }
];

const INFINITE_MAP = [
    [3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const INFINITE_MAP_PATH = [
    {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 2, y: 1}, {x: 2, y: 2},
    {x: 3, y: 2}, {x: 4, y: 2}, {x: 5, y: 2}, {x: 6, y: 2}, {x: 7, y: 2},
    {x: 7, y: 3}, {x: 7, y: 4}, {x: 8, y: 4}, {x: 9, y: 4}, {x: 10, y: 4},
    {x: 11, y: 4}, {x: 12, y: 4}, {x: 12, y: 5}, {x: 12, y: 6}, {x: 11, y: 6},
    {x: 10, y: 6}, {x: 9, y: 6}, {x: 8, y: 6}, {x: 7, y: 6}, {x: 6, y: 6},
    {x: 6, y: 7}, {x: 6, y: 8}, {x: 5, y: 8}, {x: 4, y: 8}, {x: 3, y: 8},
    {x: 2, y: 8}, {x: 2, y: 9}, {x: 2, y: 10}, {x: 3, y: 10}, {x: 4, y: 10},
    {x: 5, y: 10}, {x: 6, y: 10}, {x: 7, y: 10}, {x: 8, y: 10}, {x: 9, y: 10},
    {x: 10, y: 10}, {x: 11, y: 10}, {x: 12, y: 10}, {x: 13, y: 10}, {x: 14, y: 10},
    {x: 15, y: 10}, {x: 15, y: 11}, {x: 15, y: 12}, {x: 16, y: 12}, {x: 17, y: 12},
    {x: 18, y: 12}, {x: 19, y: 12}
];

class GameLogic {
    constructor(io) {
        this.io = io;
        this.sessions = {};
        this.towerStats = {
            'tower_console': { cost: 50, range: 3, damage: 10, cooldown: 30, name: 'STDOUT' },
            'tower_ide': { cost: 150, range: 6, damage: 50, cooldown: 60, name: 'IDE_ENV' },
            'tower_cicd': { cost: 300, range: 4, damage: 100, cooldown: 90, name: 'CI_CD_PIPELINE', isAoE: true },
            'tower_ai': { cost: 1000, range: 10, damage: 200, cooldown: 120, name: 'AI_ASSISTANT' }
        };
        // leakCost = nombre de "vies" consommées quand l'ennemi atteint la base.
        // Les petits mobs comptent 1, les plus gros davantage. Un boss qui passe = game over.
        this.enemyTypes = {
            'enemy_syntax': { hp: 30, speed: 0.05, reward: 10, type: 'enemy_syntax', leakCost: 1 },
            'enemy_bus': { hp: 120, speed: 0.02, reward: 25, type: 'enemy_bus', leakCost: 4 },
            'enemy_memory': { hp: 80, speed: 0.04, reward: 20, type: 'enemy_memory', leakCost: 2 },
            'boss_spaghetti': { hp: 1200, speed: 0.01, reward: 500, type: 'boss_spaghetti', isBoss: true, leakCost: 15 },
            'boss_outage': { hp: 5000, speed: 0.005, reward: 2000, type: 'boss_outage', isBoss: true, leakCost: 25 }
        };
        // AI Tactical Advisor ("Senior Dev")
        this.advisor = createAdvisor(process.env);
    }

    async createSession(socketId, userId, mode = 'infinite', levelId = null) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        let config = { map: INFINITE_MAP, path: INFINITE_MAP_PATH, waves: null, lives: 20, startCoffee: 150 };
        if (mode === 'story') {
            const level = LEVELS.find(l => l.id === levelId) || LEVELS[0];
            config = { map: level.map, path: level.path, waves: level.waves, lives: level.lives, startCoffee: level.startCoffee };
        }
        const startCoffee = config.startCoffee + (user.coffeeStartLevel - 1) * 20;
        this.sessions[socketId] = {
            userId, mode, levelId, tick: 0, coffee: startCoffee, health: config.lives, maxHealth: config.lives, wave: 1,
            towers: [], enemies: [], projectiles: [], map: config.map, path: config.path, predefinedWaves: config.waves,
            waveIndex: 0, spawnCounter: 0, speed: 1, spawnTimer: 0,
            upgrades: { damageMult: 1 + (user.damageLevel - 1) * 0.2, fusionLimit: user.fusionLimitLevel + 1 },
            stats: { kills: {}, built: {} },
            advisorTick: 0, nextAdviseAt: 45, advisorBusy: false, lastTip: ''
        };
        logEvent('session_start', { userId, mode, levelId });
    }

    update() {
        for (const socketId in this.sessions) {
            const s = this.sessions[socketId];
            if (!s) continue;
            if (s.speed > 0) {
                for (let i = 0; i < s.speed; i++) {
                    s.tick++;
                    this.handleSpawning(s, socketId);
                    this.moveEnemies(s, socketId);
                    this.towerCombat(s);
                    this.moveProjectiles(s);
                }
            }
            this.maybeAdvise(s, socketId);
            this.io.to(socketId).emit('gameStateUpdate', this.getState(s));
        }
    }

    // Déclenche périodiquement le Tactical Advisor (async, non bloquant).
    maybeAdvise(s, socketId) {
        s.advisorTick++;
        if (s.speed === 0 || s.advisorBusy) return;       // pas pendant la pause / si déjà en cours
        if (s.advisorTick < s.nextAdviseAt) return;
        s.nextAdviseAt = s.advisorTick + 180;             // ~6s entre deux conseils (cadence réelle, indép. de la vitesse)
        s.advisorBusy = true;
        this.advisor.getTip(s, { towerStats: this.towerStats, enemyTypes: this.enemyTypes })
            .then(tip => {
                s.advisorBusy = false;
                if (!this.sessions[socketId]) return;     // partie terminée entre-temps
                if (tip && tip.text && tip.text !== s.lastTip) {
                    s.lastTip = tip.text;
                    this.io.to(socketId).emit('advisorTip', { text: tip.text, source: tip.source, ts: Date.now() });
                }
            })
            .catch(() => { s.advisorBusy = false; });
    }

    handleSpawning(s, socketId) {
        if (s.mode === 'story') {
            const currentWave = s.predefinedWaves[s.waveIndex];
            if (!currentWave) { if (s.enemies.length === 0) this.winLevel(socketId); return; }
            s.spawnTimer++;
            if (s.spawnTimer >= currentWave.interval) {
                s.spawnTimer = 0;
                this.spawnEnemy(s, currentWave.type);
                s.spawnCounter++;
                if (s.spawnCounter >= currentWave.count) { s.spawnCounter = 0; s.waveIndex++; s.wave++; }
            }
        } else {
            // Mode infini : la vague (palier de difficulté) progresse avec le temps,
            // indépendamment de la vitesse de jeu. ~600 ticks/vague (~20s à vitesse 1).
            s.wave = 1 + Math.floor(s.tick / 600);
            s.spawnTimer++;
            const spawnInterval = Math.max(15, 100 - (s.wave * 3));
            if (s.spawnTimer >= spawnInterval) {
                s.spawnTimer = 0;
                // Plus la vague est haute, plus les ennemis lourds deviennent fréquents.
                const r = Math.random();
                const busChance = Math.min(0.35, 0.05 + s.wave * 0.01);
                const memChance = Math.min(0.45, 0.15 + s.wave * 0.015);
                let type = 'enemy_syntax';
                if (r < busChance) type = 'enemy_bus';
                else if (r < busChance + memChance) type = 'enemy_memory';
                this.spawnEnemy(s, type, Math.pow(1.12, s.wave - 1));
            }
        }
    }

    spawnEnemy(s, type, waveScale = 1) {
        const stats = this.enemyTypes[type];
        s.enemies.push({
            id: `enemy_${Date.now()}_${Math.random()}`, type: stats.type, hp: stats.hp * waveScale, maxHp: stats.hp * waveScale,
            speed: stats.speed, reward: stats.reward, leakCost: stats.leakCost || 1, pathIndex: 0, progress: 0, x: s.path[0].x, y: s.path[0].y, isBoss: stats.isBoss || false
        });
    }

    moveEnemies(s, socketId) {
        for (let i = s.enemies.length - 1; i >= 0; i--) {
            const enemy = s.enemies[i];
            enemy.progress += enemy.speed;
            if (enemy.progress >= 1) { enemy.progress = 0; enemy.pathIndex++; }
            if (enemy.pathIndex >= s.path.length - 1) { s.health -= enemy.leakCost; s.enemies.splice(i, 1); continue; }
            const current = s.path[enemy.pathIndex];
            const next = s.path[enemy.pathIndex + 1];
            enemy.x = current.x + (next.x - current.x) * enemy.progress;
            enemy.y = current.y + (next.y - current.y) * enemy.progress;
        }
        if (s.health <= 0) this.endGame(socketId);
    }

    towerCombat(s) {
        s.towers.forEach(tower => {
            const stats = this.towerStats[tower.type];
            if (!tower.lastFired) tower.lastFired = 0;
            const cooldown = stats.cooldown / (tower.level || 1);
            if (s.tick - tower.lastFired >= cooldown) {
                const target = s.enemies.find(enemy => {
                    const dist = Math.sqrt(Math.pow(enemy.x - tower.x, 2) + Math.pow(enemy.y - tower.y, 2));
                    return dist <= stats.range;
                });
                if (target) {
                    tower.lastFired = s.tick;
                    s.projectiles.push({
                        id: `proj_${Date.now()}_${Math.random()}`, x: tower.x + 0.5, y: tower.y + 0.5,
                        targetId: target.id, damage: stats.damage * s.upgrades.damageMult * (tower.level || 1), speed: 0.3, isAoE: stats.isAoE
                    });
                }
            }
        });
    }

    moveProjectiles(s) {
        for (let i = s.projectiles.length - 1; i >= 0; i--) {
            const proj = s.projectiles[i];
            const target = s.enemies.find(e => e.id === proj.targetId);
            if (!target) { s.projectiles.splice(i, 1); continue; }
            const dx = (target.x + 0.5) - proj.x;
            const dy = (target.y + 0.5) - proj.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 0.3) {
                if (proj.isAoE) {
                    s.enemies.forEach(e => {
                        const d = Math.sqrt(Math.pow(e.x - target.x, 2) + Math.pow(e.y - target.y, 2));
                        if (d < 2) this.damageEnemy(s, e, proj.damage);
                    });
                } else {
                    this.damageEnemy(s, target, proj.damage);
                }
                s.projectiles.splice(i, 1);
            } else { proj.x += (dx / dist) * proj.speed; proj.y += (dy / dist) * proj.speed; }
        }
    }

    damageEnemy(s, enemy, dmg) {
        enemy.hp -= dmg;
        if (enemy.hp <= 0) {
            const idx = s.enemies.indexOf(enemy);
            if (idx > -1) {
                s.coffee += enemy.reward;
                s.stats.kills[enemy.type] = (s.stats.kills[enemy.type] || 0) + 1;
                s.enemies.splice(idx, 1);
            }
        }
    }

    async winLevel(socketId) {
        const s = this.sessions[socketId];
        const level = LEVELS.find(l => l.id === s.levelId);
        this.io.to(socketId).emit('levelClear', { reward: level.reward });
        this.endGame(socketId, true);
    }

    async endGame(socketId, isWin = false) {
        const s = this.sessions[socketId];
        if (!s) return;
        const user = await prisma.user.findUnique({ where: { id: s.userId } });
        const earnedCredits = Math.floor(Object.values(s.stats.kills).reduce((a, b) => a + b, 0) / 10) + (isWin ? (LEVELS.find(l=>l.id===s.levelId)?.reward || 0) : 0);
        const currentKills = JSON.parse(user.enemyKills);
        for (const type in s.stats.kills) currentKills[type] = (currentKills[type] || 0) + s.stats.kills[type];
        const currentBuilt = JSON.parse(user.towersBuilt);
        for (const type in s.stats.built) currentBuilt[type] = (currentBuilt[type] || 0) + s.stats.built[type];
        const discoveredEnemies = new Set(JSON.parse(user.discoveredEnemies));
        Object.keys(s.stats.kills).forEach(k => discoveredEnemies.add(k));
        const discoveredTowers = new Set(JSON.parse(user.discoveredTowers));
        Object.keys(s.stats.built).forEach(k => discoveredTowers.add(k));

        let newMaxLevel = user.maxLevel;
        if (isWin && s.mode === 'story') {
            newMaxLevel = Math.max(user.maxLevel, s.levelId + 1);
        }

        await prisma.user.update({
            where: { id: s.userId },
            data: {
                credits: user.credits + earnedCredits, maxWave: Math.max(user.maxWave, s.wave), maxLevel: newMaxLevel,
                enemyKills: JSON.stringify(currentKills), towersBuilt: JSON.stringify(currentBuilt),
                discoveredEnemies: JSON.stringify(Array.from(discoveredEnemies)), discoveredTowers: JSON.stringify(Array.from(discoveredTowers))
            }
        });
        logEvent('session_end', {
            userId: s.userId, mode: s.mode, levelId: s.levelId, isWin, wave: s.wave,
            durationSec: Math.round(s.tick / 30), towersBuilt: s.stats.built, kills: s.stats.kills, earnedCredits
        });
        this.io.to(socketId).emit('gameOver', { earnedCredits, wave: s.wave, isWin });
        delete this.sessions[socketId];
    }

    getState(s) {
        return {
            tick: s.tick, coffee: s.coffee, health: s.health, maxHealth: s.maxHealth, wave: s.wave,
            towers: s.towers, enemies: s.enemies, projectiles: s.projectiles, map: s.map,
            towerStats: this.towerStats
        };
    }

    handlePlaceTower(socketId, { type, x, y }) {
        const s = this.sessions[socketId];
        if (!s) return;
        const stats = this.towerStats[type];
        if (s.coffee < stats.cost) { this.io.to(socketId).emit('insufficientCoffee'); return; }
        if (!s.map[y] || s.map[y][x] !== 0) return;
        if (s.towers.find(t => t.x === x && t.y === y)) return;
        s.coffee -= stats.cost;
        s.towers.push({ id: `tower_${Date.now()}`, type, x, y, level: 1, totalSpent: stats.cost });
        s.stats.built[type] = (s.stats.built[type] || 0) + 1;
    }

    handleUpgradeTower(socketId, { towerId }) {
        const s = this.sessions[socketId];
        if (!s) return;
        const tower = s.towers.find(t => t.id === towerId);
        if (!tower) return;
        const upgradeCost = this.towerStats[tower.type].cost * tower.level;
        if (s.coffee < upgradeCost) { this.io.to(socketId).emit('insufficientCoffee'); return; }
        if (tower.level >= s.upgrades.fusionLimit) return;
        s.coffee -= upgradeCost;
        tower.level++;
        tower.totalSpent += upgradeCost;
    }

    handleSellTower(socketId, { towerId }) {
        const s = this.sessions[socketId];
        if (!s) return;
        const index = s.towers.findIndex(t => t.id === towerId);
        if (index === -1) return;
        s.coffee += Math.floor(s.towers[index].totalSpent * 0.3);
        s.towers.splice(index, 1);
    }

    handleMoveTower(socketId, { towerId, newX, newY }) {
        const s = this.sessions[socketId];
        if (!s) return;
        const tower = s.towers.find(t => t.id === towerId);
        if (!tower) return;
        const moveCost = Math.floor(tower.totalSpent * 0.5);
        if (s.coffee < moveCost) { this.io.to(socketId).emit('insufficientCoffee'); return; }
        if (!s.map[newY] || s.map[newY][newX] !== 0) return;
        if (s.towers.find(t => t.x === newX && t.y === newY)) return;
        s.coffee -= moveCost;
        tower.x = newX; tower.y = newY;
    }

    handleSetSpeed(socketId, speed) {
        const s = this.sessions[socketId];
        if (s) s.speed = Math.min(Math.max(speed, 0), 8);
    }
}

module.exports = GameLogic;
