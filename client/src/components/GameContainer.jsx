import { useEffect, useRef, useState } from 'react';
import { Play, Pause, XCircle, Trash2, Move, TrendingUp, Bot } from 'lucide-react';
import { CornerAccents, Stat, TowerBtn } from './common';
import { CELL_SIZE, TOWER_EMOJIS, renderCanvas } from '../game/renderCanvas';

export function GameContainer({ gameState, user, setScreen, socket, gameSpeed, setGameSpeed, isPaused, setIsPaused, errorMsg, advisorTips = [] }) {
  const canvasRef = useRef(null);
  const [selectedTowerId, setSelectedTowerId] = useState(null);
  const [activeTowerType, setActiveTowerType] = useState('tower_console');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [movingTowerId, setMovingTowerId] = useState(null);

  useEffect(() => {
    if (!gameState) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    renderCanvas(ctx, canvas, { gameState, mousePos, activeTowerType, selectedTowerId, movingTowerId });
  }, [gameState, mousePos, activeTowerType, selectedTowerId, movingTowerId]);

  // Calcule la cellule cliquée depuis les coordonnées de l'évènement plutôt que depuis le
  // state `mousePos` : ce state est mis à jour de façon asynchrone par onMouseMove et peut
  // ne pas encore être "flush" au moment où le clic est traité (décalage d'un clic).
  const handleClick = (e) => {
    // La création de session côté serveur est asynchrone (requête DB) : tant que le premier
    // `gameStateUpdate` n'est pas arrivé, la session n'existe pas encore et toute action serait
    // silencieusement ignorée par le serveur (cf. handlePlaceTower : `if (!s) return;`).
    if (!gameState) return;
    const r = canvasRef.current.getBoundingClientRect();
    const gx = Math.floor((e.clientX - r.left) / CELL_SIZE); const gy = Math.floor((e.clientY - r.top) / CELL_SIZE);
    if (movingTowerId) { socket.emit('requestMoveTower', { towerId: movingTowerId, newX: gx, newY: gy }); setMovingTowerId(null); return; }
    const clickedTower = gameState?.towers?.find(t => t.x === gx && t.y === gy);
    if (clickedTower) { setSelectedTowerId(clickedTower.id); } else { if (selectedTowerId) setSelectedTowerId(null); else socket.emit('requestPlaceTower', { type: activeTowerType, x: gx, y: gy }); }
  };

  const selTower = gameState?.towers?.find(t => t.id === selectedTowerId);
  const stats = selTower ? gameState?.towerStats[selTower.type] : null;

  return (
    <div className="bg-black flex flex-col h-full overflow-hidden select-none relative">
      {errorMsg && <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 z-[60] flex items-center gap-2 animate-bounce border-2 border-white"><XCircle size={20} /> <span className="font-black uppercase">{errorMsg}</span></div>}
      {isPaused && <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center"><div className="text-6xl font-black text-white tracking-[0.5em] animate-pulse">SYSTEM_PAUSED</div></div>}

      <div className="hud-panel relative z-40">
        <div className="flex gap-8 items-center"><Stat label="RESOURCE" value={`☕ ${gameState?.coffee || 0}`} /><Stat label="INTEGRITY" value={`❤️ ${gameState?.health ?? 0}/${gameState?.maxHealth ?? 0}`} color={(gameState?.health ?? 0) / (gameState?.maxHealth || 1) < 0.3 ? 'text-red-500' : 'text-game-green'} /><Stat label="BUILD_WAVE" value={gameState?.wave || 1} /></div>
        <div className="flex gap-4 items-center">
          <button onClick={() => { const p = !isPaused; setIsPaused(p); socket.emit('setGameSpeed', p ? 0 : gameSpeed); }} className="game-btn flex items-center gap-2">{isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />} {isPaused ? 'RESUME' : 'PAUSE'}</button>
          <div className="flex border border-game-green/30 p-1 bg-black/40">{[1, 2, 4].map(s => (<button key={s} onClick={() => { if (!isPaused) { setGameSpeed(s); socket.emit('setGameSpeed', s); } }} className={`px-3 py-1 text-[9px] font-black transition-all ${gameSpeed === s && !isPaused ? 'bg-game-green text-black' : 'text-game-green hover:bg-game-green/10'}`} disabled={isPaused}>x{s}</button>))}</div>
          <button onClick={() => setScreen('menu')} className="border-2 border-red-500 text-red-500 px-4 py-1 text-[10px] font-bold hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest">Abort</button>
        </div>
      </div>

      <div className="relative flex-grow flex items-center justify-center bg-[#020202]">
        <canvas ref={canvasRef} width={800} height={600} onMouseMove={e => { const r = canvasRef.current.getBoundingClientRect(); setMousePos({ x: e.clientX - r.left, y: e.clientY - r.top }); }} onClick={handleClick} className="cursor-crosshair border border-game-green/10" />
        {selTower && stats && (
          <div className="absolute left-8 top-1/2 -translate-y-1/2 w-64 bg-black/95 border-2 border-game-green p-4 shadow-[0_0_30px_#00ff41] z-50">
            <CornerAccents color="border-game-green" />
            <h3 className="text-lg font-black mb-1 flex items-center gap-2"><div className="w-2 h-2 bg-game-green animate-ping" /> {stats.name} v{selTower.level}</h3>
            <div className="h-px bg-game-green/30 mb-4" />
            <div className="space-y-2 text-[10px] font-mono mb-6">
              <div className="flex justify-between"><span>DAMAGE:</span> <span className="text-white">{stats.damage * selTower.level}</span></div>
              <div className="flex justify-between"><span>FIRE_RATE:</span> <span className="text-white">{(1000 / (stats.cooldown / selTower.level) / 33).toFixed(1)}/s</span></div>
              <div className="flex justify-between font-bold"><span>RESELL_VAL:</span> <span className="text-red-400">☕{Math.floor(selTower.totalSpent * 0.3)}</span></div>
              <div className="flex justify-between"><span>TOTAL_INV:</span> <span className="text-game-amber">☕{selTower.totalSpent}</span></div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => socket.emit('requestUpgradeTower', { towerId: selTower.id })} className="game-btn !text-[9px] py-2 flex items-center justify-center gap-2"><TrendingUp size={12} /> UPGRADE (☕{stats.cost * selTower.level})</button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { setMovingTowerId(selTower.id); setSelectedTowerId(null); }} className="game-btn !border-game-blue !text-game-blue hover:!bg-game-blue !text-[9px] py-2 flex items-center justify-center gap-1"><Move size={12} /> MOVE (☕{Math.floor(selTower.totalSpent * 0.5)})</button>
                <button onClick={() => { socket.emit('requestSellTower', { towerId: selTower.id }); setSelectedTowerId(null); }} className="game-btn !border-red-500 !text-red-500 hover:!bg-red-500 !text-[9px] py-2 flex items-center justify-center gap-1"><Trash2 size={12} /> SELL</button>
              </div>
              <button onClick={() => setSelectedTowerId(null)} className="text-[8px] mt-2 opacity-50 uppercase tracking-widest hover:opacity-100">Cancel_Selection</button>
            </div>
          </div>
        )}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
          <TowerBtn id="tower_console" emoji={TOWER_EMOJIS.tower_console} name="STDOUT" cost={50} selected={activeTowerType} setSelected={setActiveTowerType} />
          <TowerBtn id="tower_ide" emoji={TOWER_EMOJIS.tower_ide} name="IDE_ENV" cost={150} selected={activeTowerType} setSelected={setActiveTowerType} />
          <TowerBtn id="tower_cicd" emoji={TOWER_EMOJIS.tower_cicd} name="CI_CD" cost={300} selected={activeTowerType} setSelected={setActiveTowerType} />
          <TowerBtn id="tower_ai" emoji={TOWER_EMOJIS.tower_ai} name="AI_DEV" cost={1000} selected={activeTowerType} setSelected={setActiveTowerType} />
        </div>
      </div>
      <AdvisorLog tips={advisorTips} enemyCount={gameState?.enemies?.length || 0} />
    </div>
  );
}

function AdvisorLog({ tips, enemyCount }) {
  const latest = tips[tips.length - 1];
  return (
    <div className="bg-black border-t border-game-green/20 z-40 px-4 py-1.5 flex items-center gap-3 overflow-hidden">
      <span className="text-[9px] font-black text-game-amber flex items-center gap-1.5 shrink-0 tracking-widest">
        <Bot size={13} className="animate-pulse" /> SENIOR_DEV
        {latest?.source === 'ai' && <span className="text-[7px] text-game-green/50 border border-game-green/30 px-1">AI</span>}
      </span>
      <span className="text-game-green/30 shrink-0 text-[10px]">{'>>'}</span>
      {latest ? (
        <span key={latest.ts} className="advisor-tip text-[11px] text-game-amber/90 truncate flex-grow" title={latest.text}>{latest.text}</span>
      ) : (
        <span className="text-[9px] text-game-green/50 uppercase tracking-widest flex-grow">
          {enemyCount > 0 ? `detecting ${enemyCount} entities... // analyse tactique en cours` : 'connexion au senior dev... // en attente de la première vague'}
        </span>
      )}
    </div>
  );
}
