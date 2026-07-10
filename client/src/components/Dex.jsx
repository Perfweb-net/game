import { CornerAccents } from './common';

const ENEMIES = [
  { id: 'enemy_syntax', name: 'Syntax Error', emoji: '🐛', desc: 'FAST_FAIL: Small bug.' },
  { id: 'enemy_bus', name: 'Bus Error', emoji: '🚌', desc: 'MEM_OVERFLOW: Heavy entity.' },
  { id: 'enemy_memory', name: 'Memory Leak', emoji: '💧', desc: 'DATA_DRIFT: Resource consumer.' },
  { id: 'boss_spaghetti', name: 'Spaghetti Code', emoji: '🍝', desc: 'LEGACY_BOSS: Tangled logic.' },
  { id: 'boss_outage', name: 'Global Outage', emoji: '💀', desc: 'SYSTEM_CRITICAL: Total failure.' }
];

export function Dex({ user, onBack }) {
  const discovered = JSON.parse(user.discoveredEnemies || '[]');
  return (
    <div className="modal-container crt"><div className="modal-box w-full max-w-2xl bg-black/95"><CornerAccents color="border-game-green" /><h2 className="text-3xl font-black mb-8 border-b border-game-green/20 pb-4 text-game-green uppercase">Entity_Database</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{ENEMIES.map(e => (<div key={e.id} className={`p-4 border ${discovered.includes(e.id) ? 'border-game-green/40 bg-game-green/5' : 'border-white/5 opacity-20 grayscale'}`}><div className="flex items-center gap-4 mb-2"><span className="text-4xl">{discovered.includes(e.id) ? e.emoji : '❓'}</span><span className="font-black text-sm uppercase">{discovered.includes(e.id) ? e.name : 'Unknown'}</span></div><p className="text-[9px] opacity-70 leading-relaxed font-mono">{discovered.includes(e.id) ? e.desc : 'No data.'}</p></div>))}</div><button onClick={onBack} className="mt-10 game-btn w-full">Close_Database</button></div></div>
  );
}
