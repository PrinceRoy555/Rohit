const fs = require('fs');
const cfg = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));

async function testAuthEndpoint() {
  console.log('Testing Identity Toolkit endpoint with live genuine API key...');
  
  // Test 1: Empty credentials to test API key validity
  const res1 = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${cfg.apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'workall724038@gmail.com',
      password: 'sample-test-password-12345',
      returnSecureToken: true
    })
  });
  
  const data1 = await res1.json();
  console.log('API Key Response Status:', res1.status);
  console.log('API Key Accepted:', data1.error?.message !== 'API key not valid. Please pass a valid API key.');
  console.log('Auth Logic Code:', data1.error?.message || 'SUCCESS');
  
  if (data1.error?.message === 'API key not valid. Please pass a valid API key.') {
    throw new Error('API key is still being rejected by Firebase Auth!');
  }
  
  console.log('>>> Firebase Authentication endpoint successfully accepted the API key and processed the request! <<<');
}

testAuthEndpoint().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
