const fs = require('fs');
const path = require('path');
const os = require('os');

async function getAccessToken() {
  const configPath = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
  if (!fs.existsSync(configPath)) {
    throw new Error('firebase-tools.json not found');
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const tokens = config.tokens;
  
  // Test if access token works
  let accessToken = tokens.access_token;
  const testRes = await fetch('https://firestore.googleapis.com/v1/projects/rohit-72bfa/databases/(default)/documents', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  if (testRes.status === 401 && tokens.refresh_token) {
    console.log('Access token expired, refreshing with Google OAuth...');
    // Refresh access token
    const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
        grant_type: 'refresh_token',
        refresh_token: tokens.refresh_token
      })
    });
    const refreshData = await refreshRes.json();
    if (refreshData.access_token) {
      accessToken = refreshData.access_token;
      config.tokens.access_token = accessToken;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
      console.log('Access token refreshed and updated in configstore.');
    } else {
      throw new Error(`Failed to refresh token: ${JSON.stringify(refreshData)}`);
    }
  }
  
  return accessToken;
}

async function run() {
  const token = await getAccessToken();
  console.log('Successfully acquired Google Cloud Access Token.');
  
  const targetCollections = [
    'leads', 'clients', 'projects', 'freelancers', 'tasks',
    'quotations', 'invoices', 'payments', 'expenses', 'reminders',
    'crmSettings', 'adminProfiles', 'admins', 'siteConfig', 'enquiries'
  ];
  
  console.log('\n--- Querying Production Cloud Firestore (rohit-72bfa) ---');
  const inventory = {};
  
  for (const col of targetCollections) {
    try {
      const url = `https://firestore.googleapis.com/v1/projects/rohit-72bfa/databases/(default)/documents/${col}?pageSize=100`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errText = await res.text();
        inventory[col] = { count: 0, error: `HTTP ${res.status}: ${errText}` };
      } else {
        const data = await res.json();
        const docs = data.documents || [];
        inventory[col] = {
          count: docs.length,
          documents: docs.map(d => ({
            name: d.name.split('/').pop(),
            fields: Object.keys(d.fields || {})
          }))
        };
      }
    } catch (e) {
      inventory[col] = { count: 0, error: e.message };
    }
  }
  
  console.log(JSON.stringify(inventory, null, 2));
}

run().catch(console.error);
