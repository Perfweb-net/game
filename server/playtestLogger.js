const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../logs');
const LOG_PATH = path.join(LOG_DIR, 'playtest.log');

// Log structuré (1 ligne JSON / évènement) pour analyser un playtest après coup :
// vagues atteintes, durée des sessions, popularité des tours, taux de victoire...
function logEvent(event, data = {}) {
  const line = JSON.stringify({ ts: new Date().toISOString(), event, ...data }) + '\n';
  fs.mkdir(LOG_DIR, { recursive: true }, () => {
    fs.appendFile(LOG_PATH, line, () => {});
  });
}

module.exports = { logEvent, LOG_PATH };
