// Se déclenche automatiquement après `npm install` (voir "postinstall" dans package.json) :
// installe les dépendances client, crée .env s'il n'existe pas encore, applique les
// migrations Prisma. Objectif : `npm install` seul suffit pour tout préparer.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const envPath = path.join(root, '.env');
const envExamplePath = path.join(root, '.env.example');

function run(cmd, cwd) {
  execSync(cmd, { cwd, stdio: 'inherit' });
}

console.log('\n[setup] Installation des dépendances client...');
run('npm install', path.join(root, 'client'));

if (!fs.existsSync(envPath)) {
  fs.copyFileSync(envExamplePath, envPath);
  console.log('[setup] .env créé depuis .env.example.');
} else {
  console.log('[setup] .env déjà présent, non modifié.');
}

console.log('[setup] Application des migrations Prisma (SQLite)...');
run('npx prisma migrate deploy', root);

console.log(`
[setup] Terminé. Pour lancer le projet :
  - Dev (2 terminaux)   : npm run dev   +   npm --prefix client run dev
  - Un seul process     : npm run build && npm start
`);
