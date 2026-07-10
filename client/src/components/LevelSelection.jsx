import { ArrowLeft, Lock } from 'lucide-react';
import { CornerAccents } from './common';

const LEVELS = [
  { id: 1, name: "Initial Commit", difficulty: "EASY" },
  { id: 2, name: "Merge Hell", difficulty: "NORMAL" },
  { id: 3, name: "Memory Leak", difficulty: "NORMAL" },
  { id: 5, name: "The Spaghetti (BOSS)", difficulty: "HARD", isBoss: true },
  { id: 10, name: "Production Down (BIG BOSS)", difficulty: "CRITICAL", isBoss: true }
];

export function LevelSelection({ user, setScreen, onStartGame }) {
  return (
    <div className="modal-container"><div className="modal-box max-w-2xl"><CornerAccents color="border-game-green" /><h2 className="text-2xl mb-8 font-black uppercase text-center">Select Build Level</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{LEVELS.map(l => {
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
