import { useEffect, useState } from 'react';
import { useGameSocket } from './hooks/useGameSocket';
import { CornerAccents } from './components/common';
import { Auth } from './components/Auth';
import { MainMenu } from './components/MainMenu';
import { ModeSelection } from './components/ModeSelection';
import { LevelSelection } from './components/LevelSelection';
import { GameContainer } from './components/GameContainer';
import { Upgrades } from './components/Upgrades';
import { Dex } from './components/Dex';
import { Leaderboard } from './components/Leaderboard';
import { Tutorial } from './components/Tutorial';

function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState('auth');
  const [gameMode, setGameMode] = useState(null);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const { socketRef, gameState, endGameModal, setEndGameModal, errorMsg, advisorTips } = useGameSocket(!!user);

  const refreshUser = async () => {
    const res = await fetch('/api/me');
    const data = await res.json();
    if (!data.error) setUser(data);
  };

  useEffect(() => {
    fetch('/api/me').then(res => res.json()).then(data => {
      if (!data.error) { setUser(data); setScreen('menu'); }
    });
  }, []);

  const handleStartGame = (mode, levelId = null) => {
    setGameMode(mode); setEndGameModal(null); setIsPaused(false); setScreen('game');
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

export default App;
