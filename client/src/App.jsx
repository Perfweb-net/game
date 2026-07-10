import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { LogOut, Play, Trophy, BookOpen, Settings, Info, ArrowLeft, Terminal, Cpu, Zap, Code, Pause, XCircle, Trash2, Move, TrendingUp, Lock, Rocket, Bot } from 'lucide-react';

const SOCKET_URL = window.location.origin;

function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('auth');
  const [gameState, setGameState] = useState(null);
  const [gameMode, setGameMode] = useState(null);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [endGameModal, setEndGameModal] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [advisorTips, setAdvisorTips] = useState([]);
  const socketRef = useRef(null);
  const gameStateRef = useRef(null);

  // Garde une référence à jour du gameState pour les handlers socket (évite les closures périmées)
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  useEffect(() => {
    fetch('/api/me').then(res => res.json()).then(data => {
      if (!data.error) { setUser(data); setScreen('menu'); }
    });
  }, []);

  // Le socket ne doit se connecter qu'une fois l'utilisateur authentifié : le serveur lit le
  // cookie JWT au moment du handshake, or ce cookie n'existe pas tant que /api/signup ou
  // /api/login n'a pas répondu. Se connecter plus tôt (ex: au montage de l'app) capture un
  // handshake sans cookie, qui reste figé pour toute la durée de vie de cette connexion.
  useEffect(() => {
    if (!user || socketRef.current) return;

    socketRef.current = io(SOCKET_URL);
    socketRef.current.on('gameStateUpdate', (state) => setGameState(state));
    socketRef.current.on('gameOver', (data) => setEndGameModal({ type: data.isWin ? 'win' : 'lose', wave: data.wave, reward: data.earnedCredits }));
    socketRef.current.on('levelClear', (data) => setEndGameModal({ type: 'win', wave: gameStateRef.current?.wave || 0, reward: data.reward }));
    socketRef.current.on('insufficientCoffee', () => showError("CAFÉ_INSUFFISANT : Opération annulée"));
    socketRef.current.on('advisorTip', (tip) => setAdvisorTips(prev => [...prev.slice(-4), tip]));

    return () => { socketRef.current?.disconnect(); socketRef.current = null; };
    // Ne dépend que de la transition "pas connecté -> connecté" : `user` est réassigné par
    // refreshUser() (nouvelle référence, même compte) et ne doit pas reconnecter le socket.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!user]);

  const showError = (msg) => { setErrorMsg(msg); setTimeout(() => setErrorMsg(null), 3000); };
  const refreshUser = async () => {
    const res = await fetch('/api/me');
    const data = await res.json();
    if (!data.error) setUser(data);
  };

  const handleStartGame = (mode, levelId = null) => {
    setGameMode(mode); setEndGameModal(null); setIsPaused(false); setAdvisorTips([]); setScreen('game');
    socketRef.current.emit('requestStartGame', { mode, levelId });
  };

  if (screen === 'auth') return <Auth setUser={setUser} setScreen={setScreen} refreshUser={refreshUser} />;

  return (
    <div className="h-screen w-screen relative crt bg-game-dark overflow-hidden font-mono">
      {screen === 'menu' && <MainMenu user={user} setScreen={setScreen} />}
      {screen === 'modeSelect' && <ModeSelection setScreen={setScreen} onStartGame={handleStartGame} />}
      {screen === 'levelSelect' && <LevelSelection user={user} setScreen={setScreen} onStartGame={handleStartGame} />}
      {screen === 'game' && <GameContainer gameState={gameState} user={user} setScreen={setScreen} socket={socketRef.current} gameSpeed={gameSpeed} setGameSpeed={setGameSpeed} isPaused={isPaused} setIsPaused={setIsPaused} errorMsg={errorMsg} advisorTips={advisorTips} />}
      {screen === 'upgrade' && <Upgrades user={user} onBack={() => setScreen('menu')} refreshUser={refreshUser} />}
      {screen === 'dex' && <Dex user={user} onBack={() => setScreen('menu')} />}
      {screen === 'leaderboard' && <Leaderboard onBack={() => setScreen('menu')} />}
      {screen === 'tutorial' && <Tutorial onBack={() => setScreen('menu')} />}

      {endGameModal && (
        <div className="modal-container z-[100]">
          <div className={`modal-box border-4 ${endGameModal.type === 'win' ? 'border-game-green shadow-[0_0_40px_#00ff41]' : 'border-red-600 shadow-[0_0_40px_#dc2626]'}`}>
            <CornerAccents color={endGameModal.type === 'win' ? 'border-game-green' : 'border-red-600'} />
            <h2 className={`text-4xl font-black mb-4 uppercase tracking-tighter ${endGameModal.type === 'win' ? 'text-game-green' : 'text-red-600'}`}>
              {endGameModal.type === 'win' ? 'BUILD_SUCCESSFUL' : 'SYSTEM_CRASH'}
            </h2>
            <div className="space-y-4 mb-8">
              <div className="text-xl font-bold">Vague atteinte : <span className="text-white">{endGameModal.wave}</span></div>
              <div className="text-xl font-bold text-game-amber tracking-widest">Gains : {endGameModal.reward} CRÉDITS</div>
            </div>
            <button onClick={() => { setEndGameModal(null); setScreen('menu'); refreshUser(); }} className="game-btn w-full py-4 text-xl">Retour au HUB</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Auth({ setUser, setScreen, refreshUser }) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(isSignup ? '/api/signup' : '/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok) { setUser(data.user); refreshUser(); setScreen('menu'); } else alert(data.error);
  };
  return (
    <div className="modal-container crt">
      <div className="modal-box border-game-amber">
        <CornerAccents color="border-game-amber" />
        <h2 className="text-3xl mb-8 font-black uppercase text-game-amber flex items-center justify-center gap-3"><Terminal size={32} /> {isSignup ? 'Init System' : 'Access Node'}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <input className="auth-input !border-game-amber/50 !text-game-amber" placeholder="Identifier" value={username} onChange={e => setUsername(e.target.value)} required />
          <input className="auth-input !border-game-amber/50 !text-game-amber" type="password" placeholder="Passkey" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="game-btn !border-game-amber !text-game-amber">{isSignup ? 'Register' : 'Login'}</button>
        </form>
        <button onClick={() => setIsSignup(!isSignup)} className="text-[10px] mt-6 underline text-game-amber uppercase"> {isSignup ? '> Return to Login' : '> Create New Entry'} </button>
      </div>
    </div>
  );
}

function MainMenu({ user, setScreen }) {
  return (
    <div className="modal-container">
      <div className="modal-box w-full max-w-md">
        <CornerAccents color="border-game-green" />
        <div className="flex flex-col items-center mb-10">
          <h1 className="text-4xl font-black text-game-green drop-shadow-[0_0_15px_#00ff41]">EVOLUTION.SYS</h1>
          <p className="mt-2 text-[10px] uppercase opacity-70 font-bold">User: {user?.username} | Credits: {user?.credits}</p>
        </div>
        <div className="flex flex-col gap-4">
          <button onClick={() => setScreen('modeSelect')} className="game-btn text-xl py-4 flex items-center justify-center gap-3 group"><Zap className="group-hover:animate-pulse" size={24} /> EXECUTE_GAME</button>
          <div className="grid grid-cols-2 gap-4">
            <MenuButton icon={<Settings size={18} />} label="MODS" onClick={() => setScreen('upgrade')} />
            <MenuButton icon={<Trophy size={18} />} label="RANK" onClick={() => setScreen('leaderboard')} />
            <MenuButton icon={<BookOpen size={18} />} label="LOGS" onClick={() => setScreen('dex')} />
            <MenuButton icon={<Info size={18} />} label="HELP" onClick={() => setScreen('tutorial')} />
          </div>
          <button onClick={() => { fetch('/api/logout', { method: 'POST' }).then(() => window.location.reload()) }} className="mt-6 text-[10px] opacity-40 hover:opacity-100 flex items-center justify-center gap-2 uppercase tracking-widest"><LogOut size={12} /> Terminate_Session</button>
        </div>
      </div>
    </div>
  );
}

function MenuButton({ icon, label, onClick }) {
  return (<button onClick={onClick} className="game-btn py-3 flex flex-col items-center justify-center gap-1"><div className="opacity-70">{icon}</div><span className="text-[10px] font-bold">{label}</span></button>);
}

function ModeSelection({ setScreen, onStartGame }) {
  return (
    <div className="modal-container"><div className="modal-box max-w-sm"><CornerAccents color="border-game-green" /><h2 className="text-2xl mb-8 font-black uppercase text-center">Execution Mode</h2><div className="flex flex-col gap-4"><ModeCard title="Story Mode" desc="Deploy through 10 critical builds." onClick={() => setScreen('levelSelect')} /><ModeCard title="Infinite Build" desc="Survive waves of legacy code." onClick={() => onStartGame('infinite')} /><button onClick={() => setScreen('menu')} className="mt-4 text-[10px] flex items-center justify-center gap-2 uppercase opacity-50"><ArrowLeft size={12} /> Back to Root</button></div></div></div>
  );
}

function ModeCard({ title, desc, onClick }) {
  return (<button onClick={onClick} className="text-left border border-game-green/30 p-4 hover:bg-game-green/5 group relative transition-all"><div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all"><Play size={16} /></div><h3 className="font-bold text-lg mb-1">{title}</h3><p className="text-[10px] opacity-60 leading-tight uppercase">{desc}</p></button>);
}

function LevelSelection({ user, setScreen, onStartGame }) {
  const levels = [
    { id: 1, name: "Initial Commit", difficulty: "EASY" },
    { id: 2, name: "Merge Hell", difficulty: "NORMAL" },
    { id: 3, name: "Memory Leak", difficulty: "NORMAL" },
    { id: 5, name: "The Spaghetti (BOSS)", difficulty: "HARD", isBoss: true },
    { id: 10, name: "Production Down (BIG BOSS)", difficulty: "CRITICAL", isBoss: true }
  ];
  return (
    <div className="modal-container"><div className="modal-box max-w-2xl"><CornerAccents color="border-game-green" /><h2 className="text-2xl mb-8 font-black uppercase text-center">Select Build Level</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{levels.map(l => {
      const isLocked = l.id > user.maxLevel;
      return (
        <button key={l.id} disabled={isLocked} onClick={() => onStartGame('story', l.id)} className={`game-btn aspect-square flex flex-col p-2 gap-1 items-center justify-center relative ${l.isBoss ? '!border-red-500 !text-red-500' : ''} ${isLocked ? 'opacity-30 grayscale cursor-not-allowed' : 'hover:!bg-game-green/20'}`}>
          {isLocked && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><Lock size={24} /></div>}
          <span className="text-[10px] opacity-70">BLD_{l.id}</span>
          <span className="text-[9px] font-bold uppercase text-center leading-tight">{l.name}</span>
          <div className="mt-2 text-[8px] border px-1 border-current">{l.difficulty}</div>
        </button>
      );
    })}</div><button onClick={() => setScreen('modeSelect')} className="mt-8 text-[10px] flex items-center justify-center gap-2 uppercase opacity-50"><ArrowLeft size={12} /> Back to Modes</button></div></div>
  );
}

function GameContainer({ gameState, user, setScreen, socket, gameSpeed, setGameSpeed, isPaused, setIsPaused, errorMsg, advisorTips = [] }) {
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
    const cellSize = 40;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.05)';
      for(let i=0; i<canvas.width; i+=cellSize) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); ctx.stroke(); }
      for(let i=0; i<canvas.height; i+=cellSize) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(canvas.width,i); ctx.stroke(); }

      if (gameState.map) {
        gameState.map.forEach((row, y) => {
          row.forEach((cell, x) => {
            const px = x * cellSize; const py = y * cellSize;
            if (cell === 1) { ctx.fillStyle = 'rgba(0, 255, 65, 0.1)'; ctx.fillRect(px+2, py+2, cellSize-4, cellSize-4); }
            else if (cell === 2) { ctx.shadowBlur = 15; ctx.shadowColor = '#00f0ff'; drawEmoji(ctx, '🖥️', px, py, cellSize); ctx.shadowBlur = 0; }
            else if (cell === 3) { ctx.fillStyle = 'rgba(255, 0, 0, 0.1)'; ctx.fillRect(px, py, cellSize, cellSize); drawEmoji(ctx, '🏁', px, py, cellSize); }
          });
        });
      }

      gameState.towers?.forEach(t => {
        const px = (t.x + 0.5) * cellSize; const py = (t.y + 0.5) * cellSize;
        const isSelected = selectedTowerId === t.id || movingTowerId === t.id;
        ctx.fillStyle = isSelected ? '#222' : '#111'; ctx.beginPath(); ctx.arc(px, py, cellSize/2.5, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = t.id === movingTowerId ? '#ffb000' : (t.type === 'tower_ide' ? '#00f0ff' : t.type === 'tower_cicd' ? '#a855f7' : t.type === 'tower_ai' ? '#f43f5e' : '#00ff41');
        ctx.lineWidth = isSelected ? 3 : 2; if (isSelected) { ctx.shadowBlur = 10; ctx.shadowColor = ctx.strokeStyle; } ctx.stroke(); ctx.shadowBlur = 0;
        const emojis = { tower_console: '💬', tower_ide: '💻', tower_cicd: '🚀', tower_ai: '🤖' };
        drawEmoji(ctx, emojis[t.type] || '❓', t.x * cellSize, t.y * cellSize, cellSize);
        if (t.level > 1) { ctx.fillStyle = '#fff'; ctx.font = 'bold 9px monospace'; ctx.fillText(`v${t.level}`, px + cellSize/4, py + cellSize/4); }
      });

      gameState.enemies?.forEach(e => {
        const px = e.x * cellSize; const py = e.y * cellSize;
        const isBoss = e.type.startsWith('boss');
        ctx.shadowBlur = isBoss ? 20 : 0; ctx.shadowColor = 'red';
        const emojis = { enemy_syntax: '🐛', enemy_bus: '🚌', enemy_memory: '💧', boss_spaghetti: '🍝', boss_outage: '💀' };
        drawEmoji(ctx, emojis[e.type] || '❓', px, py, cellSize * (isBoss ? 1.5 : 1));
        ctx.shadowBlur = 0;
        const barW = cellSize * 0.8; ctx.fillStyle = 'rgba(255,0,0,0.3)'; ctx.fillRect(px + (cellSize-barW)/2, py - 10, barW, 2);
        ctx.fillStyle = '#00ff41'; ctx.fillRect(px + (cellSize-barW)/2, py - 10, barW * (e.hp/e.maxHp), 2);
      });

      gameState.projectiles?.forEach(p => {
        ctx.strokeStyle = '#ffff00'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x*cellSize, p.y*cellSize, 2, 0, Math.PI*2); ctx.stroke();
      });

      const gx = Math.floor(mousePos.x / cellSize); const gy = Math.floor(mousePos.y / cellSize);
      if (movingTowerId) { ctx.globalAlpha = 0.5; drawEmoji(ctx, '📦', gx * cellSize, gy * cellSize, cellSize); ctx.globalAlpha = 1.0; }
      else if (gameState.map?.[gy]?.[gx] === 0 && !selectedTowerId) {
        ctx.globalAlpha = 0.3; const emojis = { tower_console: '💬', tower_ide: '💻', tower_cicd: '🚀', tower_ai: '🤖' };
        drawEmoji(ctx, emojis[activeTowerType], gx * cellSize, gy * cellSize, cellSize); ctx.globalAlpha = 1.0;
      }
    };
    render();
  }, [gameState, mousePos, activeTowerType, selectedTowerId, movingTowerId]);

  const drawEmoji = (ctx, emoji, x, y, size) => {
    ctx.font = `${size * 0.7}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(emoji, x + size/2, y + size/2);
  };

  // Calcule la cellule cliquée depuis les coordonnées de l'évènement plutôt que depuis le
  // state `mousePos` : ce state est mis à jour de façon asynchrone par onMouseMove et peut
  // ne pas encore être "flush" au moment où le clic est traité (décalage d'un clic).
  const handleClick = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    const gx = Math.floor((e.clientX - r.left) / 40); const gy = Math.floor((e.clientY - r.top) / 40);
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
          <div className="flex border border-game-green/30 p-1 bg-black/40">{[1, 2, 4].map(s => (<button key={s} onClick={() => { if(!isPaused) { setGameSpeed(s); socket.emit('setGameSpeed', s); } }} className={`px-3 py-1 text-[9px] font-black transition-all ${gameSpeed === s && !isPaused ? 'bg-game-green text-black' : 'text-game-green hover:bg-game-green/10'}`} disabled={isPaused}>x{s}</button>))}</div>
          <button onClick={() => setScreen('menu')} className="border-2 border-red-500 text-red-500 px-4 py-1 text-[10px] font-bold hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest">Abort</button>
        </div>
      </div>

      <div className="relative flex-grow flex items-center justify-center bg-[#020202]">
        <canvas ref={canvasRef} width={800} height={600} onMouseMove={e => { const r = canvasRef.current.getBoundingClientRect(); setMousePos({ x: e.clientX-r.left, y: e.clientY-r.top }); }} onClick={handleClick} className="cursor-crosshair border border-game-green/10" />
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
          <TowerBtn id="tower_console" emoji="💬" name="STDOUT" cost={50} selected={activeTowerType} setSelected={setActiveTowerType} />
          <TowerBtn id="tower_ide" emoji="💻" name="IDE_ENV" cost={150} selected={activeTowerType} setSelected={setActiveTowerType} />
          <TowerBtn id="tower_cicd" emoji="🚀" name="CI_CD" cost={300} selected={activeTowerType} setSelected={setActiveTowerType} />
          <TowerBtn id="tower_ai" emoji="🤖" name="AI_DEV" cost={1000} selected={activeTowerType} setSelected={setActiveTowerType} />
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

function Stat({ label, value, color = 'text-white' }) { return (<div className="flex flex-col"><span className="text-[8px] text-game-green/50 font-bold tracking-[0.2em]">{label}</span><span className={`text-lg font-black tracking-tight ${color}`}>{value}</span></div>); }
function TowerBtn({ id, emoji, name, cost, selected, setSelected }) {
  const isSel = selected === id;
  return (<button onClick={() => setSelected(id)} className={`tower-slot w-24 bg-black ${isSel ? 'selected' : ''}`}><span className="text-3xl mb-2">{emoji}</span><span className="text-[9px] font-black tracking-tighter mb-1">{name}</span><span className="text-[10px] text-game-green font-bold opacity-80">☕{cost}</span>{isSel && <div className="absolute -left-1 top-0 bottom-0 w-1 bg-game-green animate-pulse" />}</button>);
}
function CornerAccents({ color }) { return (<><div className={`corner-accent ca-tl ${color}`} /><div className={`corner-accent ca-tr ${color}`} /><div className={`corner-accent ca-bl ${color}`} /><div className={`corner-accent ca-br ${color}`} /></>); }

function Dex({ user, onBack }) {
  const discovered = JSON.parse(user.discoveredEnemies || '[]');
  const enemies = [{ id: 'enemy_syntax', name: 'Syntax Error', emoji: '🐛', desc: 'FAST_FAIL: Small bug.' }, { id: 'enemy_bus', name: 'Bus Error', emoji: '🚌', desc: 'MEM_OVERFLOW: Heavy entity.' }, { id: 'enemy_memory', name: 'Memory Leak', emoji: '💧', desc: 'DATA_DRIFT: Resource consumer.' }, { id: 'boss_spaghetti', name: 'Spaghetti Code', emoji: '🍝', desc: 'LEGACY_BOSS: Tangled logic.' }, { id: 'boss_outage', name: 'Global Outage', emoji: '💀', desc: 'SYSTEM_CRITICAL: Total failure.' }];
  return (<div className="modal-container crt"><div className="modal-box w-full max-w-2xl bg-black/95"><CornerAccents color="border-game-green" /><h2 className="text-3xl font-black mb-8 border-b border-game-green/20 pb-4 text-game-green uppercase">Entity_Database</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{enemies.map(e => (<div key={e.id} className={`p-4 border ${discovered.includes(e.id) ? 'border-game-green/40 bg-game-green/5' : 'border-white/5 opacity-20 grayscale'}`}><div className="flex items-center gap-4 mb-2"><span className="text-4xl">{discovered.includes(e.id) ? e.emoji : '❓'}</span><span className="font-black text-sm uppercase">{discovered.includes(e.id) ? e.name : 'Unknown'}</span></div><p className="text-[9px] opacity-70 leading-relaxed font-mono">{discovered.includes(e.id) ? e.desc : 'No data.'}</p></div>))}</div><button onClick={onBack} className="mt-10 game-btn w-full">Close_Database</button></div></div>);
}

function Upgrades({ user, onBack, refreshUser }) {
  const upgrades = [{ id: 'damage', name: 'COMPUTE_POWER', cost: user.damageLevel * 50, level: user.damageLevel, icon: <Cpu size={20} /> }, { id: 'fusion', name: 'FUSION_PROTOCOL', cost: user.fusionLimitLevel * 100, level: user.fusionLimitLevel, icon: <Zap size={20} /> }];
  const buy = async (type) => {
    const res = await fetch('/api/upgrade', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type }) });
    if (res.ok) refreshUser(); else alert('Insufficient credits.');
  };
  return (<div className="modal-container"><div className="modal-box w-full max-w-md border-game-amber"><CornerAccents color="border-game-amber" /><h2 className="text-2xl font-black mb-2 text-game-amber uppercase">Permanent_Mods</h2><div className="text-xs text-game-amber/60 mb-8 font-mono">AVAILABLE_CREDITS: {user.credits}</div><div className="space-y-4">{upgrades.map(u => (<div key={u.id} className="border border-game-amber/30 p-4 flex justify-between items-center group"><div className="flex items-center gap-4"><div className="text-game-amber">{u.icon}</div><div><div className="font-bold text-sm text-game-amber">{u.name}</div><div className="text-[9px] opacity-50">CURR_LVL: {u.level}</div></div></div><button onClick={() => buy(u.id)} className="game-btn !border-game-amber !text-game-amber hover:!bg-game-amber text-[10px] px-4 py-1">{u.cost} CR</button></div>))}</div><button onClick={onBack} className="mt-10 game-btn !border-game-amber !text-game-amber w-full">Return_To_Root</button></div></div>);
}

function Leaderboard({ onBack }) {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/api/leaderboard').then(res => res.json()).then(setData); }, []);
  return (<div className="modal-container"><div className="modal-box max-w-sm"><CornerAccents color="border-game-green" /><h2 className="text-2xl font-black mb-8 flex items-center justify-center gap-3 text-game-green uppercase tracking-tighter"><Trophy className="text-game-amber" /> Hall_Of_Fame</h2><div className="space-y-2">{data.map((u, i) => (<div key={i} className="flex justify-between items-center bg-game-green/5 p-3 border-l-4 border-game-green"><span className="text-sm font-black opacity-80 uppercase tracking-tighter">{i+1}. {u.username}</span><span className="text-xs font-bold text-game-green tracking-tighter">LVL_{u.maxWave}</span></div>))}</div><button onClick={onBack} className="mt-10 game-btn w-full">Close_Record</button></div></div>);
}

function Tutorial({ onBack }) {
  return (<div className="modal-container"><div className="modal-box max-w-md"><CornerAccents color="border-game-green" /><h2 className="text-2xl font-black mb-8 flex items-center justify-center gap-3 text-game-green uppercase"><Code /> System_Init</h2><div className="space-y-6 text-[10px] uppercase tracking-widest leading-relaxed text-left"><p><b className="text-game-green text-xs block mb-1 font-black underline">// OBJECTIVE</b> Stop bugs from reaching PROD_SERVER (🖥️). Each leak costs INTEGRITY (❤️) : small bugs = 1, heavy ones more, a BOSS = total crash. Hit 0 and it's GAME_OVER.</p><p><b className="text-game-green text-xs block mb-1 font-black underline">// BUILD</b> Use Coffee (☕) to deploy defense nodes. Select on the right, click on the grid.</p><p><b className="text-game-green text-xs block mb-1 font-black underline">// FUSION</b> Click an existing node with the SAME type selected to UPGRADE. Increases compute power exponentially.</p><p><b className="text-game-green text-xs block mb-1 font-black underline">// REWARDS</b> Bugs dropped provide METRICS converted to CREDITS post-session. Use for permanent hardware mods.</p></div><button onClick={onBack} className="mt-10 game-btn w-full">Protocol_Accepted</button></div></div>);
}

export default App;
