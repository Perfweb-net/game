export const CELL_SIZE = 40;

export const TOWER_EMOJIS = { tower_console: '💬', tower_ide: '💻', tower_cicd: '🚀', tower_ai: '🤖' };
const ENEMY_EMOJIS = { enemy_syntax: '🐛', enemy_bus: '🚌', enemy_memory: '💧', boss_spaghetti: '🍝', boss_outage: '💀' };

export function drawEmoji(ctx, emoji, x, y, size) {
  ctx.font = `${size * 0.7}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(emoji, x + size / 2, y + size / 2);
}

export function renderCanvas(ctx, canvas, { gameState, mousePos, activeTowerType, selectedTowerId, movingTowerId }) {
  const cellSize = CELL_SIZE;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(0, 255, 65, 0.05)';
  for (let i = 0; i < canvas.width; i += cellSize) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); }
  for (let i = 0; i < canvas.height; i += cellSize) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke(); }

  if (gameState.map) {
    gameState.map.forEach((row, y) => {
      row.forEach((cell, x) => {
        const px = x * cellSize; const py = y * cellSize;
        if (cell === 1) { ctx.fillStyle = 'rgba(0, 255, 65, 0.1)'; ctx.fillRect(px + 2, py + 2, cellSize - 4, cellSize - 4); }
        else if (cell === 2) { ctx.shadowBlur = 15; ctx.shadowColor = '#00f0ff'; drawEmoji(ctx, '🖥️', px, py, cellSize); ctx.shadowBlur = 0; }
        else if (cell === 3) { ctx.fillStyle = 'rgba(255, 0, 0, 0.1)'; ctx.fillRect(px, py, cellSize, cellSize); drawEmoji(ctx, '🏁', px, py, cellSize); }
      });
    });
  }

  gameState.towers?.forEach(t => {
    const px = (t.x + 0.5) * cellSize; const py = (t.y + 0.5) * cellSize;
    const isSelected = selectedTowerId === t.id || movingTowerId === t.id;
    ctx.fillStyle = isSelected ? '#222' : '#111'; ctx.beginPath(); ctx.arc(px, py, cellSize / 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = t.id === movingTowerId ? '#ffb000' : (t.type === 'tower_ide' ? '#00f0ff' : t.type === 'tower_cicd' ? '#a855f7' : t.type === 'tower_ai' ? '#f43f5e' : '#00ff41');
    ctx.lineWidth = isSelected ? 3 : 2; if (isSelected) { ctx.shadowBlur = 10; ctx.shadowColor = ctx.strokeStyle; } ctx.stroke(); ctx.shadowBlur = 0;
    drawEmoji(ctx, TOWER_EMOJIS[t.type] || '❓', t.x * cellSize, t.y * cellSize, cellSize);
    if (t.level > 1) { ctx.fillStyle = '#fff'; ctx.font = 'bold 9px monospace'; ctx.fillText(`v${t.level}`, px + cellSize / 4, py + cellSize / 4); }
  });

  gameState.enemies?.forEach(e => {
    const px = e.x * cellSize; const py = e.y * cellSize;
    const isBoss = e.type.startsWith('boss');
    ctx.shadowBlur = isBoss ? 20 : 0; ctx.shadowColor = 'red';
    drawEmoji(ctx, ENEMY_EMOJIS[e.type] || '❓', px, py, cellSize * (isBoss ? 1.5 : 1));
    ctx.shadowBlur = 0;
    const barW = cellSize * 0.8; ctx.fillStyle = 'rgba(255,0,0,0.3)'; ctx.fillRect(px + (cellSize - barW) / 2, py - 10, barW, 2);
    ctx.fillStyle = '#00ff41'; ctx.fillRect(px + (cellSize - barW) / 2, py - 10, barW * (e.hp / e.maxHp), 2);
  });

  gameState.projectiles?.forEach(p => {
    ctx.strokeStyle = '#ffff00'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x * cellSize, p.y * cellSize, 2, 0, Math.PI * 2); ctx.stroke();
  });

  const gx = Math.floor(mousePos.x / cellSize); const gy = Math.floor(mousePos.y / cellSize);
  if (movingTowerId) { ctx.globalAlpha = 0.5; drawEmoji(ctx, '📦', gx * cellSize, gy * cellSize, cellSize); ctx.globalAlpha = 1.0; }
  else if (gameState.map?.[gy]?.[gx] === 0 && !selectedTowerId) {
    ctx.globalAlpha = 0.3;
    drawEmoji(ctx, TOWER_EMOJIS[activeTowerType], gx * cellSize, gy * cellSize, cellSize); ctx.globalAlpha = 1.0;
  }
}
