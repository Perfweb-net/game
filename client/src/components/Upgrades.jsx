import { Cpu, Zap } from 'lucide-react';
import { CornerAccents } from './common';

export function Upgrades({ user, onBack, refreshUser }) {
  const upgrades = [
    { id: 'damage', name: 'COMPUTE_POWER', cost: user.damageLevel * 50, level: user.damageLevel, icon: <Cpu size={20} /> },
    { id: 'fusion', name: 'FUSION_PROTOCOL', cost: user.fusionLimitLevel * 100, level: user.fusionLimitLevel, icon: <Zap size={20} /> }
  ];
  const buy = async (type) => {
    const res = await fetch('/api/upgrade', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type }) });
    if (res.ok) refreshUser(); else alert('Insufficient credits.');
  };
  return (
    <div className="modal-container"><div className="modal-box w-full max-w-md border-game-amber"><CornerAccents color="border-game-amber" /><h2 className="text-2xl font-black mb-2 text-game-amber uppercase">Permanent_Mods</h2><div className="text-xs text-game-amber/60 mb-8 font-mono">AVAILABLE_CREDITS: {user.credits}</div><div className="space-y-4">{upgrades.map(u => (<div key={u.id} className="border border-game-amber/30 p-4 flex justify-between items-center group"><div className="flex items-center gap-4"><div className="text-game-amber">{u.icon}</div><div><div className="font-bold text-sm text-game-amber">{u.name}</div><div className="text-[9px] opacity-50">CURR_LVL: {u.level}</div></div></div><button onClick={() => buy(u.id)} className="game-btn !border-game-amber !text-game-amber hover:!bg-game-amber text-[10px] px-4 py-1">{u.cost} CR</button></div>))}</div><button onClick={onBack} className="mt-10 game-btn !border-game-amber !text-game-amber w-full">Return_To_Root</button></div></div>
  );
}
