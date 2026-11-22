import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import fs from 'fs';

async function verifyBackupRules() {
  const rulesPath = 'C:/Users/ASUS/.gemini/antigravity/brain/84557842-dbcb-41c8-b0c1-be41934def19/rollback/production-live-deployed-firestore.rules.backup';
  const rules = fs.readFileSync(rulesPath, 'utf8');

  console.log('[Rollback Verification] Loading live deployed backup rules into Firestore Emulator...');
  const testEnv = await initializeTestEnvironment({
    projectId: 'rohit-72bfa',
    firestore: {
      rules,
      host: '127.0.0.1',
      port: 8080
    }
  });

  console.log('[Rollback Verification] SUCCESS: Live deployed backup rules compiled and parsed cleanly by Firestore Engine!');
  await testEnv.cleanup();
}

verifyBackupRules().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error('[Rollback Verification] ERROR:', err);
  process.exit(1);
});
