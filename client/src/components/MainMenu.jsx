import { LogOut, Zap, Settings, Trophy, BookOpen, Info } from 'lucide-react';
import { CornerAccents, MenuButton } from './common';

export function MainMenu({ user, setScreen }) {
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
