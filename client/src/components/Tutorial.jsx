import { Code } from 'lucide-react';
import { CornerAccents } from './common';

export function Tutorial({ onBack }) {
  return (
    <div className="modal-container"><div className="modal-box max-w-md"><CornerAccents color="border-game-green" /><h2 className="text-2xl mb-8 font-black uppercase flex items-center justify-center gap-3"><Code /> System_Init</h2><div className="space-y-6 text-[10px] uppercase tracking-widest leading-relaxed text-left"><p><b className="text-game-green text-xs block mb-1 font-black underline">// OBJECTIVE</b> Stop bugs from reaching PROD_SERVER (🖥️). Each leak costs INTEGRITY (❤️) : small bugs = 1, heavy ones more, a BOSS = total crash. Hit 0 and it's GAME_OVER.</p><p><b className="text-game-green text-xs block mb-1 font-black underline">// BUILD</b> Use Coffee (☕) to deploy defense nodes. Select on the right, click on the grid.</p><p><b className="text-game-green text-xs block mb-1 font-black underline">// FUSION</b> Click an existing node with the SAME type selected to UPGRADE. Increases compute power exponentially.</p><p><b className="text-game-green text-xs block mb-1 font-black underline">// REWARDS</b> Bugs dropped provide METRICS converted to CREDITS post-session. Use for permanent hardware mods.</p></div><button onClick={onBack} className="mt-10 game-btn w-full">Protocol_Accepted</button></div></div>
  );
}
