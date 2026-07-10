import { Play } from 'lucide-react';

export function CornerAccents({ color }) {
  return (<><div className={`corner-accent ca-tl ${color}`} /><div className={`corner-accent ca-tr ${color}`} /><div className={`corner-accent ca-bl ${color}`} /><div className={`corner-accent ca-br ${color}`} /></>);
}

export function Stat({ label, value, color = 'text-white' }) {
  return (<div className="flex flex-col"><span className="text-[8px] text-game-green/50 font-bold tracking-[0.2em]">{label}</span><span className={`text-lg font-black tracking-tight ${color}`}>{value}</span></div>);
}

export function MenuButton({ icon, label, onClick }) {
  return (<button onClick={onClick} className="game-btn py-3 flex flex-col items-center justify-center gap-1"><div className="opacity-70">{icon}</div><span className="text-[10px] font-bold">{label}</span></button>);
}

export function TowerBtn({ id, emoji, name, cost, selected, setSelected }) {
  const isSel = selected === id;
  return (<button onClick={() => setSelected(id)} className={`tower-slot w-24 bg-black ${isSel ? 'selected' : ''}`}><span className="text-3xl mb-2">{emoji}</span><span className="text-[9px] font-black tracking-tighter mb-1">{name}</span><span className="text-[10px] text-game-green font-bold opacity-80">☕{cost}</span>{isSel && <div className="absolute -left-1 top-0 bottom-0 w-1 bg-game-green animate-pulse" />}</button>);
}

export function ModeCard({ title, desc, onClick }) {
  return (<button onClick={onClick} className="text-left border border-game-green/30 p-4 hover:bg-game-green/5 group relative transition-all"><div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all"><Play size={16} /></div><h3 className="font-bold text-lg mb-1">{title}</h3><p className="text-[10px] opacity-60 leading-tight uppercase">{desc}</p></button>);
}
