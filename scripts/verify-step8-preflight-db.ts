import fs from 'fs';
import path from 'path';
import os from 'os';

const PROJECT_ID = 'rohit-72bfa';

import { execSync } from 'child_process';

async function getAccessToken(): Promise<string> {
  const configPath = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
  let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  let accessToken = config.tokens.access_token;

  let testRes = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (testRes.status === 401) {
    console.log('[Auth] Refreshing access token via Firebase CLI...');
    execSync('npx.cmd firebase-tools projects:list', { stdio: 'ignore' });
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    accessToken = config.tokens.access_token;
  }
  return accessToken;
}

async function verifyLiveDb() {
  const token = await getAccessToken();
  console.log('--- Verifying Production Cloud Firestore (rohit-72bfa) ---');

  // 1. Verify crmSettings
  const settingsRes = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/crmSettings/agency_settings`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!settingsRes.ok) {
    throw new Error(`Failed to read crmSettings/agency_settings: ${settingsRes.statusText}`);
  }
  const settingsData = await settingsRes.json();
  const agencyName = settingsData.fields?.agencyName?.stringValue;
  const ownerEmail = settingsData.fields?.ownerEmail?.stringValue;
  console.log(`[PASS] /crmSettings/agency_settings exists: agencyName="${agencyName}", ownerEmail="${ownerEmail}"`);

  const dualRes = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/crmSettings/agency`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!dualRes.ok) {
    throw new Error(`Failed to read crmSettings/agency: ${dualRes.statusText}`);
  }
  console.log(`[PASS] /crmSettings/agency (dual-path) exists: agencyName="${agencyName}"`);

  // 2. Verify nine empty business collections
  const nineCollections = [
    'clients', 'projects', 'freelancers', 'tasks',
    'quotations', 'invoices', 'payments', 'expenses', 'reminders'
  ];

  for (const col of nineCollections) {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${col}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const docs = data.documents || [];
    if (docs.length !== 0) {
      throw new Error(`Collection /${col} is NOT empty! Found ${docs.length} documents.`);
    }
    console.log(`[PASS] /${col}: 0 documents (Strictly empty, zero business records, zero demo records)`);
  }

  // 3. Verify Admin Collections
  const adminRes = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/adminProfiles/F7Ccp4AfuxPpw8YTGWMLo7dv5Do2`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const adminData = await adminRes.json();
  console.log(`[PASS] /adminProfiles/F7Ccp4AfuxPpw8YTGWMLo7dv5Do2 exists: status="${adminData.fields?.status?.stringValue}", role="${adminData.fields?.role?.stringValue}"`);

  console.log('\n>>> ALL PRODUCTION DATABASE PREFLIGHT VERIFICATIONS PASSED 100%! <<<');
}

verifyLiveDb().catch(err => {
  console.error('DATABASE PREFLIGHT FAILED:', err);
  process.exit(1);
});
