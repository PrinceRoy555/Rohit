const fs = require('fs');
const dotenv = require('dotenv');

const env = dotenv.parse(fs.readFileSync('.env.production.local'));
const config = JSON.parse(fs.readFileSync('firebase-applet-config.json'));

async function testApiKey(name, apiKey) {
  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        continueUri: 'https://rohit-72bfa.firebaseapp.com',
        identifier: 'test@example.com'
      })
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`[PASS] ${name}: Valid! HTTP 200 returned.`);
    } else {
      console.log(`[FAIL] ${name}: HTTP ${res.status} - Code: ${data.error?.message || data.error?.code}`);
    }
  } catch (err) {
    console.log(`[ERR] ${name}: ${err.message}`);
  }
}

async function run() {
  console.log('Testing both API keys against Firebase Auth API:');
  await testApiKey('Vercel env VITE_FIREBASE_API_KEY', env.VITE_FIREBASE_API_KEY);
  await testApiKey('firebase-applet-config.json apiKey', config.apiKey);
}

run().catch(console.error);
