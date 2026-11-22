const fs = require('fs');
const dotenv = require('dotenv');

const env = dotenv.parse(fs.readFileSync('.env.production.local'));
const config = JSON.parse(fs.readFileSync('firebase-applet-config.json'));

console.log('Comparing Vercel env with firebase-applet-config.json:');
console.log('projectId matches:', env.VITE_FIREBASE_PROJECT_ID === config.projectId);
console.log('apiKey matches:', env.VITE_FIREBASE_API_KEY === config.apiKey);
console.log('appId matches:', env.VITE_FIREBASE_APP_ID === config.appId);
console.log('authDomain matches:', env.VITE_FIREBASE_AUTH_DOMAIN === config.authDomain);
console.log('storageBucket matches:', env.VITE_FIREBASE_STORAGE_BUCKET === config.storageBucket);
console.log('messagingSenderId matches:', env.VITE_FIREBASE_MESSAGING_SENDER_ID === config.messagingSenderId);
console.log('Vercel env apiKey length:', env.VITE_FIREBASE_API_KEY?.length);
console.log('Config apiKey length:', config.apiKey?.length);
