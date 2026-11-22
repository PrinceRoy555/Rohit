const fs = require('fs');
const { spawnSync } = require('child_process');

const cfg = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));

const res = spawnSync('npx.cmd', [
  'vercel', 'env', 'add', 'VITE_FIREBASE_API_KEY',
  '--environment', 'production',
  '--type', 'config',
  '--value', cfg.apiKey,
  '--yes'
], { stdio: 'inherit', shell: true });

if (res.status === 0) {
  console.log('Successfully set VITE_FIREBASE_API_KEY in Vercel production environment!');
} else {
  console.error('Failed with exit code:', res.status);
}
