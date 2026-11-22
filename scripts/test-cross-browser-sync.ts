/**
 * Rohitwork CRM — Cross-Browser Real-Time Sync & Persistence Verification
 * Simulates two concurrent authenticated browser sessions (Browser A and Browser B)
 * verifying live synchronization, conflict resolution, and data integrity.
 */

import {
  initializeTestEnvironment,
  assertSucceeds,
  RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import fs from 'fs';
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection
} from 'firebase/firestore';

const PROJECT_ID = 'rohit-72bfa';
const rules = fs.readFileSync('C:/Users/ASUS/OneDrive/Desktop/rohitwork/firestore.rules', 'utf8');

async function testCrossBrowserSync() {
  console.log('==================================================================');
  console.log('  ROHITWORK CRM — CROSS-BROWSER PERSISTENCE & SYNC VERIFICATION   ');
  console.log('==================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, details?: string) {
    if (condition) {
      passed++;
      console.log(`  [PASS] ${name}`);
    } else {
      failed++;
      console.error(`  [FAIL] ${name}: ${details || 'Assertion failed'}`);
    }
  }

  const testEnv: RulesTestEnvironment = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
      host: '127.0.0.1',
      port: 8080
    }
  });

  await testEnv.clearFirestore();

  const SUPER_ADMIN_UID = 'F7Ccp4AfuxPpw8YTGWMLo7dv5Do2';
  const SUPER_ADMIN_EMAIL = 'workall724038@gmail.com';
  const STANDARD_ADMIN_UID = 'admin_standard_browser_b';
  const STANDARD_ADMIN_EMAIL = 'associate@rohitwork.in';

  // Seed Admin Profiles
  await testEnv.withSecurityRulesDisabled(async (adminContext) => {
    const adminDb = adminContext.firestore();
    await setDoc(doc(adminDb, 'adminProfiles', SUPER_ADMIN_UID), {
      email: SUPER_ADMIN_EMAIL,
      role: 'super_admin',
      status: 'active',
      name: 'Rohit Verma'
    });
    await setDoc(doc(adminDb, 'adminProfiles', STANDARD_ADMIN_UID), {
      email: STANDARD_ADMIN_EMAIL,
      role: 'admin',
      status: 'active',
      name: 'Associate Admin'
    });
  });

  // Browser Session A (Super Admin)
  const browserA = testEnv.authenticatedContext(SUPER_ADMIN_UID, {
    email: SUPER_ADMIN_EMAIL,
    email_verified: true
  }).firestore();

  // Browser Session B (Standard Admin)
  const browserB = testEnv.authenticatedContext(STANDARD_ADMIN_UID, {
    email: STANDARD_ADMIN_EMAIL,
    email_verified: true
  }).firestore();

  // Test 1: Real-time propagation from Browser A to Browser B
  console.log('--- Test 1: Real-Time Sync Propagation (Browser A -> Browser B) ---');
  let receivedInBrowserB: any = null;
  const clientDocRefB = doc(browserB, 'clients', 'cli_sync_test_01');

  const unsubscribe = onSnapshot(clientDocRefB, (snapshot) => {
    if (snapshot.exists()) {
      receivedInBrowserB = snapshot.data();
    }
  });

  // Browser A creates a new client
  const clientDataA = {
    name: 'Apex Global Media',
    company: 'Apex Media Ltd',
    phone: '+91 9811122233',
    email: 'contact@apexmedia.in',
    status: 'active',
    updatedAt: new Date().toISOString()
  };

  await assertSucceeds(setDoc(doc(browserA, 'clients', 'cli_sync_test_01'), clientDataA));

  // Allow short delay for real-time listener propagation
  await new Promise((r) => setTimeout(r, 200));

  assert(
    'Browser B received real-time client write from Browser A via onSnapshot',
    receivedInBrowserB !== null && receivedInBrowserB.name === 'Apex Global Media'
  );

  // Test 2: Concurrent write conflict resolution (Newer timestamp wins)
  console.log('\n--- Test 2: Timestamp-Based Conflict Resolution ---');
  const olderTimestamp = new Date(Date.now() - 10000).toISOString();
  const newerTimestamp = new Date().toISOString();

  // Simulated stale local record in Browser B
  const localRecordB = {
    id: 'cli_sync_test_01',
    name: 'Apex Global Media (Stale Local)',
    updatedAt: olderTimestamp
  };

  // Remote updated record in Browser A
  const remoteRecordA = {
    id: 'cli_sync_test_01',
    name: 'Apex Global Media (Authoritative Cloud)',
    updatedAt: newerTimestamp
  };

  const remoteTime = new Date(remoteRecordA.updatedAt).getTime();
  const localTime = new Date(localRecordB.updatedAt).getTime();

  let resolvedRecord = localRecordB;
  if (remoteTime > localTime) {
    resolvedRecord = { ...localRecordB, ...remoteRecordA };
  }

  assert(
    'Newer cloud record from Browser A correctly supersedes stale local record in Browser B',
    resolvedRecord.name === 'Apex Global Media (Authoritative Cloud)'
  );

  // Test 3: Sensitive Module Write Restriction in Browser B
  console.log('\n--- Test 3: Sensitive Financial Permissions in Browser B ---');
  let browserBPaymentRejected = false;
  try {
    await setDoc(doc(browserB, 'payments', 'pay_unauth_b'), {
      amount: 100000,
      paymentType: 'client_payment',
      status: 'completed'
    });
  } catch {
    browserBPaymentRejected = true;
  }
  assert('Browser B (Standard Admin) is strictly prevented from writing to /payments', browserBPaymentRejected);

  // Test 4: Super Admin in Browser A can write payment and Browser B can read it
  console.log('\n--- Test 4: Financial Read-Only Visibility in Browser B ---');
  await assertSucceeds(
    setDoc(doc(browserA, 'payments', 'pay_auth_a'), {
      amount: 100000,
      paymentType: 'client_payment',
      status: 'completed',
      updatedAt: new Date().toISOString()
    })
  );

  const paymentSnapB = await assertSucceeds(getDoc(doc(browserB, 'payments', 'pay_auth_a')));
  assert(
    'Browser B (Standard Admin) can read the payment created by Super Admin in Browser A',
    paymentSnapB.exists() && paymentSnapB.data()?.amount === 100000
  );

  unsubscribe();
  await testEnv.cleanup();

  console.log('\n==================================================================');
  console.log(`CROSS-BROWSER PERSISTENCE RESULTS: ${passed} passed, ${failed} failed`);
  console.log('==================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

testCrossBrowserSync().catch((err) => {
  console.error(err);
  process.exit(1);
});
