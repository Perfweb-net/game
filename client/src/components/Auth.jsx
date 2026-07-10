import { useState } from 'react';
import { Terminal } from 'lucide-react';
import { CornerAccents } from './common';

export function Auth({ setUser, setScreen, refreshUser }) {
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
