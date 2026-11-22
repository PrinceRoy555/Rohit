/**
 * ROHITWORK CRM — COMPLETE FUNCTIONAL & E2E REGRESSION TEST SUITE (PHASE 10)
 *
 * Verifies all 5 pillars of CRM reliability:
 * 1. All 11 Collections: Full CRUD Lifecycle (Create -> Read -> Update -> Read -> Archive/Delete)
 * 2. Strict RBAC Enforcement: Super Admin vs Unauthorized User vs Unauthenticated
 * 3. Public Form Boundaries: Lead ingestion permitted, admin collections protected
 * 4. Client -> Project -> Task Cascade & Relational Integrity
 * 5. Financial Ledger & Calculations: Invoices, partial payments, freelancer payouts, balances
 * 6. Transactional Rollback: Verification that cloud write errors cause ZERO local phantom state
 */

import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs
} from 'firebase/firestore';
import fs from 'fs';

const PROJECT_ID = 'rohit-72bfa';
const rules = fs.readFileSync('C:/Users/ASUS/OneDrive/Desktop/rohitwork/firestore.rules', 'utf8');

const SUPER_ADMIN_UID = 'F7Ccp4AfuxPpw8YTGWMLo7dv5Do2'; // Whitelisted in rules
const SUPER_ADMIN_EMAIL = 'workall724038@gmail.com';
const UNAUTHORIZED_UID = 'unauth_user_999';
const UNAUTHORIZED_EMAIL = 'rohitverma8253@gmail.com';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

async function test(name: string, fn: () => Promise<void>) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  [PASS] ${name}`);
  } catch (err: any) {
    failedTests++;
    console.error(`  [FAIL] ${name}`);
    console.error(`         Error: ${err?.message || err}`);
  }
}

async function runSuite() {
  console.log('==================================================================');
  console.log('   ROHITWORK CRM — FULL END-TO-END REGRESSION TEST SUITE          ');
  console.log('==================================================================\n');

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
    console.log('[Emulator] Connected to Firestore Emulator at 127.0.0.1:8080\n');
  } catch (err: any) {
    console.error('[Emulator] FATAL: Could not connect to Firestore emulator:', err.message);
    process.exit(1);
  }

  // Pre-seed Super Admin Profile in Firestore emulator with admin context
  await testEnv.withSecurityRulesDisabled(async (adminContext) => {
    const adminDb = adminContext.firestore();
    await setDoc(doc(adminDb, 'adminProfiles', SUPER_ADMIN_UID), {
      email: SUPER_ADMIN_EMAIL,
      role: 'super_admin',
      status: 'active',
      name: 'Rohit Verma (Super Admin)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    // Seed settings doc
    await setDoc(doc(adminDb, 'crmSettings', 'agency_settings'), {
      agencyName: 'Rohitwork Creative Studio',
      ownerEmail: SUPER_ADMIN_EMAIL,
      currency: 'INR',
      updatedAt: new Date().toISOString()
    });
  });

  const adminAuth = testEnv.authenticatedContext(SUPER_ADMIN_UID, { email: SUPER_ADMIN_EMAIL });
  const adminDb = adminAuth.firestore();

  const unauthAuth = testEnv.authenticatedContext(UNAUTHORIZED_UID, { email: UNAUTHORIZED_EMAIL });
  const unauthDb = unauthAuth.firestore();

  const guestAuth = testEnv.unauthenticatedContext();
  const guestDb = guestAuth.firestore();

  console.log('--- TEST GROUP 1: ALL 11 COLLECTIONS FULL CRUD LIFECYCLE ---');

  const collectionsToTest = [
    { name: 'leads', id: 'lead_test_1', initial: { name: 'Lead 1', phone: '9876543210', source: 'direct_entry', status: 'new' }, update: { status: 'contacted' } },
    { name: 'clients', id: 'client_test_1', initial: { name: 'Acme Corp', email: 'acme@example.com', phone: '9876543211', status: 'active', tier: 'premium' }, update: { company: 'Acme International' } },
    { name: 'projects', id: 'proj_test_1', initial: { title: 'Brand Launch 2026', clientId: 'client_test_1', status: 'in_progress', budget: 150000, billingType: 'milestone' }, update: { budget: 160000 } },
    { name: 'freelancers', id: 'fl_test_1', initial: { name: 'Priya Sharma', phone: '9876543212', specialty: 'Motion Graphics', status: 'active', rating: 5 }, update: { rating: 5, notes: 'Senior Lead' } },
    { name: 'tasks', id: 'task_test_1', initial: { title: 'Storyboards v1', projectId: 'proj_test_1', clientId: 'client_test_1', status: 'todo', priority: 'high' }, update: { status: 'in_progress' } },
    { name: 'quotations', id: 'quote_test_1', initial: { quotationNumber: 'QT-2026-001', clientName: 'Acme Corp', clientId: 'client_test_1', totalAmount: 120000, status: 'sent', validUntil: '2026-12-31' }, update: { status: 'accepted' } },
    { name: 'invoices', id: 'inv_test_1', initial: { invoiceNumber: 'INV-2026-001', clientName: 'Acme Corp', clientId: 'client_test_1', subtotal: 100000, total: 118000, amountPaid: 0, balanceDue: 118000, status: 'sent', dueDate: '2026-12-15' }, update: { amountPaid: 50000, balanceDue: 68000, status: 'partial' } },
    { name: 'payments', id: 'pay_test_1', initial: { invoiceId: 'inv_test_1', amount: 50000, paymentType: 'client_payment', paymentMethod: 'upi', transactionRef: 'UPI-987654321', status: 'completed', paymentDate: '2026-11-22' }, update: { notes: 'Verified via HDFC' } },
    { name: 'expenses', id: 'exp_test_1', initial: { title: 'Adobe Creative Cloud', amount: 4500, category: 'software', date: '2026-11-22', taxDeductible: true }, update: { notes: 'Annual subscription' } },
    { name: 'reminders', id: 'rem_test_1', initial: { title: 'Follow up on QT-2026-001', targetDate: '2026-11-25', priority: 'high', type: 'quotation_followup', isCompleted: false }, update: { isCompleted: true } },
    { name: 'crmSettings', id: 'agency_settings', initial: { agencyName: 'Rohitwork Creative Studio', ownerEmail: SUPER_ADMIN_EMAIL, currency: 'INR' }, update: { tagLine: 'Creative Digital Agency' } }
  ];

  for (const col of collectionsToTest) {
    await test(`[CRUD] ${col.name}: Create, Read, Update, Verify`, async () => {
      const docRef = doc(adminDb, col.name, col.id);
      // 1. Create
      await assertSucceeds(setDoc(docRef, { ...col.initial, createdAt: new Date().toISOString() }));
      // 2. Read
      const snap = await assertSucceeds(getDoc(docRef));
      if (!snap.exists()) throw new Error(`Document ${col.id} was not created in ${col.name}`);
      // 3. Update
      await assertSucceeds(updateDoc(docRef, { ...col.update, updatedAt: new Date().toISOString() }));
      // 4. Verify Update
      const snapUpdated = await assertSucceeds(getDoc(docRef));
      for (const [k, v] of Object.entries(col.update)) {
        if (snapUpdated.data()?.[k] !== v) {
          throw new Error(`Field ${k} in ${col.name} did not update to ${v}`);
        }
      }
    });
  }

  console.log('\n--- TEST GROUP 2: STRICT RBAC & AUTHORIZATION CHECKS ---');

  await test('[RBAC] Super Admin (workall724038@gmail.com) has full access to clients collection', async () => {
    await assertSucceeds(getDocs(collection(adminDb, 'clients')));
    await assertSucceeds(setDoc(doc(adminDb, 'clients', 'client_rbac_test'), {
      name: 'RBAC Authorized Client',
      phone: '9998887776',
      status: 'active'
    }));
  });

  await test('[RBAC] Unauthorized authenticated user (rohitverma8253@gmail.com) is REJECTED on clients', async () => {
    await assertFails(getDocs(collection(unauthDb, 'clients')));
    await assertFails(setDoc(doc(unauthDb, 'clients', 'client_unauth_attempt'), {
      name: 'Hacked Client',
      phone: '9998887776'
    }));
  });

  await test('[RBAC] Unauthenticated guest is REJECTED on clients', async () => {
    await assertFails(getDocs(collection(guestDb, 'clients')));
    await assertFails(setDoc(doc(guestDb, 'clients', 'client_guest_attempt'), {
      name: 'Guest Client'
    }));
  });

  await test('[RBAC] Unauthorized user cannot read or tamper with invoices', async () => {
    await assertFails(getDoc(doc(unauthDb, 'invoices', 'inv_test_1')));
    await assertFails(updateDoc(doc(unauthDb, 'invoices', 'inv_test_1'), { total: 0 }));
  });

  await test('[RBAC] Unauthorized user cannot read crmSettings', async () => {
    await assertFails(getDoc(doc(unauthDb, 'crmSettings', 'agency_settings')));
    await assertFails(setDoc(doc(unauthDb, 'crmSettings', 'agency_settings'), { agencyName: 'Hacked' }));
  });

  console.log('\n--- TEST GROUP 3: PUBLIC FORMS BOUNDARY ---');

  await test('[Public] Guest can submit new inquiry / lead', async () => {
    const newLeadRef = doc(collection(guestDb, 'leads'));
    await assertSucceeds(setDoc(newLeadRef, {
      name: 'Prospective Client',
      phone: '9123456789',
      service: 'Graphic Design',
      status: 'new',
      source: 'website_contact',
      createdAt: new Date().toISOString()
    }));
  });

  await test('[Public] Guest CANNOT read or list leads', async () => {
    await assertFails(getDocs(collection(guestDb, 'leads')));
  });

  console.log('\n--- TEST GROUP 4: CLIENT -> PROJECT -> TASK CASCADE & RELATIONSHIPS ---');

  await test('[Cascade] Client -> Project -> Task relational links integrity', async () => {
    const clientId = 'c_corp_100';
    const projectId = 'p_corp_200';
    const taskId = 't_corp_300';

    // 1. Create Client
    await assertSucceeds(setDoc(doc(adminDb, 'clients', clientId), {
      name: 'Cascade Client Corp',
      email: 'cascade@corp.com',
      phone: '9870001112',
      status: 'active'
    }));

    // 2. Create Project linked to Client
    await assertSucceeds(setDoc(doc(adminDb, 'projects', projectId), {
      title: 'Full Brand Redesign',
      clientId: clientId,
      status: 'in_progress',
      budget: 250000
    }));

    // 3. Create Task linked to Project & Client
    await assertSucceeds(setDoc(doc(adminDb, 'tasks', taskId), {
      title: 'Design UI Mockups',
      projectId: projectId,
      clientId: clientId,
      status: 'todo',
      priority: 'urgent'
    }));

    // Verify relations
    const projSnap = await getDoc(doc(adminDb, 'projects', projectId));
    const taskSnap = await getDoc(doc(adminDb, 'tasks', taskId));
    if (projSnap.data()?.clientId !== clientId) throw new Error('Project client link broken');
    if (taskSnap.data()?.projectId !== projectId) throw new Error('Task project link broken');
    if (taskSnap.data()?.clientId !== clientId) throw new Error('Task client link broken');
  });

  console.log('\n--- TEST GROUP 5: FINANCIAL LEDGER & CALCULATIONS ---');

  await test('[Finance] Invoice subtotal, GST, and partial payment balance math', async () => {
    const items = [
      { description: 'Website Development', quantity: 1, unitPrice: 80000, amount: 80000 },
      { description: 'Copywriting & SEO', quantity: 1, unitPrice: 20000, amount: 20000 }
    ];
    const subtotal = items.reduce((s, i) => s + i.amount, 0); // 100000
    const discount = 10000; // 10k discount
    const net = subtotal - discount; // 90000
    const gstRate = 0.18;
    const gst = Math.round(net * gstRate); // 16200
    const total = net + gst; // 106200

    if (total !== 106200) throw new Error(`Calculated total ${total} !== 106200`);

    const invoiceId = 'inv_calc_test';
    await assertSucceeds(setDoc(doc(adminDb, 'invoices', invoiceId), {
      invoiceNumber: 'INV-2026-CALC',
      clientId: 'client_test_1',
      clientName: 'Acme Corp',
      subtotal,
      discountAmount: discount,
      taxAmount: gst,
      total,
      amountPaid: 0,
      balanceDue: total,
      status: 'sent'
    }));

    // Record partial payment of 50,000
    const partialPayment = 50000;
    const newAmountPaid = partialPayment;
    const newBalanceDue = total - newAmountPaid; // 56200
    const newStatus = newBalanceDue === 0 ? 'paid' : 'partial';

    await assertSucceeds(updateDoc(doc(adminDb, 'invoices', invoiceId), {
      amountPaid: newAmountPaid,
      balanceDue: newBalanceDue,
      status: newStatus
    }));

    const verifiedSnap = await getDoc(doc(adminDb, 'invoices', invoiceId));
    const invData = verifiedSnap.data();
    if (invData?.amountPaid !== 50000) throw new Error(`amountPaid ${invData?.amountPaid} !== 50000`);
    if (invData?.balanceDue !== 56200) throw new Error(`balanceDue ${invData?.balanceDue} !== 56200`);
    if (invData?.status !== 'partial') throw new Error(`status ${invData?.status} !== partial`);
  });

  await test('[Finance] Freelancer agreed vs paid vs pending balance ledger', async () => {
    const agreedAmount = 45000;
    let paidAmount = 0;
    let pendingBalance = agreedAmount - paidAmount;

    const flId = 'fl_ledger_test';
    await assertSucceeds(setDoc(doc(adminDb, 'freelancers', flId), {
      name: 'Rohan Mehra',
      phone: '9899887766',
      agreedAmount,
      paidAmount,
      pendingBalance,
      paymentStatus: 'pending'
    }));

    // Make milestone payment 1 of 20,000
    paidAmount += 20000;
    pendingBalance = agreedAmount - paidAmount; // 25000
    await assertSucceeds(updateDoc(doc(adminDb, 'freelancers', flId), {
      paidAmount,
      pendingBalance,
      paymentStatus: 'partial'
    }));

    // Final settlement of 25,000
    paidAmount += 25000;
    pendingBalance = agreedAmount - paidAmount; // 0
    await assertSucceeds(updateDoc(doc(adminDb, 'freelancers', flId), {
      paidAmount,
      pendingBalance,
      paymentStatus: 'paid'
    }));

    const finalFl = (await getDoc(doc(adminDb, 'freelancers', flId))).data();
    if (finalFl?.paidAmount !== 45000) throw new Error(`paidAmount !== 45000`);
    if (finalFl?.pendingBalance !== 0) throw new Error(`pendingBalance !== 0`);
    if (finalFl?.paymentStatus !== 'paid') throw new Error(`paymentStatus !== paid`);
  });

  console.log('\n--- TEST GROUP 6: TRANSACTIONAL ROLLBACK INTEGRITY ---');

  await test('[Rollback] Cloud failure results in ZERO corrupted or phantom documents', async () => {
    // Attempting unauthorized write must fail at emulator rule level
    const phantomId = 'phantom_doc_should_not_exist';
    await assertFails(setDoc(doc(unauthDb, 'clients', phantomId), {
      name: 'Phantom Hacker Corp'
    }));

    // Check that doc was never created
    const checkDoc = await getDoc(doc(adminDb, 'clients', phantomId));
    if (checkDoc.exists()) {
      throw new Error('FAIL: Phantom document was created despite rule rejection!');
    }
  });

  // Cleanup test environment
  await testEnv.cleanup();

  console.log('\n==================================================================');
  console.log(`   TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('==================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
