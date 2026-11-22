/**
 * Official Real Firebase Firestore Emulator Test Suite
 * Using @firebase/rules-unit-testing to execute tests against local Firestore Emulator
 */

import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import fs from 'fs';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc
} from 'firebase/firestore';

const PROJECT_ID = 'rohit-72bfa';
const rules = fs.readFileSync('C:/Users/ASUS/OneDrive/Desktop/rohitwork/firestore.rules', 'utf8');

async function runEmulatorTests() {
  console.log('==================================================================');
  console.log('   ROHITWORK CRM — REAL FIRESTORE EMULATOR TEST SUITE   ');
  console.log('==================================================================\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  async function testCase(name: string, fn: () => Promise<void>) {
    totalTests++;
    try {
      await fn();
      passedTests++;
      console.log(`  [PASS] ${name}`);
    } catch (err: any) {
      failedTests++;
      console.error(`  [FAIL] ${name}`);
      console.error(`         Error: ${err.message || err}`);
    }
  }

  let testEnv: RulesTestEnvironment;
  try {
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules,
        host: '127.0.0.1',
        port: 8080
      }
    });
    console.log('[Emulator] Successfully connected to Firestore Emulator at 127.0.0.1:8080\n');
  } catch (initErr: any) {
    console.error('[Emulator] FATAL: Could not connect to Firestore emulator at 127.0.0.1:8080.');
    console.error('Make sure the Firestore emulator is running (firebase emulators:start --only firestore).');
    console.error('Error detail:', initErr.message);
    process.exit(1);
  }

  // Clear data and seed test fixtures
  try {
    await testEnv.clearFirestore();
  } catch {
    await new Promise((r) => setTimeout(r, 500));
    try {
      await testEnv.clearFirestore();
    } catch {
      // Ignored
    }
  }

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const adminDb = context.firestore();
    // Seed admin profiles
    await setDoc(doc(adminDb, 'adminProfiles', '7wupZnpLh1MPTYpci5keNIS1Fyt1'), {
      role: 'super_admin',
      status: 'active',
      email: 'workall724038@gmail.com'
    });
    await setDoc(doc(adminDb, 'adminProfiles', 'usr_admin_standard'), {
      role: 'admin',
      status: 'active',
      email: 'admin@rohitwork.in'
    });
    await setDoc(doc(adminDb, 'adminProfiles', 'usr_editor'), {
      role: 'editor',
      status: 'active',
      email: 'editor@rohitwork.in'
    });
    await setDoc(doc(adminDb, 'adminProfiles', 'usr_disabled_admin'), {
      role: 'admin',
      status: 'disabled',
      email: 'disabled@rohitwork.in'
    });
    await setDoc(doc(adminDb, 'adminProfiles', 'usr_disabled_super'), {
      role: 'super_admin',
      status: 'disabled',
      email: 'disabled_super@rohitwork.in'
    });

    // Seed test collections
    await setDoc(doc(adminDb, 'siteConfig', 'live'), { siteName: 'Rohitwork', version: '2.0' });
    await setDoc(doc(adminDb, 'siteConfig', 'draft'), { siteName: 'Rohitwork Draft', version: '2.1' });
    await setDoc(doc(adminDb, 'clients', 'client_existing'), { name: 'Acme Corp', status: 'active' });
    await setDoc(doc(adminDb, 'payments', 'pay_existing'), { amount: 50000, status: 'received' });
    await setDoc(doc(adminDb, 'freelancers', 'free_existing'), { name: 'John Dev', hourlyRate: 1500 });
  });

  // Contexts
  const superAdminDb = testEnv.authenticatedContext('7wupZnpLh1MPTYpci5keNIS1Fyt1', {
    email: 'workall724038@gmail.com',
    email_verified: true
  }).firestore();

  const standardAdminDb = testEnv.authenticatedContext('usr_admin_standard', {
    email: 'admin@rohitwork.in',
    email_verified: true
  }).firestore();

  const editorDb = testEnv.authenticatedContext('usr_editor', {
    email: 'editor@rohitwork.in',
    email_verified: true
  }).firestore();

  const disabledAdminDb = testEnv.authenticatedContext('usr_disabled_admin', {
    email: 'disabled@rohitwork.in',
    email_verified: true
  }).firestore();

  const disabledSuperAdminDb = testEnv.authenticatedContext('usr_disabled_super', {
    email: 'disabled_super@rohitwork.in',
    email_verified: true
  }).firestore();

  const unverifiedAttackerDb = testEnv.authenticatedContext('attacker_random_uid', {
    email: 'workall724038@gmail.com',
    email_verified: false
  }).firestore();

  const visitorDb = testEnv.unauthenticatedContext().firestore();

  // -------------------------------------------------------------
  // SUITE 1: UNAUTHENTICATED VISITOR PERMISSIONS
  // -------------------------------------------------------------
  console.log('--- Suite 1: Unauthenticated Visitor Permissions ---');

  await testCase('Visitor can read /siteConfig/live', async () => {
    await assertSucceeds(getDoc(doc(visitorDb, 'siteConfig', 'live')));
  });

  await testCase('Visitor CANNOT read /siteConfig/draft', async () => {
    await assertFails(getDoc(doc(visitorDb, 'siteConfig', 'draft')));
  });

  await testCase('Visitor CANNOT write /siteConfig/live', async () => {
    await assertFails(setDoc(doc(visitorDb, 'siteConfig', 'live'), { hacked: true }));
  });

  await testCase('Visitor CANNOT read /clients', async () => {
    await assertFails(getDoc(doc(visitorDb, 'clients', 'client_existing')));
  });

  await testCase('Visitor CANNOT write /clients', async () => {
    await assertFails(setDoc(doc(visitorDb, 'clients', 'client_new'), { name: 'Fake' }));
  });

  await testCase('Visitor CANNOT read /payments', async () => {
    await assertFails(getDoc(doc(visitorDb, 'payments', 'pay_existing')));
  });

  await testCase('Visitor CANNOT read /adminProfiles', async () => {
    await assertFails(getDoc(doc(visitorDb, 'adminProfiles', '7wupZnpLh1MPTYpci5keNIS1Fyt1')));
  });

  // -------------------------------------------------------------
  // SUITE 2: PUBLIC FORM INTAKE VALIDATION & REJECTIONS
  // -------------------------------------------------------------
  console.log('\n--- Suite 2: Public Website Form Payloads & Anti-DoS Validation ---');

  const validContact = {
    name: 'Aarav Patel',
    email: 'aarav@company.in',
    selectedService: 'Web App Development',
    projectDescription: 'Building a modern full-stack CRM and customer portal.',
    consentAccepted: true,
    source: 'website-contact-form',
    status: 'new',
    createdAt: new Date().toISOString()
  };

  await testCase('Visitor CAN submit valid contact enquiry', async () => {
    await assertSucceeds(addDoc(collection(visitorDb, 'contactEnquiries'), validContact));
  });

  await testCase('Visitor CANNOT submit contact enquiry without consentAccepted', async () => {
    await assertFails(addDoc(collection(visitorDb, 'contactEnquiries'), {
      ...validContact,
      consentAccepted: false
    }));
  });

  await testCase('Visitor CANNOT submit contact enquiry with tiny description (<10 chars)', async () => {
    await assertFails(addDoc(collection(visitorDb, 'contactEnquiries'), {
      ...validContact,
      projectDescription: 'Too short'
    }));
  });

  await testCase('Visitor CANNOT submit contact enquiry with oversized name (>100 chars, Anti-DoS)', async () => {
    await assertFails(addDoc(collection(visitorDb, 'contactEnquiries'), {
      ...validContact,
      name: 'A'.repeat(105)
    }));
  });

  // Phone-only contact enquiry tests
  const phoneOnlyContact = {
    name: 'Rajesh Sharma',
    phone: '+919876543210',
    selectedService: 'Mobile App Development',
    projectDescription: 'Building a cross-platform Flutter application.',
    consentAccepted: true,
    source: 'website-contact-form',
    status: 'new',
    createdAt: new Date().toISOString()
  };

  await testCase('Visitor CAN submit phone-only contact enquiry (no email)', async () => {
    await assertSucceeds(addDoc(collection(visitorDb, 'contactEnquiries'), phoneOnlyContact));
  });

  await testCase('Visitor CAN submit contact enquiry with BOTH email and phone', async () => {
    await assertSucceeds(addDoc(collection(visitorDb, 'contactEnquiries'), {
      ...phoneOnlyContact,
      email: 'rajesh@company.in'
    }));
  });

  await testCase('Visitor CANNOT submit contact enquiry with NEITHER email nor phone', async () => {
    const { email, ...noContact } = validContact as any;
    await assertFails(addDoc(collection(visitorDb, 'contactEnquiries'), noContact));
  });

  await testCase('Visitor CANNOT submit contact enquiry with invalid phone (<7 chars)', async () => {
    await assertFails(addDoc(collection(visitorDb, 'contactEnquiries'), {
      ...phoneOnlyContact,
      phone: '12345'
    }));
  });

  await testCase('Visitor CANNOT submit contact enquiry with oversized phone (>30 chars)', async () => {
    await assertFails(addDoc(collection(visitorDb, 'contactEnquiries'), {
      ...phoneOnlyContact,
      phone: '+91' + '9'.repeat(35)
    }));
  });

  await testCase('Visitor CANNOT submit contact enquiry with non-string phone', async () => {
    await assertFails(addDoc(collection(visitorDb, 'contactEnquiries'), {
      ...phoneOnlyContact,
      phone: 9876543210 as any
    }));
  });

  await testCase('Visitor CANNOT submit contact enquiry with valid phone but invalid email (<5 chars)', async () => {
    await assertFails(addDoc(collection(visitorDb, 'contactEnquiries'), {
      ...phoneOnlyContact,
      email: 'a@b'
    }));
  });

  const validLead = {
    name: 'Neha Gupta',
    email: 'neha@startup.io',
    source: 'google-search',
    status: 'new',
    createdAt: new Date().toISOString()
  };

  await testCase('Visitor CAN submit valid email-only lead intake', async () => {
    await assertSucceeds(addDoc(collection(visitorDb, 'leads'), validLead));
  });

  const phoneOnlyLead = {
    name: 'Vikram Malhotra',
    phone: '+919812345678',
    source: 'google-search',
    status: 'new',
    createdAt: new Date().toISOString()
  };

  await testCase('Visitor CAN submit valid phone-only lead intake (no email)', async () => {
    await assertSucceeds(addDoc(collection(visitorDb, 'leads'), phoneOnlyLead));
  });

  await testCase('Visitor CAN submit lead intake with BOTH email and phone', async () => {
    await assertSucceeds(addDoc(collection(visitorDb, 'leads'), {
      ...phoneOnlyLead,
      email: 'vikram@malhotra.org'
    }));
  });

  await testCase('Visitor CANNOT submit lead intake with NEITHER email nor phone', async () => {
    const { email, ...noContactLead } = validLead as any;
    await assertFails(addDoc(collection(visitorDb, 'leads'), noContactLead));
  });

  await testCase('Visitor CANNOT submit lead intake with invalid phone (<7 chars)', async () => {
    await assertFails(addDoc(collection(visitorDb, 'leads'), {
      ...phoneOnlyLead,
      phone: '123'
    }));
  });

  await testCase('Visitor CANNOT submit lead intake with oversized phone (>30 chars)', async () => {
    await assertFails(addDoc(collection(visitorDb, 'leads'), {
      ...phoneOnlyLead,
      phone: '+1' + '0'.repeat(35)
    }));
  });

  await testCase('Visitor CANNOT submit lead intake with non-string phone', async () => {
    await assertFails(addDoc(collection(visitorDb, 'leads'), {
      ...phoneOnlyLead,
      phone: 9812345678 as any
    }));
  });

  await testCase('Visitor CANNOT submit lead intake with valid phone but invalid email', async () => {
    await assertFails(addDoc(collection(visitorDb, 'leads'), {
      ...phoneOnlyLead,
      email: 'x@y'
    }));
  });

  await testCase('Visitor CANNOT submit lead intake with invalid status', async () => {
    await assertFails(addDoc(collection(visitorDb, 'leads'), {
      ...validLead,
      status: 'converted'
    }));
  });

  const validNewsletter = {
    email: 'news@client.com',
    emailNormalised: 'news@client.com',
    status: 'active',
    source: 'website-newsletter'
  };

  await testCase('Visitor CAN submit newsletter subscription', async () => {
    await assertSucceeds(setDoc(doc(visitorDb, 'newsletterSubscribers', 'hash_news_client'), validNewsletter));
  });

  await testCase('Visitor CANNOT read newsletterSubscribers', async () => {
    await assertFails(getDoc(doc(visitorDb, 'newsletterSubscribers', 'hash_news_client')));
  });

  // -------------------------------------------------------------
  // SUITE 3: DISABLED ADMINISTRATOR LOCKOUT
  // -------------------------------------------------------------
  console.log('\n--- Suite 3: Disabled Administrator Complete Revocation ---');

  await testCase('Disabled Admin CANNOT read /clients', async () => {
    await assertFails(getDoc(doc(disabledAdminDb, 'clients', 'client_existing')));
  });

  await testCase('Disabled Admin CANNOT write /clients', async () => {
    await assertFails(setDoc(doc(disabledAdminDb, 'clients', 'client_blocked'), { name: 'Blocked' }));
  });

  await testCase('Disabled Super Admin CANNOT read /payments', async () => {
    await assertFails(getDoc(doc(disabledSuperAdminDb, 'payments', 'pay_existing')));
  });

  await testCase('Disabled Super Admin CANNOT write /payments', async () => {
    await assertFails(setDoc(doc(disabledSuperAdminDb, 'payments', 'pay_blocked'), { amount: 9999 }));
  });

  await testCase('Disabled Super Admin CANNOT write /adminProfiles', async () => {
    await assertFails(updateDoc(doc(disabledSuperAdminDb, 'adminProfiles', 'usr_disabled_super'), { status: 'active' }));
  });

  // -------------------------------------------------------------
  // SUITE 4: UNVERIFIED BOOTSTRAP ATTACK REJECTION
  // -------------------------------------------------------------
  console.log('\n--- Suite 4: Unverified Bootstrap Escalation Rejection ---');

  await testCase('Unverified email claiming bootstrap email CANNOT read /clients', async () => {
    await assertFails(getDoc(doc(unverifiedAttackerDb, 'clients', 'client_existing')));
  });

  await testCase('Unverified email claiming bootstrap email CANNOT write /payments', async () => {
    await assertFails(setDoc(doc(unverifiedAttackerDb, 'payments', 'pay_hacked'), { amount: 1000 }));
  });

  await testCase('Unverified email claiming bootstrap email CANNOT write /adminProfiles', async () => {
    await assertFails(setDoc(doc(unverifiedAttackerDb, 'adminProfiles', 'attacker_random_uid'), { role: 'super_admin' }));
  });

  // -------------------------------------------------------------
  // SUITE 5: STANDARD ADMIN FINANCIAL & ROLE RESTRICTIONS
  // -------------------------------------------------------------
  console.log('\n--- Suite 5: Standard Admin Role Boundaries & Financial Isolation ---');

  await testCase('Standard Admin CAN read and write /clients', async () => {
    await assertSucceeds(setDoc(doc(standardAdminDb, 'clients', 'client_by_admin'), { name: 'Valid Client' }));
  });

  await testCase('Standard Admin CAN read and write /projects', async () => {
    await assertSucceeds(setDoc(doc(standardAdminDb, 'projects', 'proj_by_admin'), { title: 'Valid Project' }));
  });

  await testCase('Standard Admin CAN read and write /tasks', async () => {
    await assertSucceeds(setDoc(doc(standardAdminDb, 'tasks', 'task_by_admin'), { task: 'Valid Task' }));
  });

  await testCase('Standard Admin CAN read /payments (financial reporting)', async () => {
    await assertSucceeds(getDoc(doc(standardAdminDb, 'payments', 'pay_existing')));
  });

  await testCase('Standard Admin CANNOT write /payments (financial isolation)', async () => {
    await assertFails(setDoc(doc(standardAdminDb, 'payments', 'pay_illegal'), { amount: 5000 }));
  });

  await testCase('Standard Admin CANNOT write /freelancers (payout rate isolation)', async () => {
    await assertFails(setDoc(doc(standardAdminDb, 'freelancers', 'free_illegal'), { hourlyRate: 9000 }));
  });

  await testCase('Standard Admin CANNOT write /crmSettings', async () => {
    await assertFails(setDoc(doc(standardAdminDb, 'crmSettings', 'financial_rules'), { taxRate: 0 }));
  });

  await testCase('Standard Admin CANNOT write /adminProfiles (privilege escalation)', async () => {
    await assertFails(updateDoc(doc(standardAdminDb, 'adminProfiles', 'usr_admin_standard'), { role: 'super_admin' }));
  });

  await testCase('Standard Admin CANNOT write /admins', async () => {
    await assertFails(setDoc(doc(standardAdminDb, 'admins', 'usr_admin_standard'), { role: 'super_admin' }));
  });

  // -------------------------------------------------------------
  // SUITE 6: SUPER ADMIN FULL PRIVILEGES
  // -------------------------------------------------------------
  console.log('\n--- Suite 6: Super Admin Authority & Operations ---');

  await testCase('Super Admin CAN write /clients', async () => {
    await assertSucceeds(setDoc(doc(superAdminDb, 'clients', 'client_by_super'), { name: 'Super Client' }));
  });

  await testCase('Super Admin CAN write /payments', async () => {
    await assertSucceeds(setDoc(doc(superAdminDb, 'payments', 'pay_by_super'), { amount: 75000 }));
  });

  await testCase('Super Admin CAN write /freelancers', async () => {
    await assertSucceeds(setDoc(doc(superAdminDb, 'freelancers', 'free_by_super'), { hourlyRate: 2000 }));
  });

  await testCase('Super Admin CAN write /expenses', async () => {
    await assertSucceeds(setDoc(doc(superAdminDb, 'expenses', 'exp_by_super'), { amount: 12000 }));
  });

  await testCase('Super Admin CAN write /crmSettings', async () => {
    await assertSucceeds(setDoc(doc(superAdminDb, 'crmSettings', 'app_config'), { backupSchedule: 'daily' }));
  });

  await testCase('Super Admin CAN write /adminProfiles', async () => {
    await assertSucceeds(setDoc(doc(superAdminDb, 'adminProfiles', 'new_manager_profile'), {
      role: 'admin',
      status: 'active'
    }));
  });

  // Cleanup test environment
  await testEnv.cleanup();

  console.log('\n==================================================================');
  console.log(`REAL FIRESTORE EMULATOR RESULTS: ${passedTests} passed, ${failedTests} failed (Total: ${totalTests})`);
  console.log('==================================================================');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log('\n>>> ALL REAL FIRESTORE EMULATOR TESTS PASSED WITH ZERO FAILURES! <<<\n');
    process.exit(0);
  }
}

runEmulatorTests().catch((err) => {
  console.error('[Emulator Tests] Fatal execution error:', err);
  process.exit(1);
});
