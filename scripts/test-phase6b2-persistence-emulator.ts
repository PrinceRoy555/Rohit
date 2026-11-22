/**
 * Official Real Firebase Firestore Emulator Test Suite — Phase 6B.2
 * Tests typed cloud database persistence, data safety, RBAC, relationships, and financial calculations
 * using @firebase/rules-unit-testing against local Firestore Emulator.
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
  getDocs
} from 'firebase/firestore';

const PROJECT_ID = 'rohit-72bfa';
const rules = fs.readFileSync('C:/Users/ASUS/OneDrive/Desktop/rohitwork/firestore.rules', 'utf8');

async function runPhase6B2Tests() {
  console.log('==================================================================');
  console.log('   ROHITWORK CRM — PHASE 6B.2 CLOUD PERSISTENCE EMULATOR SUITE   ');
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
    console.error('Make sure the Firestore emulator is running.');
    process.exit(1);
  }

  // Clear data and seed test fixtures
  await testEnv.clearFirestore();

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
    await setDoc(doc(adminDb, 'adminProfiles', 'usr_disabled_admin'), {
      role: 'admin',
      status: 'disabled',
      email: 'disabled@rohitwork.in'
    });
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

  const disabledAdminDb = testEnv.authenticatedContext('usr_disabled_admin', {
    email: 'disabled@rohitwork.in',
    email_verified: true
  }).firestore();

  const visitorDb = testEnv.unauthenticatedContext().firestore();

  // =============================================================
  // SUITE 1: CRUD OPERATIONS ACROSS ALL 11 CRM MODULES
  // =============================================================
  console.log('--- Suite 1: Full CRUD across all 11 Business Modules ---');

  // 1. Leads
  await testCase('Leads: Admin can Create, Read, Update, Delete', async () => {
    const leadRef = doc(superAdminDb, 'leads', 'lead_test_crud_01');
    await assertSucceeds(setDoc(leadRef, {
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '9876543210',
      service: 'Video Editing',
      status: 'new',
      source: 'website',
      createdAt: new Date().toISOString()
    }));
    const snap = await getDoc(leadRef);
    if (!snap.exists() || snap.data()?.name !== 'Priya Sharma') throw new Error('Lead read mismatch');
    await assertSucceeds(updateDoc(leadRef, { status: 'contacted' }));
    await assertSucceeds(deleteDoc(leadRef));
    const deletedSnap = await getDoc(leadRef);
    if (deletedSnap.exists()) throw new Error('Lead delete failed');
  });

  // 2. Clients
  await testCase('Clients: Admin can Create, Read, Update, Delete', async () => {
    const ref = doc(standardAdminDb, 'clients', 'cli_real_crud_01');
    await assertSucceeds(setDoc(ref, {
      name: 'Zenith Retail Pvt Ltd',
      email: 'contact@zenithretail.in',
      phone: '9876500001',
      status: 'active',
      totalProjects: 1,
      totalBilled: 85000,
      totalPaid: 42500,
      outstandingBalance: 42500,
      currency: 'INR',
      createdAt: new Date().toISOString()
    }));
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data()?.totalBilled !== 85000) throw new Error('Client read mismatch');
    await assertSucceeds(updateDoc(ref, { status: 'inactive' }));
    await assertSucceeds(deleteDoc(ref));
  });

  // 3. Projects
  await testCase('Projects: Admin can Create, Read, Update, Delete', async () => {
    const ref = doc(standardAdminDb, 'projects', 'proj_real_crud_01');
    await assertSucceeds(setDoc(ref, {
      title: 'Zenith Brand Campaign',
      clientId: 'cli_real_crud_01',
      clientName: 'Zenith Retail Pvt Ltd',
      serviceCategory: 'Video Editing',
      status: 'in_progress',
      budget: 85000,
      amountPaid: 42500,
      pendingBalance: 42500,
      progress: 50,
      assignedFreelancerIds: ['free_real_crud_01'],
      createdAt: new Date().toISOString()
    }));
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data()?.progress !== 50) throw new Error('Project read mismatch');
    await assertSucceeds(updateDoc(ref, { progress: 75 }));
    await assertSucceeds(deleteDoc(ref));
  });

  // 4. Freelancers
  await testCase('Freelancers: Super Admin can Create, Read, Update, Delete', async () => {
    const ref = doc(superAdminDb, 'freelancers', 'free_real_crud_01');
    await assertSucceeds(setDoc(ref, {
      name: 'Kabir Sound Works',
      phone: '9876511111',
      specialty: 'Audio Engineering',
      skills: ['Mixing', 'Sound Design'],
      status: 'available',
      hourlyRate: 2000,
      rating: 5,
      createdAt: new Date().toISOString()
    }));
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data()?.hourlyRate !== 2000) throw new Error('Freelancer read mismatch');
    await assertSucceeds(updateDoc(ref, { hourlyRate: 2500 }));
    await assertSucceeds(deleteDoc(ref));
  });

  // 5. Tasks
  await testCase('Tasks: Admin can Create, Read, Update, Delete', async () => {
    const ref = doc(standardAdminDb, 'tasks', 'task_real_crud_01');
    await assertSucceeds(setDoc(ref, {
      title: 'Deliver Zenith First Video Cut',
      projectId: 'proj_real_crud_01',
      clientId: 'cli_real_crud_01',
      status: 'in_progress',
      priority: 'high',
      progress: 60,
      createdAt: new Date().toISOString()
    }));
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data()?.priority !== 'high') throw new Error('Task read mismatch');
    await assertSucceeds(updateDoc(ref, { status: 'completed', progress: 100 }));
    await assertSucceeds(deleteDoc(ref));
  });

  // 6. Quotations
  await testCase('Quotations: Admin can Create, Read, Update, Delete', async () => {
    const ref = doc(standardAdminDb, 'quotations', 'quot_real_crud_01');
    await assertSucceeds(setDoc(ref, {
      quotationNumber: 'RW-QT-2026-TEST',
      clientName: 'Zenith Retail Pvt Ltd',
      clientEmail: 'contact@zenithretail.in',
      subtotal: 80000,
      total: 80000,
      status: 'accepted',
      currency: 'INR',
      createdAt: new Date().toISOString()
    }));
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data()?.total !== 80000) throw new Error('Quotation read mismatch');
    await assertSucceeds(updateDoc(ref, { status: 'accepted' }));
    await assertSucceeds(deleteDoc(ref));
  });

  // 7. Invoices
  await testCase('Invoices: Admin can Create, Read, Update, Delete', async () => {
    const ref = doc(standardAdminDb, 'invoices', 'inv_real_crud_01');
    await assertSucceeds(setDoc(ref, {
      invoiceNumber: 'RW-INV-2026-TEST',
      clientId: 'cli_real_crud_01',
      clientName: 'Zenith Retail Pvt Ltd',
      clientEmail: 'contact@zenithretail.in',
      subtotal: 85000,
      total: 85000,
      amountPaid: 42500,
      balanceDue: 42500,
      status: 'partially_paid',
      currency: 'INR',
      createdAt: new Date().toISOString()
    }));
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data()?.balanceDue !== 42500) throw new Error('Invoice read mismatch');
    await assertSucceeds(updateDoc(ref, { amountPaid: 85000, balanceDue: 0, status: 'paid' }));
    await assertSucceeds(deleteDoc(ref));
  });

  // 8. Payments
  await testCase('Payments: Super Admin can Create, Read, Update, Delete', async () => {
    const ref = doc(superAdminDb, 'payments', 'pay_real_crud_01');
    await assertSucceeds(setDoc(ref, {
      paymentType: 'client_payment',
      invoiceId: 'inv_real_crud_01',
      clientId: 'cli_real_crud_01',
      amount: 42500,
      paymentMethod: 'bank_transfer',
      transactionRef: 'NEFT998877',
      status: 'completed',
      createdAt: new Date().toISOString()
    }));
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data()?.amount !== 42500) throw new Error('Payment read mismatch');
    await assertSucceeds(updateDoc(ref, { notes: 'Verified in bank account' }));
    await assertSucceeds(deleteDoc(ref));
  });

  // 9. Expenses
  await testCase('Expenses: Super Admin can Create, Read, Update, Delete', async () => {
    const ref = doc(superAdminDb, 'expenses', 'exp_real_crud_01');
    await assertSucceeds(setDoc(ref, {
      title: 'Stock Footage License — Artgrid',
      category: 'software',
      amount: 14999,
      currency: 'INR',
      paymentMethod: 'credit_card',
      createdAt: new Date().toISOString()
    }));
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data()?.amount !== 14999) throw new Error('Expense read mismatch');
    await assertSucceeds(updateDoc(ref, { notes: 'Annual plan subscription' }));
    await assertSucceeds(deleteDoc(ref));
  });

  // 10. Reminders
  await testCase('Reminders: Admin can Create, Read, Update, Delete', async () => {
    const ref = doc(standardAdminDb, 'reminders', 'rem_real_crud_01');
    await assertSucceeds(setDoc(ref, {
      title: 'Follow up on Zenith Final Milestone Payment',
      type: 'invoice_due',
      targetDate: new Date().toISOString().split('T')[0],
      priority: 'high',
      isCompleted: false,
      createdAt: new Date().toISOString()
    }));
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data()?.isCompleted !== false) throw new Error('Reminder read mismatch');
    await assertSucceeds(updateDoc(ref, { isCompleted: true }));
    await assertSucceeds(deleteDoc(ref));
  });

  // 11. Settings
  await testCase('Settings: Super Admin can Write & Read agency configuration', async () => {
    const ref = doc(superAdminDb, 'crmSettings', 'agency_settings');
    await assertSucceeds(setDoc(ref, {
      agencyName: 'Rohitwork Creative Studio',
      ownerEmail: 'workall724038@gmail.com',
      currency: 'INR',
      upiId: '7732869027@paytm',
      defaultPaymentTerms: '50% advance, 50% on draft delivery.'
    }));
    const snap = await getDoc(ref);
    if (!snap.exists() || snap.data()?.agencyName !== 'Rohitwork Creative Studio') throw new Error('Settings mismatch');
  });

  // =============================================================
  // SUITE 2: DATA PERSISTENCE ACROSS SIMULATED RELOADS
  // =============================================================
  console.log('\n--- Suite 2: Data Persistence across Simulated Disconnect/Reload ---');

  await testCase('Real business record persists in Firestore across context re-reads', async () => {
    const docId = 'cli_persistent_real_01';
    await setDoc(doc(superAdminDb, 'clients', docId), {
      name: 'Persistent Brand India',
      email: 'hello@persistentbrand.in',
      totalBilled: 120000,
      totalPaid: 60000,
      outstandingBalance: 60000,
      updatedAtIso: '2026-11-18T10:00:00.000Z'
    });

    // Fresh read from standard admin context (simulating client reload)
    const freshSnap = await getDoc(doc(standardAdminDb, 'clients', docId));
    if (!freshSnap.exists()) throw new Error('Document vanished after write');
    const data = freshSnap.data();
    if (data.name !== 'Persistent Brand India' || data.totalBilled !== 120000) {
      throw new Error(`Data corruption detected: ${JSON.stringify(data)}`);
    }
  });

  // =============================================================
  // SUITE 3: RBAC ISOLATION & FINANCIAL INTEGRITY
  // =============================================================
  console.log('\n--- Suite 3: RBAC Isolation & Sensitive Financial Permissions ---');

  await testCase('Standard Admin CAN write to operational collections (clients, projects, tasks, invoices)', async () => {
    await assertSucceeds(setDoc(doc(standardAdminDb, 'clients', 'cli_std_test'), { name: 'Client ABC' }));
    await assertSucceeds(setDoc(doc(standardAdminDb, 'projects', 'proj_std_test'), { title: 'Project ABC' }));
    await assertSucceeds(setDoc(doc(standardAdminDb, 'tasks', 'task_std_test'), { title: 'Task ABC' }));
    await assertSucceeds(setDoc(doc(standardAdminDb, 'invoices', 'inv_std_test'), { invoiceNumber: 'INV-ABC' }));
  });

  await testCase('Standard Admin CANNOT write to sensitive financial collections (payments, expenses, freelancers, settings)', async () => {
    await assertFails(setDoc(doc(standardAdminDb, 'payments', 'pay_unauth'), { amount: 50000 }));
    await assertFails(setDoc(doc(standardAdminDb, 'expenses', 'exp_unauth'), { amount: 15000 }));
    await assertFails(setDoc(doc(standardAdminDb, 'freelancers', 'free_unauth'), { hourlyRate: 3000 }));
    await assertFails(setDoc(doc(standardAdminDb, 'crmSettings', 'app_config'), { quota: 100 }));
  });

  await testCase('Disabled Admin is completely locked out from both reading and writing CRM documents', async () => {
    await assertFails(getDoc(doc(disabledAdminDb, 'clients', 'cli_std_test')));
    await assertFails(setDoc(doc(disabledAdminDb, 'clients', 'cli_attacker'), { name: 'Hacked' }));
    await assertFails(getDoc(doc(disabledAdminDb, 'payments', 'pay_real_crud_01')));
    await assertFails(setDoc(doc(disabledAdminDb, 'payments', 'pay_attacker'), { amount: 100 }));
  });

  await testCase('Unauthenticated visitors CANNOT read or write any CRM business collection', async () => {
    await assertFails(getDoc(doc(visitorDb, 'clients', 'cli_std_test')));
    await assertFails(setDoc(doc(visitorDb, 'clients', 'cli_visitor'), { name: 'Visitor' }));
    await assertFails(getDoc(doc(visitorDb, 'invoices', 'inv_std_test')));
    await assertFails(getDoc(doc(visitorDb, 'payments', 'pay_real_crud_01')));
  });

  // =============================================================
  // SUITE 4: CROSS-MODULE RELATIONSHIPS & REFERENTIAL INTEGRITY
  // =============================================================
  console.log('\n--- Suite 4: Cross-Module Foreign Key Relationships ---');

  await testCase('Preserve stable relationship chain: Client -> Project -> Task -> Invoice -> Payment', async () => {
    const clientId = 'cli_chain_01';
    const projectId = 'proj_chain_01';
    const taskId = 'task_chain_01';
    const invoiceId = 'inv_chain_01';
    const paymentId = 'pay_chain_01';
    const freelancerId = 'free_chain_01';

    // 1. Create Client
    await setDoc(doc(superAdminDb, 'clients', clientId), {
      name: 'Apex Healthtech',
      email: 'billing@apexhealth.in'
    });

    // 2. Create Project referencing Client
    await setDoc(doc(superAdminDb, 'projects', projectId), {
      title: 'Apex Explainer 3D Video',
      clientId,
      budget: 150000
    });

    // 3. Create Freelancer
    await setDoc(doc(superAdminDb, 'freelancers', freelancerId), {
      name: 'Rohan Patel (3D Animator)',
      phone: '9876543210'
    });

    // 4. Create Task referencing Project, Client, and Freelancer
    await setDoc(doc(superAdminDb, 'tasks', taskId), {
      title: 'Render 3D Organ Model',
      projectId,
      clientId,
      assignedFreelancerId: freelancerId
    });

    // 5. Create Invoice referencing Client and Project
    await setDoc(doc(superAdminDb, 'invoices', invoiceId), {
      invoiceNumber: 'RW-INV-APEX-01',
      clientId,
      projectId,
      total: 150000,
      amountPaid: 75000,
      balanceDue: 75000
    });

    // 6. Create Payment referencing Invoice, Client, and Project
    await setDoc(doc(superAdminDb, 'payments', paymentId), {
      paymentType: 'client_payment',
      invoiceId,
      clientId,
      projectId,
      amount: 75000,
      paymentMethod: 'upi',
      status: 'completed'
    });

    // Verify all relationship pointers in Firestore
    const pSnap = await getDoc(doc(superAdminDb, 'projects', projectId));
    const tSnap = await getDoc(doc(superAdminDb, 'tasks', taskId));
    const iSnap = await getDoc(doc(superAdminDb, 'invoices', invoiceId));
    const paySnap = await getDoc(doc(superAdminDb, 'payments', paymentId));

    if (pSnap.data()?.clientId !== clientId) throw new Error('Project->Client FK broken');
    if (tSnap.data()?.projectId !== projectId || tSnap.data()?.assignedFreelancerId !== freelancerId) throw new Error('Task FK broken');
    if (iSnap.data()?.clientId !== clientId || iSnap.data()?.projectId !== projectId) throw new Error('Invoice FK broken');
    if (paySnap.data()?.invoiceId !== invoiceId || paySnap.data()?.clientId !== clientId) throw new Error('Payment FK broken');
  });

  // =============================================================
  // SUITE 5: FINANCIAL METRICS CALCULATION ACCURACY
  // =============================================================
  console.log('\n--- Suite 5: Financial Metrics Calculation on Persisted Records ---');

  await testCase('Aggregates accurate financial totals (Invoiced, Collected, Outstanding, Cashflow)', async () => {
    // Seed test invoices
    await setDoc(doc(superAdminDb, 'invoices', 'inv_fin_01'), {
      total: 100000,
      amountPaid: 60000,
      balanceDue: 40000,
      status: 'partially_paid'
    });
    await setDoc(doc(superAdminDb, 'invoices', 'inv_fin_02'), {
      total: 50000,
      amountPaid: 50000,
      balanceDue: 0,
      status: 'paid'
    });

    // Seed test payments
    await setDoc(doc(superAdminDb, 'payments', 'pay_fin_01'), {
      paymentType: 'client_payment',
      amount: 60000,
      status: 'completed'
    });
    await setDoc(doc(superAdminDb, 'payments', 'pay_fin_02'), {
      paymentType: 'client_payment',
      amount: 50000,
      status: 'completed'
    });
    await setDoc(doc(superAdminDb, 'payments', 'pay_fin_payout'), {
      paymentType: 'freelancer_payout',
      amount: 25000,
      status: 'completed'
    });

    // Seed operating expense
    await setDoc(doc(superAdminDb, 'expenses', 'exp_fin_01'), {
      category: 'software',
      amount: 5000
    });

    // Query collections and compute metrics
    const invSnap = await getDocs(collection(superAdminDb, 'invoices'));
    const paySnap = await getDocs(collection(superAdminDb, 'payments'));
    const expSnap = await getDocs(collection(superAdminDb, 'expenses'));

    let totalInvoiced = 0;
    let totalOutstanding = 0;
    invSnap.forEach(d => {
      if (['inv_fin_01', 'inv_fin_02'].includes(d.id)) {
        totalInvoiced += d.data().total;
        totalOutstanding += d.data().balanceDue;
      }
    });

    let totalCollected = 0;
    let totalPayouts = 0;
    paySnap.forEach(d => {
      if (['pay_fin_01', 'pay_fin_02'].includes(d.id)) totalCollected += d.data().amount;
      if (d.id === 'pay_fin_payout') totalPayouts += d.data().amount;
    });

    let directExpenses = 0;
    expSnap.forEach(d => {
      if (d.id === 'exp_fin_01') directExpenses += d.data().amount;
    });

    const netCashflow = totalCollected - totalPayouts - directExpenses;

    if (totalInvoiced !== 150000) throw new Error(`Expected Invoiced 150000, got ${totalInvoiced}`);
    if (totalCollected !== 110000) throw new Error(`Expected Collected 110000, got ${totalCollected}`);
    if (totalOutstanding !== 40000) throw new Error(`Expected Outstanding 40000, got ${totalOutstanding}`);
    if (netCashflow !== 80000) throw new Error(`Expected Net Cashflow 80000, got ${netCashflow}`);
  });

  // Cleanup test environment
  await testEnv.cleanup();

  console.log('\n==================================================================');
  console.log(`REAL FIRESTORE EMULATOR RESULTS: ${passedTests} passed, ${failedTests} failed (Total: ${totalTests})`);
  console.log('==================================================================');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log('\n>>> ALL REAL FIRESTORE PERSISTENCE EMULATOR TESTS PASSED WITH ZERO FAILURES! <<<\n');
    process.exit(0);
  }
}

runPhase6B2Tests().catch((err) => {
  console.error('[Phase 6B.2 Emulator Tests] Fatal execution error:', err);
  process.exit(1);
});
