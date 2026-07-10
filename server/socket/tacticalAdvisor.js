/**
 * AI Tactical Advisor — un "Senior Dev" qui analyse la partie en cours et
 * donne des conseils stratégiques (couverture des tours, ressources, vagues).
 *
 * Deux niveaux :
 *   1. Un moteur d'analyse heuristique 100% local (aucune clé requise).
 *   2. Une couche LLM OPTIONNELLE et GRATUITE pour reformuler le conseil façon
 *      Senior Dev. Compatible avec toute API OpenAI-compatible.
 *
 * Pour activer le LLM, mets une clé dans .env (ex. Groq, gratuit, sans CB) :
 *   ADVISOR_API_KEY=gsk_xxx              (ou GROQ_API_KEY=gsk_xxx)
 *   ADVISOR_API_URL=https://api.groq.com/openai/v1/chat/completions   (défaut)
 *   ADVISOR_MODEL=llama-3.1-8b-instant                                (défaut)
 * Sans clé, le mode heuristique prend le relais automatiquement.
 */

const DEFAULT_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.1-8b-instant';

function loadConfig(env = process.env) {
    const apiKey = env.ADVISOR_API_KEY || env.GROQ_API_KEY || null;
    return {
        apiKey,
        url: env.ADVISOR_API_URL || DEFAULT_URL,
        model: env.ADVISOR_MODEL || DEFAULT_MODEL,
        enabled: !!apiKey, // le LLM ne s'active que si une clé est fournie
    };
}

// --- Helpers d'analyse -----------------------------------------------------

const SEGMENT_LABELS = { A: "l'entrée", B: 'le milieu', C: 'la sortie PROD' };

function segmentOf(idx, len) {
    const r = idx / Math.max(1, len - 1);
    if (r < 0.34) return 'A';
    if (r < 0.67) return 'B';
    return 'C';
}

// Pour chaque case du chemin : nombre de tours qui peuvent la frapper.
function computeCoverage(s, towerStats) {
    return s.path.map(cell =>
        s.towers.reduce((cnt, t) => {
            const range = towerStats[t.type]?.range || 0;
            const dist = Math.hypot(cell.x - t.x, cell.y - t.y);
            return cnt + (dist <= range ? 1 : 0);
        }, 0)
    );
}

// Plus long segment contigu de cases NON couvertes.
function longestBlindRun(coverage) {
    let best = { len: 0, start: -1, end: -1 };
    let curStart = -1;
    for (let i = 0; i < coverage.length; i++) {
        if (coverage[i] === 0) {
            if (curStart === -1) curStart = i;
            const len = i - curStart + 1;
            if (len > best.len) best = { len, start: curStart, end: i };
        } else {
            curStart = -1;
        }
    }
    return best;
}

function suggestTower(coffee, towerStats) {
    if (coffee >= towerStats.tower_ai.cost) return 'AI_DEV';
    if (coffee >= towerStats.tower_cicd.cost) return 'CI_CD';
    if (coffee >= towerStats.tower_ide.cost) return 'IDE_ENV';
    if (coffee >= towerStats.tower_console.cost) return 'STDOUT';
    return null;
}

function nextWaveInfo(s) {
    if (s.mode === 'story' && Array.isArray(s.predefinedWaves)) {
        const w = s.predefinedWaves[s.waveIndex];
        if (w) return { type: w.type, count: w.count, remaining: Math.max(0, w.count - s.spawnCounter) };
        return { type: null, last: true };
    }
    return { infinite: true, wave: s.wave };
}

const ENEMY_FR = {
    enemy_syntax: { name: 'Syntax Errors', tip: 'rapides mais fragiles' },
    enemy_bus: { name: 'Bus Errors', tip: 'gros HP, lents — du dégât mono-cible' },
    enemy_memory: { name: 'Memory Leaks', tip: 'rapides — sature avec du nombre' },
    boss_spaghetti: { name: 'BOSS Spaghetti', tip: 'concentre tout ton burst' },
    boss_outage: { name: 'BIG BOSS Outage', tip: 'mur de feu obligatoire' },
};

// Construit une analyse structurée de la session.
function analyzeSession(s, ctx) {
    const { towerStats } = ctx;
    const coverage = computeCoverage(s, towerStats);
    const len = coverage.length;
    const coveredCount = coverage.filter(c => c > 0).length;
    const coveragePct = len ? Math.round((coveredCount / len) * 100) : 0;

    const blind = longestBlindRun(coverage);
    const blindSeg = blind.start >= 0 ? segmentOf(blind.start, len) : null;

    // Couverture moyenne par tiers (A/B/C) pour trouver le maillon faible.
    const thirds = { A: [], B: [], C: [] };
    coverage.forEach((c, i) => thirds[segmentOf(i, len)].push(c));
    const avg = arr => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
    const segAvg = { A: avg(thirds.A), B: avg(thirds.B), C: avg(thirds.C) };
    const weakSeg = ['A', 'B', 'C'].sort((a, b) => segAvg[a] - segAvg[b])[0];

    const enemyCounts = {};
    s.enemies.forEach(e => { enemyCounts[e.type] = (enemyCounts[e.type] || 0) + 1; });
    const bossOnField = s.enemies.some(e => e.isBoss);

    return {
        livesPct: s.maxHealth ? s.health / s.maxHealth : 1,
        lives: s.health,
        maxLives: s.maxHealth,
        coffee: s.coffee,
        towerCount: s.towers.length,
        towerTypes: s.towers.reduce((m, t) => (m[t.type] = (m[t.type] || 0) + 1, m), {}),
        coveragePct,
        blindLen: blind.len,
        blindSeg,
        weakSeg,
        suggested: suggestTower(s.coffee, towerStats),
        next: nextWaveInfo(s),
        enemyCounts,
        bossOnField,
        wave: s.wave,
        mode: s.mode,
    };
}

// --- Conseil heuristique (sans LLM) ----------------------------------------

function heuristicTip(a) {
    const loc = SEGMENT_LABELS[a.weakSeg] || 'le chemin';
    const blindLoc = SEGMENT_LABELS[a.blindSeg] || loc;

    // Aucune tour : conseil de démarrage.
    if (a.towerCount === 0) {
        return "Aucune défense déployée. Pose 2-3 STDOUT près de l'entrée (segment A) pour farmer du café tôt.";
    }
    // Intégrité critique.
    if (a.livesPct < 0.34) {
        return `🔴 INTEGRITY CRITIQUE (${a.lives}/${a.maxLives}). Colmate ${loc} : déplace ou vends une tour pour densifier le point de fuite.`;
    }
    // Boss en approche ou sur le terrain.
    if (a.bossOnField || (a.next && (a.next.type === 'boss_spaghetti' || a.next.type === 'boss_outage'))) {
        return `⚠️ BOSS en vue. Empile du burst mono-cible (IDE_ENV / AI_DEV) sur un tronçon droit ${a.bossOnField ? 'MAINTENANT' : 'avant la vague'} — les STDOUT ne suffiront pas.`;
    }
    // Gros trou de couverture.
    if (a.blindLen >= 3) {
        return `Trou de couverture : ${a.blindLen} cases sans aucune tour vers ${blindLoc}. Un ennemi peut passer sans être touché — bouche-le.`;
    }
    // Vague lourde de Bus Errors.
    if (a.next && a.next.type === 'enemy_bus' && (a.next.remaining || a.next.count) >= 4) {
        return `Vague de ${a.next.remaining || a.next.count}× Bus Errors (${ENEMY_FR.enemy_bus.tip}). Privilégie IDE_ENV plutôt que de l'AoE dispersée.`;
    }
    // Beaucoup de café qui dort.
    if (a.suggested && a.coffee >= 300) {
        return `Tu dors sur ☕${a.coffee}. Déploie un ${a.suggested} pour renforcer ${loc} avant que ça déborde.`;
    }
    // Vague de Memory Leaks rapides.
    if (a.next && a.next.type === 'enemy_memory') {
        return `Memory Leaks rapides en approche. Du STDOUT en nombre les ralentit mieux qu'un seul gros canon — étale ta couverture.`;
    }
    // Couverture faible globale.
    if (a.coveragePct < 60) {
        return `Couverture du chemin à ${a.coveragePct}%. Point faible sur ${loc} — ajoute une tour là pour ne rien laisser filer.`;
    }
    // Tout va bien : économise pour la suite.
    return `Défense stable (${a.coveragePct}% du chemin couvert, ${a.lives}/${a.maxLives} ❤️). Mets du café de côté pour encaisser la montée en puissance.`;
}

// --- Conseil LLM (optionnel) -----------------------------------------------

function describeForLLM(a) {
    const towers = Object.entries(a.towerTypes).map(([t, n]) => `${n}×${t}`).join(', ') || 'aucune';
    const enemies = Object.entries(a.enemyCounts).map(([t, n]) => `${n}×${t}`).join(', ') || 'aucun';
    let next = 'inconnue';
    if (a.next?.last) next = 'aucune (dernière vague en cours)';
    else if (a.next?.infinite) next = `mode infini, vague ${a.next.wave} (difficulté croissante)`;
    else if (a.next?.type) next = `${a.next.remaining ?? a.next.count}× ${a.next.type}`;

    return [
        `Mode: ${a.mode} | Vague: ${a.wave}`,
        `Intégrité base: ${a.lives}/${a.maxLives} vies`,
        `Café (ressource): ${a.coffee}`,
        `Tours posées: ${towers}`,
        `Couverture du chemin: ${a.coveragePct}%`,
        `Plus gros trou non couvert: ${a.blindLen} cases vers ${a.blindSeg ? SEGMENT_LABELS[a.blindSeg] : 'aucun'}`,
        `Segment le plus faible: ${SEGMENT_LABELS[a.weakSeg] || '?'}`,
        `Ennemis sur le terrain: ${enemies}`,
        `Prochaine menace: ${next}`,
    ].join('\n');
}

const SYSTEM_PROMPT = `Tu es un Senior Dev sarcastique mais bienveillant qui coache un joueur de tower-defense sur le thème du développement logiciel (les ennemis sont des bugs, les tours des outils de dev, la ressource est du café ☕).

VOCABULAIRE DU JEU — n'utilise QUE ces noms, n'invente JAMAIS d'autres tours ou ennemis :
Tours (du moins cher au plus cher) :
- STDOUT (☕50) : portée courte, dégâts faibles, cadence rapide. Tour de base.
- IDE_ENV (☕150) : longue portée, gros dégâts mono-cible. Idéal contre les gros HP.
- CI_CD (☕300) : dégâts de ZONE (AoE). Idéal contre les groupes.
- AI_DEV (☕1000) : très longue portée, dégâts énormes. Tour ultime.
Ennemis :
- Syntax Error : rapide, peu de HP.
- Bus Error : lent, gros HP (utilise IDE_ENV/AI_DEV en mono-cible).
- Memory Leak : rapide, HP moyens.
- BOSS Spaghetti / BIG BOSS Outage : énormément de HP, concentre tout le burst.
Zones du chemin : "entrée" (début), "milieu", "sortie PROD" (juste avant la base).

À partir de l'état de la partie, donne UN SEUL conseil tactique, court et actionnable.
Règles STRICTES:
- Réponds en français (jargon dev/franglais bienvenu), ton "terminal hacker".
- Une seule phrase, max 140 caractères, pas de markdown, pas de guillemets.
- Désigne la zone par "entrée", "milieu" ou "sortie PROD" (JAMAIS "segment A/B/C") ET cite un nom de tour EXACT de la liste ci-dessus.`;

async function llmTip(analysis, cfg) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    try {
        const res = await fetch(cfg.url, {
            method: 'POST',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.apiKey}` },
            body: JSON.stringify({
                model: cfg.model,
                max_tokens: 80,
                temperature: 0.85,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: describeForLLM(analysis) },
                ],
            }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        let text = data?.choices?.[0]?.message?.content?.trim();
        if (!text) return null;
        text = text.replace(/^["'`]+|["'`]+$/g, '').replace(/\s+/g, ' ').trim();
        if (text.length > 180) text = text.slice(0, 177) + '...';
        return text;
    } catch {
        return null; // timeout, réseau, quota… → fallback heuristique
    } finally {
        clearTimeout(timer);
    }
}

// --- Orchestrateur ----------------------------------------------------------

function createAdvisor(env = process.env) {
    const cfg = loadConfig(env);
    if (cfg.enabled) {
        console.log(`[Advisor] LLM activé (${cfg.model} @ ${new URL(cfg.url).host}).`);
    } else {
        console.log('[Advisor] Mode heuristique local (aucune clé API détectée). Voir tacticalAdvisor.js pour activer un LLM gratuit.');
    }

    return {
        enabled: cfg.enabled,
        async getTip(s, ctx) {
            const analysis = analyzeSession(s, ctx);
            if (cfg.enabled) {
                const ai = await llmTip(analysis, cfg);
                if (ai) return { text: ai, source: 'ai' };
            }
            return { text: heuristicTip(analysis), source: 'heuristic' };
        },
        // exposés pour les tests
        _analyze: analyzeSession,
        _heuristic: heuristicTip,
    };
}

module.exports = { createAdvisor, analyzeSession, heuristicTip };
