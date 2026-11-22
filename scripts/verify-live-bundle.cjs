const fs = require('fs');
const cfg = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));

async function verifyLiveBundle() {
  console.log('Fetching live index.html from production...');
  const htmlRes = await fetch('https://www.rohitwork.in/', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await htmlRes.text();
  
  // Find JS bundle path
  const match = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
  if (!match) {
    throw new Error('Could not find index-*.js in live HTML');
  }
  
  const jsUrl = 'https://www.rohitwork.in' + match[1];
  console.log('Fetching live JS bundle:', jsUrl);
  const jsRes = await fetch(jsUrl);
  const jsCode = await jsRes.text();
  
  const containsValidKey = jsCode.includes(cfg.apiKey);
  const containsGoogleSignIn = jsCode.includes('Sign In with Google');
  
  console.log('--- Live Bundle Verification ---');
  console.log(`[PASS] Contains genuine Firebase API key: ${containsValidKey}`);
  console.log(`[PASS] Google Sign-In button removed: ${!containsGoogleSignIn}`);
  
  if (!containsValidKey) {
    throw new Error('FATAL: Genuine API key not found in live production bundle!');
  }
  if (containsGoogleSignIn) {
    throw new Error('FATAL: Google Sign-In still present in live production bundle!');
  }
}

verifyLiveBundle().catch(err => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
