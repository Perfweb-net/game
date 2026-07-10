require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cookieParser = require('cookie-parser');
const GameLogic = require('./socket/gameLogic');
const auth = require('./controllers/authController');
const gameCtrl = require('./controllers/gameController');
const { verifyToken } = require('./middleware/auth');
const { logEvent } = require('./playtestLogger');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// Auth Routes
app.post('/api/signup', auth.signup);
app.post('/api/login', auth.login);
app.post('/api/logout', auth.logout);
app.get('/api/me', verifyToken, auth.me);
app.post('/api/upgrade', verifyToken, gameCtrl.upgrade);
app.get('/api/leaderboard', gameCtrl.getLeaderboard);

const game = new GameLogic(io);

// Simple heartbeat for the game loop
const TICK_RATE = 30; // 30 ticks per second

setInterval(() => {
    game.update();
}, 1000 / TICK_RATE);

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    socket.on('requestStartGame', async (data) => {
        const { mode, levelId } = data || { mode: 'infinite' };
        // Extract token from cookies manually
        const cookieString = socket.handshake.headers.cookie;
        if (!cookieString) return;
        
        const token = cookieString.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
        if (!token) return;

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            await game.createSession(socket.id, decoded.userId, mode, levelId);
            const session = game.sessions[socket.id];
            if (session) {
                socket.emit('gameStateUpdate', game.getState(session));
            }
        } catch (err) {
            console.error('Socket auth failed', err);
        }
    });

    socket.on('requestPlaceTower', (data) => {
        game.handlePlaceTower(socket.id, data);
    });

    socket.on('requestUpgradeTower', (data) => {
        game.handleUpgradeTower(socket.id, data);
    });

    socket.on('requestSellTower', (data) => {
        game.handleSellTower(socket.id, data);
    });

    socket.on('requestMoveTower', (data) => {
        game.handleMoveTower(socket.id, data);
    });

    socket.on('setGameSpeed', (speed) => {
        game.handleSetSpeed(socket.id, speed);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        const s = game.sessions[socket.id];
        if (s) logEvent('session_abandoned', { userId: s.userId, mode: s.mode, levelId: s.levelId, wave: s.wave, durationSec: Math.round(s.tick / 30) });
        delete game.sessions[socket.id];
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
