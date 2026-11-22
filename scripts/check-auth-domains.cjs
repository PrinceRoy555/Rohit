const fs = require('fs');
const path = require('path');
const os = require('os');

async function checkDomains() {
  const configPath = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const token = config.tokens.access_token;
  
  const res = await fetch('https://identitytoolkit.googleapis.com/admin/v2/projects/rohit-72bfa/config', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.ok) {
    const data = await res.json();
    console.log('Firebase Auth Authorized Domains:');
    console.log(data.authorizedDomains || []);
  } else {
    console.log('Error fetching auth config:', res.status, await res.text());
  }
}

checkDomains().catch(console.error);
