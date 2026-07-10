import { ArrowLeft } from 'lucide-react';
import { CornerAccents, ModeCard } from './common';

export function ModeSelection({ setScreen, onStartGame }) {
  return (
    <div className="modal-container"><div className="modal-box max-w-sm"><CornerAccents color="border-game-green" /><h2 className="text-2xl mb-8 font-black uppercase text-center">Execution Mode</h2><div className="flex flex-col gap-4"><ModeCard title="Story Mode" desc="Deploy through 10 critical builds." onClick={() => setScreen('levelSelect')} /><ModeCard title="Infinite Build" desc="Survive waves of legacy code." onClick={() => onStartGame('infinite')} /><button onClick={() => setScreen('menu')} className="mt-4 text-[10px] flex items-center justify-center gap-2 uppercase opacity-50"><ArrowLeft size={12} /> Back to Root</button></div></div></div>
  );
}
