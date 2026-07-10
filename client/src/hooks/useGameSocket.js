import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = window.location.origin;

// Le socket ne doit se connecter qu'une fois l'utilisateur authentifié : le serveur lit le
// cookie JWT au moment du handshake, or ce cookie n'existe pas tant que /api/signup ou
// /api/login n'a pas répondu. Se connecter plus tôt (ex: au montage de l'app) capture un
// handshake sans cookie, qui reste figé pour toute la durée de vie de cette connexion.
export function useGameSocket(isAuthenticated) {
  const [gameState, setGameState] = useState(null);
  const [endGameModal, setEndGameModal] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [advisorTips, setAdvisorTips] = useState([]);
  const socketRef = useRef(null);
  const gameStateRef = useRef(null);

  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  const showError = (msg) => { setErrorMsg(msg); setTimeout(() => setErrorMsg(null), 3000); };

  useEffect(() => {
    if (!isAuthenticated || socketRef.current) return;

    socketRef.current = io(SOCKET_URL);
    socketRef.current.on('gameStateUpdate', (state) => setGameState(state));
    socketRef.current.on('gameOver', (data) => setEndGameModal({ type: data.isWin ? 'win' : 'lose', wave: data.wave, reward: data.earnedCredits }));
    socketRef.current.on('levelClear', (data) => setEndGameModal({ type: 'win', wave: gameStateRef.current?.wave || 0, reward: data.reward }));
    socketRef.current.on('insufficientCoffee', () => showError('CAFÉ_INSUFFISANT : Opération annulée'));
    socketRef.current.on('advisorTip', (tip) => setAdvisorTips(prev => [...prev.slice(-4), tip]));

    return () => { socketRef.current?.disconnect(); socketRef.current = null; };
    // Ne dépend que de la transition "pas connecté -> connecté" : `user` (côté App) est
    // réassigné par refreshUser() (nouvelle référence, même compte) et ne doit pas
    // reconnecter le socket.
  }, [isAuthenticated]);

  return { socketRef, gameState, endGameModal, setEndGameModal, errorMsg, showError, advisorTips };
}
