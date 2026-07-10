import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { CornerAccents } from './common';

export function Leaderboard({ onBack }) {
  const [data, setData] = useState([]);
  useEffect(() => { fetch('/api/leaderboard').then(res => res.json()).then(setData); }, []);
  return (
    <div className="modal-container"><div className="modal-box max-w-sm"><CornerAccents color="border-game-green" /><h2 className="text-2xl font-black mb-8 flex items-center justify-center gap-3 text-game-green uppercase tracking-tighter"><Trophy className="text-game-amber" /> Hall_Of_Fame</h2><div className="space-y-2">{data.map((u, i) => (<div key={i} className="flex justify-between items-center bg-game-green/5 p-3 border-l-4 border-game-green"><span className="text-sm font-black opacity-80 uppercase tracking-tighter">{i + 1}. {u.username}</span><span className="text-xs font-bold text-game-green tracking-tighter">LVL_{u.maxWave}</span></div>))}</div><button onClick={onBack} className="mt-10 game-btn w-full">Close_Record</button></div></div>
  );
}
