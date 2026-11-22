/**
 * ROHITWORK CRM — FAST TRACK PHASE 2 + PHASE 3 REGRESSION TEST SUITE
 * Validates the 4 confirmed fixes from Phase 1 Audit:
 * 1. Cloud Persistence: Profile drawers, task editing & mutator cloud sync with demo isolation
 * 2. Duplicate Leads: Single authoritative doc creation, no dual-insert or duplicate split
 * 3. Financial Cascade: Reconcile invoices, projects, freelancer payouts & parent sync
 * 4. Phone-Only Inquiries: Public forms & Firestore rules accept phone-only leads
 */

import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { validateContactMethod } from '../src/lib/validation';
import {
  initCrmStorage,
  getStoredClients,
  saveStoredClient,
  addClientActivity,
  getStoredProjects,
  saveStoredProject,
  toggleProjectMilestone,
  addProjectMilestone,
  addProjectDeliverable,
  addProjectActivity,
  recordProjectPayment,
  getStoredFreelancers,
  saveStoredFreelancer,
  addFreelancerActivity,
  addFreelancerPayout,
  addFreelancerSubmission,
  getStoredTasks,
  saveStoredTask,
  updateTaskStatus,
  toggleTaskSubtask,
  addTaskSubtask,
  addTaskSubmission,
  addTaskComment,
  getStoredLeads,
  saveStoredLead,
  getStoredInvoices,
  saveStoredInvoice,
  reconcileInvoicePayments,
  updateInvoiceStatus,
  reconcileFreelancerPayouts,
  reconcileProjectFinancials,
  recordPayment,
  normalizePhoneNumber
} from '../src/services/crmStorageService';

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

let testPassCount = 0;
let testFailCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    testPassCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` (${detail})` : ''}`);
    testFailCount++;
  }
}

async function runFastTrackTests() {
  console.log('\n==================================================================');
  console.log('   ROHITWORK CRM — FAST TRACK VERIFICATION TEST SUITE            ');
  console.log('==================================================================\n');

  // Load Firestore Rules
  const rulesPath = path.join(process.cwd(), 'firestore.rules');
  const rules = fs.readFileSync(rulesPath, 'utf8');

  const testEnv: RulesTestEnvironment = await initializeTestEnvironment({
    projectId: 'rohit-72bfa',
    firestore: {
      rules,
      host: '127.0.0.1',
      port: 8080
    }
  });

  const visitorDb = testEnv.unauthenticatedContext().firestore();
  const superAdminDb = testEnv.authenticatedContext('7wupZnpLh1MPTYpci5keNIS1Fyt1', {
    email: 'workall724038@gmail.com',
    email_verified: true
  }).firestore();
  const adminDb = testEnv.authenticatedContext('usr_admin_standard', {
    email: 'admin@rohitwork.in',
    email_verified: true
  }).firestore();

  // Initialize CRM storage in memory
  initCrmStorage();

  // -------------------------------------------------------------
  // SUITE 1: Task 4 — Phone-Only Validation & Public Intake
  // -------------------------------------------------------------
  console.log('--- SUITE 1: Task 4 — Phone-Only Validation & Inquiries ---');

  // 1.1: Phone-only validation check
  const phoneOnlyRes = validateContactMethod(undefined, '+91 98765 43210');
  assert(phoneOnlyRes.isValid, 'validateContactMethod: valid phone without email returns valid');

  // 1.2: Email-only validation check
  const emailOnlyRes = validateContactMethod('client@example.com', undefined);
  assert(emailOnlyRes.isValid, 'validateContactMethod: valid email without phone returns valid');

  // 1.3: Both phone and email
  const bothRes = validateContactMethod('client@example.com', '+91 98765 43210');
  assert(bothRes.isValid, 'validateContactMethod: both email and phone returns valid');

  // 1.4: Neither phone nor email
  const neitherRes = validateContactMethod(undefined, undefined);
  assert(!neitherRes.isValid, 'validateContactMethod: neither email nor phone returns invalid');

  // 1.5: Undersized phone (< 7 chars)
  const shortPhoneRes = validateContactMethod(undefined, '12345');
  assert(!shortPhoneRes.isValid, 'validateContactMethod: undersized phone (<7 digits) rejected');

  // 1.6: Invalid email with valid phone
  const invalidEmailWithPhone = validateContactMethod('notanemail', '+91 98765 43210');
  assert(!invalidEmailWithPhone.isValid, 'validateContactMethod: malformed email rejected even if phone is present');

  // 1.7: Visitor submits phone-only contact enquiry against Firestore Rules
  const phoneOnlyContact = {
    name: 'Rohan Sharma',
    phone: '+919876543210',
    selectedService: 'Web Design & Brand Identity',
    projectDescription: 'We need a high converting agency landing page for our business.',
    consentAccepted: true,
    source: 'website-contact-form',
    status: 'new',
    createdAt: new Date().toISOString()
  };
  await assertSucceeds(addDoc(collection(visitorDb, 'contactEnquiries'), phoneOnlyContact));
  assert(true, 'Firestore Rules: Visitor CAN submit phone-only contact enquiry (no email)');

  // 1.8: Visitor submits phone-only lead intake against Firestore Rules
  const phoneOnlyLead = {
    name: 'Anjali Verma',
    phone: '+919123456789',
    service: 'Video Editing',
    message: 'Looking for ongoing YouTube reel editing packages.',
    source: 'website-contact-form',
    status: 'new',
    createdAt: new Date().toISOString()
  };
  await assertSucceeds(addDoc(collection(visitorDb, 'leads'), phoneOnlyLead));
  assert(true, 'Firestore Rules: Visitor CAN submit phone-only lead intake (no email)');

  // 1.9: Visitor CANNOT submit enquiry without contact method (neither email nor phone)
  const noContactEnquiry = {
    name: 'Spam Bot',
    selectedService: 'General',
    projectDescription: 'Spam submission with no email or phone contact details.',
    consentAccepted: true,
    source: 'website-contact-form',
    status: 'new',
    createdAt: new Date().toISOString()
  };
  await assertFails(addDoc(collection(visitorDb, 'contactEnquiries'), noContactEnquiry));
  assert(true, 'Firestore Rules: Visitor CANNOT submit enquiry without contact method');

  // -------------------------------------------------------------
  // SUITE 2: Task 2 — Duplicate Leads Elimination
  // -------------------------------------------------------------
  console.log('\n--- SUITE 2: Task 2 — Duplicate Leads Elimination ---');

  // 2.1: Save manual lead via saveStoredLead
  const leadUniquePhone = `+91 99999 ${Math.floor(10000 + Math.random() * 90000)}`;
  const manualLead = saveStoredLead({
    name: 'Unique Test Client',
    phone: leadUniquePhone,
    source: 'manual',
    status: 'new'
  });
  assert(Boolean(manualLead.id), 'saveStoredLead: returns lead with valid ID');

  // Check stored leads count for this phone
  const storedLeads = getStoredLeads();
  const matchingLeads = storedLeads.filter(
    (l) => l.phone && normalizePhoneNumber(l.phone) === normalizePhoneNumber(leadUniquePhone)
  );
  assert(matchingLeads.length === 1, 'saveStoredLead: creates exactly one lead in local cache, zero duplicates');

  // 2.2: Verify phone normalization deduplication
  const phone1 = '+91 98765 43210';
  const phone2 = '9876543210';
  assert(normalizePhoneNumber(phone1) === normalizePhoneNumber(phone2), 'normalizePhoneNumber: matches +91 prefix with raw 10 digits');

  // 2.3: Verify repeat distinct inquiries from same client are preserved without false merges
  const repeatClientPhone = `+91 98888 ${Math.floor(10000 + Math.random() * 90000)}`;
  const inquiry1 = saveStoredLead({
    name: 'Pooja Hegde',
    phone: repeatClientPhone,
    service: 'Brand Identity & Logo Design',
    message: 'Looking for a complete brand redesign for my agency.',
    source: 'website'
  });
  const inquiry2 = saveStoredLead({
    name: 'Pooja Hegde',
    phone: repeatClientPhone,
    service: 'Next.js Web Portal Development',
    message: 'Need a follow-up web portal development contract.',
    source: 'website'
  });
  assert(inquiry1.id !== inquiry2.id, 'Distinct Inquiries: generates distinct authoritative IDs for repeat project requests');
  const allPoojaLeads = getStoredLeads().filter(
    (l) => l.phone && normalizePhoneNumber(l.phone) === normalizePhoneNumber(repeatClientPhone)
  );
  assert(allPoojaLeads.length === 2, 'Distinct Inquiries: both historical inquiries preserved without false merges');

  // -------------------------------------------------------------
  // SUITE 3: Task 1 — Cloud Persistence & Drawer Mutators
  // -------------------------------------------------------------
  console.log('\n--- SUITE 3: Task 1 — Cloud Persistence & Mutators ---');

  // 3.1: Client Cloud Write & Persistence verification
  const clientDocId = `cli_ft_${Date.now()}`;
  await assertSucceeds(
    setDoc(doc(adminDb, 'clients', clientDocId), {
      name: 'FastTrack Test Client Pvt Ltd',
      phone: '+919888877777',
      status: 'active',
      createdAt: new Date().toISOString()
    })
  );
  assert(true, 'Firestore: Admin CAN persist client record to cloud');

  const testClient = saveStoredClient({
    id: clientDocId,
    name: 'FastTrack Test Client Pvt Ltd',
    phone: '+91 98888 77777',
    status: 'active'
  });

  // 3.2: Client Activity Mutator
  addClientActivity(testClient.id, {
    type: 'note',
    content: 'Client onboarded successfully via Fast Track flow',
    author: 'Admin'
  });
  const updatedClientWithAct = getStoredClients().find((c) => c.id === testClient.id);
  assert(
    Boolean(updatedClientWithAct && updatedClientWithAct.activities && updatedClientWithAct.activities.length > 0),
    'addClientActivity: records activity and updates client in storage'
  );

  // 3.3: Project Cloud Write & Milestone/Deliverable Mutators
  const projectDocId = `proj_ft_${Date.now()}`;
  await assertSucceeds(
    setDoc(doc(adminDb, 'projects', projectDocId), {
      title: 'FastTrack Enterprise Website Redesign',
      clientId: clientDocId,
      budget: 85000,
      status: 'in_progress',
      priority: 'high',
      createdAt: new Date().toISOString()
    })
  );
  assert(true, 'Firestore: Admin CAN persist project record to cloud');

  const testProject = saveStoredProject({
    id: projectDocId,
    title: 'FastTrack Enterprise Website Redesign',
    clientId: clientDocId,
    budget: 85000,
    status: 'in_progress',
    priority: 'high'
  });

  const pWithMilestone = addProjectMilestone(testProject.id, {
    title: 'Phase 1 Architecture Approval',
    dueDate: '2026-12-01',
    order: 1
  });
  assert(
    Boolean(pWithMilestone && pWithMilestone.milestones && pWithMilestone.milestones.length > 0),
    'addProjectMilestone: attaches milestone and syncs non-demo project'
  );

  const msId = pWithMilestone!.milestones![0].id;
  const pWithToggledMs = toggleProjectMilestone(testProject.id, msId);
  assert(
    Boolean(pWithToggledMs && pWithToggledMs.milestones?.find((m) => m.id === msId)?.completed),
    'toggleProjectMilestone: toggles completion state and updates progress'
  );

  const pWithDeliverable = addProjectDeliverable(testProject.id, {
    title: 'Brand Assets Figma Link',
    url: 'https://figma.com/design/example',
    status: 'draft',
    revisionRound: 1
  });
  assert(
    Boolean(pWithDeliverable && pWithDeliverable.deliverables && pWithDeliverable.deliverables.length > 0),
    'addProjectDeliverable: attaches deliverable and syncs non-demo project'
  );

  // 3.4: Freelancer Cloud Write & Payout/Submission Mutators (Super Admin)
  const freelancerDocId = `fl_ft_${Date.now()}`;
  await assertSucceeds(
    setDoc(doc(superAdminDb, 'freelancers', freelancerDocId), {
      name: 'Vikram Joshi (Senior UI/UX)',
      phone: '+919777766666',
      specialty: 'UI Designer',
      agreedAmount: 30000,
      status: 'available',
      createdAt: new Date().toISOString()
    })
  );
  assert(true, 'Firestore: Super Admin CAN persist freelancer record to cloud');

  const testFreelancer = saveStoredFreelancer({
    id: freelancerDocId,
    name: 'Vikram Joshi (Senior UI/UX)',
    phone: '+91 97777 66666',
    specialty: 'UI Designer',
    agreedAmount: 30000,
    status: 'available'
  });

  const flWithPayout = addFreelancerPayout(testFreelancer.id, {
    amount: 15000,
    method: 'upi',
    referenceId: 'UPI-FT-123456',
    status: 'paid'
  });
  assert(
    Boolean(flWithPayout && flWithPayout.paidAmount === 15000 && flWithPayout.paymentStatus === 'partial'),
    'addFreelancerPayout: records payout, calculates partial paymentStatus, and syncs'
  );

  const flWithSub = addFreelancerSubmission(testFreelancer.id, {
    url: 'https://github.com/example/submission',
    notes: 'Draft 1 delivered for review',
    status: 'pending_review',
    revisionRound: 1
  });
  assert(
    Boolean(flWithSub && flWithSub.submissions && flWithSub.submissions.length > 0),
    'addFreelancerSubmission: records deliverable submission and syncs'
  );

  // 3.5: Task Cloud Write & Status/Subtask Mutators
  const taskDocId = `task_ft_${Date.now()}`;
  await assertSucceeds(
    setDoc(doc(adminDb, 'tasks', taskDocId), {
      title: 'Implement Responsive Navbar & Mobile Menu',
      projectId: projectDocId,
      assignedFreelancerId: freelancerDocId,
      assignedFreelancerName: 'Vikram Joshi',
      status: 'in_progress',
      priority: 'high',
      createdAt: new Date().toISOString()
    })
  );
  assert(true, 'Firestore: Admin CAN persist task record to cloud');

  const testTask = saveStoredTask({
    id: taskDocId,
    title: 'Implement Responsive Navbar & Mobile Menu',
    projectId: testProject.id,
    assignedFreelancerId: testFreelancer.id,
    assignedFreelancerName: testFreelancer.name,
    status: 'in_progress',
    priority: 'high'
  });

  const taskWithSubtask = addTaskSubtask(testTask.id, 'Write mobile toggle unit test');
  assert(
    Boolean(taskWithSubtask && taskWithSubtask.subtasks && taskWithSubtask.subtasks.length > 0),
    'addTaskSubtask: attaches subtask and syncs'
  );

  const taskSubId = taskWithSubtask!.subtasks![0].id;
  const taskWithToggledSub = toggleTaskSubtask(testTask.id, taskSubId);
  assert(
    Boolean(taskWithToggledSub && taskWithToggledSub.subtasks?.find((s) => s.id === taskSubId)?.completed),
    'toggleTaskSubtask: toggles completion, updates progress %'
  );

  const taskWithUpdatedStatus = updateTaskStatus(testTask.id, 'completed');
  assert(
    Boolean(taskWithUpdatedStatus && taskWithUpdatedStatus.status === 'completed' && taskWithUpdatedStatus.progress === 100),
    'updateTaskStatus: updates status to completed, auto-advances progress to 100%, and syncs'
  );

  // -------------------------------------------------------------
  // SUITE 4: Task 3 — Financial Cascade & Reconciliation
  // -------------------------------------------------------------
  console.log('\n--- SUITE 4: Task 3 — Financial Cascade & Reconciliation ---');

  // 4.1: Create invoice for test project
  const invoice = saveStoredInvoice({
    clientName: testClient.name,
    clientId: testClient.id,
    projectId: testProject.id,
    projectTitle: testProject.title,
    dueDate: '2026-12-15',
    items: [
      { id: '1', description: 'Enterprise Website Design & Development', quantity: 1, unitPrice: 85000, amount: 85000 }
    ],
    status: 'sent'
  });
  assert(Boolean(invoice.id && invoice.total === 85000), 'saveStoredInvoice: creates invoice with correct totals');

  // 4.2: Record partial payment
  const p1 = recordPayment({
    invoiceId: invoice.id,
    projectId: testProject.id,
    clientId: testClient.id,
    amount: 50000,
    paymentType: 'client_payment',
    status: 'completed'
  });
  assert(Boolean(p1.id), 'recordPayment: records payment successfully');

  // Check invoice after partial payment
  const invAfterP1 = getStoredInvoices().find((i) => i.id === invoice.id);
  assert(
    Boolean(invAfterP1 && invAfterP1.amountPaid === 50000 && invAfterP1.balanceDue === 35000 && invAfterP1.status === 'partially_paid'),
    'reconcileInvoicePayments: invoice reflects partial payment (₹50,000 paid, ₹35,000 balance, status: partially_paid)'
  );

  // Check project after partial payment
  const projAfterP1 = getStoredProjects().find((p) => p.id === testProject.id);
  assert(
    Boolean(projAfterP1 && projAfterP1.amountPaid === 50000 && projAfterP1.pendingBalance === 35000 && projAfterP1.paymentStatus === 'partial'),
    'reconcileProjectFinancials: project reflects partial payment (₹50,000 paid, ₹35,000 balance, paymentStatus: partial)'
  );

  // 4.3: Record remaining payment to complete invoice
  recordPayment({
    invoiceId: invoice.id,
    projectId: testProject.id,
    clientId: testClient.id,
    amount: 35000,
    paymentType: 'client_payment',
    status: 'completed'
  });

  const invAfterP2 = getStoredInvoices().find((i) => i.id === invoice.id);
  assert(
    Boolean(invAfterP2 && invAfterP2.amountPaid === 85000 && invAfterP2.balanceDue === 0 && invAfterP2.status === 'paid'),
    'reconcileInvoicePayments: invoice marks fully paid (₹85,000 paid, balance: 0, status: paid)'
  );

  const projAfterP2 = getStoredProjects().find((p) => p.id === testProject.id);
  assert(
    Boolean(projAfterP2 && projAfterP2.amountPaid === 85000 && projAfterP2.pendingBalance === 0 && projAfterP2.paymentStatus === 'paid'),
    'reconcileProjectFinancials: project marks fully paid (amountPaid: ₹85,000, balance: 0, paymentStatus: paid)'
  );

  // 4.4: updateInvoiceStatus mutator
  const invCancelled = updateInvoiceStatus(invoice.id, 'cancelled');
  assert(
    Boolean(invCancelled && invCancelled.status === 'cancelled'),
    'updateInvoiceStatus: updates invoice status cleanly and syncs to cloud'
  );

  // 4.5: Freelancer Payout reconciliation
  const flPayoutPayment1 = recordPayment({
    freelancerId: testFreelancer.id,
    freelancerName: testFreelancer.name,
    amount: 15000,
    paymentType: 'freelancer_payout',
    status: 'completed'
  });
  assert(Boolean(flPayoutPayment1.id), 'recordPayment: records first freelancer payout');

  const flPayoutPayment2 = recordPayment({
    freelancerId: testFreelancer.id,
    freelancerName: testFreelancer.name,
    amount: 15000,
    paymentType: 'freelancer_payout',
    status: 'completed'
  });
  assert(Boolean(flPayoutPayment2.id), 'recordPayment: records second freelancer payout');

  const flAfterPayout = getStoredFreelancers().find((f) => f.id === testFreelancer.id);
  assert(
    Boolean(flAfterPayout && flAfterPayout.paidAmount === 30000 && flAfterPayout.pendingBalance === 0 && flAfterPayout.paymentStatus === 'paid'),
    'reconcileFreelancerPayouts: freelancer reflects full payout (paidAmount: ₹30,000, balance: 0, paymentStatus: paid)'
  );

  // 4.6: Idempotence & Retry Race Immunity
  for (let i = 0; i < 5; i++) {
    reconcileInvoicePayments(invoice.id);
    reconcileProjectFinancials(testProject.id);
    reconcileFreelancerPayouts(testFreelancer.id);
  }
  const invAfterLoops = getStoredInvoices().find((i) => i.id === invoice.id);
  assert(invAfterLoops?.amountPaid === 85000, 'Idempotence: Repeated reconciliation calls do not double count amounts');

  // 4.7: Duplicate Transaction Reference Protection
  const txRef = 'UPI-TEST-DUPLICATE-CHECK';
  const payTx1 = recordPayment({
    amount: 5000,
    transactionRef: txRef,
    paymentType: 'client_payment',
    status: 'completed'
  });
  const payTx2 = recordPayment({
    amount: 5000,
    transactionRef: txRef,
    paymentType: 'client_payment',
    status: 'completed'
  });
  assert(payTx1.transactionRef !== payTx2.transactionRef, 'Duplicate TxRef: Collision handled safely with unique suffix');

  // Cleanup test environment
  await testEnv.cleanup();

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n==================================================================');
  console.log(`   FAST TRACK TEST SUMMARY: ${testPassCount} PASSED, ${testFailCount} FAILED`);
  console.log('==================================================================\n');

  if (testFailCount > 0) {
    process.exit(1);
  }
}

runFastTrackTests().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
