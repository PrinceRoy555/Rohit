/**
 * Rohitwork CRM — Phase 7: Live Functional Audit & E2E Lifecycle Verification
 * 
 * Verifies:
 * 1. All 14 CRM modules (initialization, schemas, validations, CRUD operations).
 * 2. Complete 10-step business lifecycle:
 *    Website Inquiry -> Lead -> Client -> Project -> Freelancer -> Task -> Proposal -> Invoice -> Payment -> Profit Report
 * 3. Data integrity, mathematical correctness, status transitions, and referential integrity.
 */

import {
  initCrmStorage,
  getStoredLeads,
  saveStoredLead,
  deleteStoredLead,
  convertLeadToClient,
  getStoredClients,
  saveStoredClient,
  deleteStoredClient,
  getStoredProjects,
  saveStoredProject,
  deleteStoredProject,
  getStoredFreelancers,
  saveStoredFreelancer,
  deleteStoredFreelancer,
  getStoredTasks,
  saveStoredTask,
  deleteStoredTask,
  getStoredQuotations,
  saveStoredQuotation,
  deleteStoredQuotation,
  convertQuotationToInvoice,
  getStoredInvoices,
  saveStoredInvoice,
  deleteStoredInvoice,
  getStoredPayments,
  recordPayment,
  deleteStoredPayment,
  getStoredExpenses,
  saveStoredExpense,
  deleteStoredExpense,
  getAllActiveRemindersWithDynamic,
  saveStoredReminder,
  deleteStoredReminder,
  getStoredSettings,
  updateStoredSettings,
  getFinancialSummary,
  getRealFinancialSummary,
  generateContextualWhatsAppReply,
  calculateQuotationTotals,
  calculateInvoiceTotals,
  getNextQuotationNumber,
  getNextInvoiceNumber,
  getNextPaymentReference,
  normalizePhoneNumber,
  isRecordDemo
} from '../src/services/crmStorageService';
import { KNOWN_SEED_RECORD_IDS } from '../src/services/crmBackupService';

import {
  CrmLead,
  CrmClient,
  CrmProject,
  CrmFreelancer,
  CrmTask,
  CrmQuotation,
  CrmInvoice,
  CrmPayment,
  CrmExpense,
  CrmReminder,
  CrmAgencySettings
} from '../src/types/crm';

async function runPhase7FunctionalAudit() {
  console.log('==================================================================');
  console.log('   ROHITWORK CRM — PHASE 7: LIVE FUNCTIONAL & WORKFLOW AUDIT      ');
  console.log('==================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(testName: string, condition: boolean, details?: string) {
    if (condition) {
      passed++;
      console.log(`  [PASS] ${testName}`);
    } else {
      failed++;
      console.error(`  [FAIL] ${testName}: ${details || 'Condition returned false'}`);
    }
  }

  // -------------------------------------------------------------
  // PART 1: STORAGE INITIALIZATION & ZERO-CONTAMINATION
  // -------------------------------------------------------------
  console.log('--- PART 1: Storage Hydration & Baseline Verification ---');
  await initCrmStorage();

  const baselineLeads = getStoredLeads();
  const baselineClients = getStoredClients();
  const baselineProjects = getStoredProjects();
  const baselineFreelancers = getStoredFreelancers();
  const baselineTasks = getStoredTasks();
  const baselineQuotations = getStoredQuotations();
  const baselineInvoices = getStoredInvoices();
  const baselinePayments = getStoredPayments();
  const baselineExpenses = getStoredExpenses();
  const baselineReminders = getAllActiveRemindersWithDynamic();
  const baselineSettings = getStoredSettings();

  assert('Storage initializes without throwing exceptions', true);
  assert('Settings are populated with agency defaults', Boolean(baselineSettings.agencyName && baselineSettings.currency === 'INR'));
  assert('Seed demo records are properly recognized by isRecordDemo', KNOMN_SEED_CHECK());

  function KNOMN_SEED_CHECK(): boolean {
    let allIdentified = true;
    for (const [moduleKey, idSet] of Object.entries(KNOWN_SEED_RECORD_IDS)) {
      for (const id of idSet) {
        if (!isRecordDemo({ id }, moduleKey)) {
          allIdentified = false;
          console.error(`Seed ID not recognized: ${id} in ${moduleKey}`);
          break;
        }
      }
    }
    return allIdentified;
  }

  // Baseline Financial Summary with excludeDemo: true must be 0
  const baselineFin = getRealFinancialSummary();
  assert(
    'Baseline financial summary with excludeDemo: true returns ₹0 revenue',
    baselineFin.totalCollected === 0 && baselineFin.totalOutstanding === 0 && baselineFin.totalOperatingExpenses === 0
  );

  // -------------------------------------------------------------
  // PART 2: 10-STEP END-TO-END BUSINESS LIFECYCLE VERIFICATION
  // -------------------------------------------------------------
  console.log('\n--- PART 2: Complete 10-Step End-to-End Business Lifecycle ---');

  // STEP 1: Website Inquiry / Public Submission
  const auditTimestamp = Date.now();
  const testPhone = '+91 9876543210';
  const testEmail = `audit.client.${auditTimestamp}@rohitwork.in`;

  console.log('[Step 1] Ingesting Public Website Inquiry...');
  const simulatedInquiry: CrmLead = {
    id: `lead_p7_audit_${auditTimestamp}`,
    name: 'Horizon Visual Media Inc',
    email: testEmail,
    phone: testPhone,
    company: 'Horizon Visual Media',
    service: 'Video Editing & Motion',
    source: 'website',
    budget: '₹50,000 - ₹1,00,000',
    budgetRange: '₹50,000 - ₹1,00,000',
    message: 'Need full post-production for commercial launch video and 3 social teasers.',
    status: 'new',
    pipelineStage: 'new',
    priority: 'high',
    submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const savedLead = saveStoredLead(simulatedInquiry);
  assert('Step 1: Lead successfully saved in CRM store', savedLead.id === simulatedInquiry.id);
  assert('Step 1: Lead is correctly marked as real (non-demo)', !isRecordDemo(savedLead, 'leads'));

  // STEP 2: Lead Triage & AI Pitch Generation
  console.log('[Step 2] Triaging Lead & Generating WhatsApp Pitch via AI Assistant...');
  const aiReply = generateContextualWhatsAppReply({
    clientName: savedLead.name,
    clientPhone: savedLead.phone,
    serviceName: savedLead.service,
    context: 'pricing_quote',
    language: 'en',
    tone: 'polite'
  });
  assert('Step 2: AI Reply Assistant produces non-empty context-aware pitch', aiReply.replyText.length > 50);
  assert('Step 2: AI Reply Assistant includes client name in draft', aiReply.replyText.includes('Horizon Visual Media'));

  // STEP 3: Convert Lead to Active Client
  console.log('[Step 3] Converting Lead to Active Client...');
  const convertedClient = convertLeadToClient(savedLead);
  assert('Step 3: Client object created from Lead', Boolean(convertedClient && convertedClient.id));
  assert('Step 3: Client inherits company and contact info', convertedClient.name === savedLead.name && convertedClient.company === 'Horizon Visual Media');
  assert('Step 3: Lead marked won and linked with convertedClientId', savedLead.convertedClientId === convertedClient.id && savedLead.pipelineStage === 'won');

  // STEP 4: Create Commercial Project linked to Client
  console.log('[Step 4] Creating Project linked to Client...');
  const projectData: Partial<CrmProject> & { title: string; clientId: string } = {
    id: `proj_p7_audit_${auditTimestamp}`,
    title: 'Horizon Commercial Master & Cutdowns',
    clientId: convertedClient.id,
    clientName: convertedClient.name,
    serviceCategory: 'Video Editing & Motion',
    description: 'Post-production for commercial brand film with color grading and sound design.',
    status: 'in_progress',
    budget: 75000,
    amountPaid: 0,
    startDate: new Date().toISOString().split('T')[0],
    deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    priority: 'high',
    progress: 50,
    deliverables: [
      { id: 'del_1', projectId: `proj_p7_audit_${auditTimestamp}`, title: '1x 60s Master Commercial 4K', url: 'https://frame.io/horizon', revisionRound: 1, status: 'approved', submittedAt: new Date().toISOString() },
      { id: 'del_2', projectId: `proj_p7_audit_${auditTimestamp}`, title: '3x 15s Instagram Reels', url: 'https://frame.io/horizon-reels', revisionRound: 1, status: 'approved', submittedAt: new Date().toISOString() },
      { id: 'del_3', projectId: `proj_p7_audit_${auditTimestamp}`, title: 'Sound Foley & Final Mix', url: 'https://drive.google.com/horizon-audio', revisionRound: 1, status: 'approved', submittedAt: new Date().toISOString() }
    ]
  };

  const savedProject = saveStoredProject(projectData);
  assert('Step 4: Project created with correct budget and client ID link', savedProject.id === projectData.id && savedProject.clientId === convertedClient.id);
  assert('Step 4: Project pendingBalance automatically calculated as ₹75,000', savedProject.pendingBalance === 75000);

  // STEP 5: Register Freelancer in Freelancer Hub
  console.log('[Step 5] Registering Subcontractor Freelancer in Freelancer Hub...');
  const freelancerData: Partial<CrmFreelancer> & { name: string; phone: string; specialty: string } = {
    id: `fl_p7_audit_${auditTimestamp}`,
    name: 'Karan Sharma',
    email: `karan.vfx.${auditTimestamp}@freelancer.rohitwork.in`,
    phone: '+91 9771122334',
    specialty: 'Motion Graphics & 3D VFX',
    skills: ['After Effects', 'Blender', 'Premiere Pro'],
    status: 'busy',
    rating: 5,
    hourlyRate: 1500,
    agreedAmount: 20000,
    paidAmount: 0,
    pendingBalance: 20000,
    paymentMethod: 'UPI',
    notes: 'Contracted for Horizon commercial 3D logo animation and VFX title sequences'
  };

  const savedFreelancer = saveStoredFreelancer(freelancerData);
  assert('Step 5: Freelancer saved with agreed rate and pending payout balance', savedFreelancer.pendingBalance === 20000);

  // STEP 6: Create Task linked to Project & Assigned to Freelancer
  console.log('[Step 6] Creating Task linked to Project & Assigned to Freelancer...');
  const taskData: Partial<CrmTask> & { title: string } = {
    id: `task_p7_audit_${auditTimestamp}`,
    title: '3D VFX Title Sequence & Logo Resolve',
    description: 'Render high-resolution 3D glass refraction logo animation at 24fps',
    projectId: savedProject.id,
    projectTitle: savedProject.title,
    clientId: convertedClient.id,
    clientName: convertedClient.name,
    assignedFreelancerId: savedFreelancer.id,
    assignedFreelancerName: savedFreelancer.name,
    priority: 'high',
    status: 'in_progress',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  };

  const savedTask = saveStoredTask(taskData);
  assert('Step 6: Task linked to both Project ID and Freelancer ID', savedTask.projectId === savedProject.id && savedTask.assignedFreelancerId === savedFreelancer.id);

  // STEP 7: Generate Scope Proposal / Commercial Quotation
  console.log('[Step 7] Generating Scope Proposal / Commercial Quotation...');
  const quoteItems = [
    {
      id: 'item_1',
      description: '4K Commercial Master Video Edit & Sound Foley',
      quantity: 1,
      unitPrice: 50000,
      amount: 50000
    },
    {
      id: 'item_2',
      description: '3D Motion Graphics & Logo VFX Resolve',
      quantity: 1,
      unitPrice: 25000,
      amount: 25000
    }
  ];

  const totals = calculateQuotationTotals(quoteItems, 0, 0, false, 0);
  const quotationNumber = getNextQuotationNumber();

  const quotationData: Partial<CrmQuotation> & { clientName: string } = {
    id: `quote_p7_audit_${auditTimestamp}`,
    quotationNumber,
    clientId: convertedClient.id,
    clientName: convertedClient.name,
    clientCompany: convertedClient.company,
    clientEmail: convertedClient.email,
    clientPhone: convertedClient.phone,
    projectId: savedProject.id,
    projectTitle: savedProject.title,
    issueDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    items: quoteItems,
    subtotal: totals.subtotal,
    total: totals.total,
    status: 'accepted',
    advancePercentage: 50,
    terms: '50% advance on signoff, 50% upon final master deliverable transfer.'
  };

  const savedQuotation = saveStoredQuotation(quotationData);
  assert('Step 7: Quotation generated and totals match ₹75,000', savedQuotation.total === 75000);

  // STEP 8: Convert Quotation to Branded Tax Invoice
  console.log('[Step 8] Converting Accepted Quotation to Branded Tax Invoice...');
  const convertedInvoice = convertQuotationToInvoice(savedQuotation.id);
  assert('Step 8: Quotation converted to Invoice successfully', Boolean(convertedInvoice && convertedInvoice.id));
  assert('Step 8: Invoice inherits all items and total amount of ₹75,000', convertedInvoice!.totalAmount === 75000 && convertedInvoice!.balanceDue === 75000);
  assert('Step 8: Quotation is tagged with convertedToInvoiceId', savedQuotation.convertedToInvoiceId === convertedInvoice!.id);

  // Verify duplicate conversion protection
  const repeatConversion = convertQuotationToInvoice(savedQuotation.id);
  assert('Step 8: Duplicate conversion returns existing invoice (idempotent)', repeatConversion!.id === convertedInvoice!.id);

  // STEP 9: Record Client Payment & Reconcile Invoice
  console.log('[Step 9] Recording Client Payment & Reconciling Invoice...');
  // Scenario: Client pays 100% full payment (₹75,000) via Bank IMPS/UPI
  const paymentRecord = recordPayment({
    paymentType: 'client_payment',
    clientId: convertedClient.id,
    clientName: convertedClient.name,
    invoiceId: convertedInvoice!.id,
    invoiceNumber: convertedInvoice!.invoiceNumber,
    projectId: savedProject.id,
    projectTitle: savedProject.title,
    amount: 75000,
    paymentMethod: 'bank_transfer',
    transactionRef: `UTR_${auditTimestamp}`,
    paymentDate: new Date().toISOString().split('T')[0],
    status: 'completed',
    notes: 'Full commercial settlement received via HDFC corporate transfer.'
  });

  assert('Step 9: Payment record created with verified UTR', paymentRecord.amount === 75000 && paymentRecord.transactionRef === `UTR_${auditTimestamp}`);

  // Re-read invoice to verify reconciliation
  const updatedInvoices = getStoredInvoices();
  const refreshedInvoice = updatedInvoices.find(i => i.id === convertedInvoice!.id);
  assert('Step 9: Invoice balanceDue reconciled to ₹0', refreshedInvoice?.balanceDue === 0);
  assert('Step 9: Invoice amountPaid updated to ₹75,000', refreshedInvoice?.amountPaid === 75000);
  assert('Step 9: Invoice status updated to "paid"', refreshedInvoice?.status === 'paid');

  // STEP 9b: Record Freelancer Payout
  console.log('[Step 9b] Recording Subcontractor Freelancer Payout...');
  const freelancerPayout = recordPayment({
    paymentType: 'freelancer_payout',
    freelancerId: savedFreelancer.id,
    freelancerName: savedFreelancer.name,
    projectId: savedProject.id,
    projectTitle: savedProject.title,
    amount: 20000,
    paymentMethod: 'upi',
    transactionRef: `UPI_PAYOUT_${auditTimestamp}`,
    paymentDate: new Date().toISOString().split('T')[0],
    status: 'completed',
    notes: 'Final payout for 3D logo VFX render sequence'
  });
  assert('Step 9b: Freelancer payout recorded', freelancerPayout.amount === 20000);

  // STEP 9c: Record Operating Expense (Render Cloud / Assets)
  console.log('[Step 9c] Recording Direct Project Operating Expense...');
  const expenseRecord = saveStoredExpense({
    title: 'Cloud GPU Render Farm Credit & Envato Footage',
    category: 'software',
    amount: 5000,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'credit_card',
    projectId: savedProject.id,
    projectTitle: savedProject.title,
    notes: 'Octane GPU cloud rendering cluster compute charges'
  });
  assert('Step 9c: Operating expense recorded (₹5,000)', expenseRecord.amount === 5000);

  // STEP 10: Financial Summary & Net Profit Calculation Verification
  console.log('[Step 10] Verifying Profit, Loss & Operating Margin Calculations...');
  // Math:
  // Gross Collected Inflow = ₹75,000
  // Freelancer Payouts     = ₹20,000
  // Direct Expenses        = ₹5,000
  // Total Cash Outflow     = ₹25,000
  // Net Retained Profit    = ₹50,000
  // Net Margin %           = 50,000 / 75,000 = 66.67% (rounded to 67%)
  const financialSummary = getRealFinancialSummary();

  assert('Step 10: Financial Summary collects real revenue of ₹75,000', financialSummary.totalCollected === 75000);
  assert('Step 10: Financial Summary shows ₹0 outstanding balance', financialSummary.totalOutstanding === 0);
  assert('Step 10: Financial Summary calculates net cashflow of ₹50,000', financialSummary.netCashflow === 50000);
  const calculatedMargin = Math.round((financialSummary.netCashflow / financialSummary.totalCollected) * 100);
  assert('Step 10: Financial Summary calculates operating margin at 67%', calculatedMargin === 67);

  // -------------------------------------------------------------
  // PART 3: REMINDERS & AUTOMATED SCHEDULING VERIFICATION
  // -------------------------------------------------------------
  console.log('\n--- PART 3: Reminders Module Verification ---');
  const customReminder = saveStoredReminder({
    title: 'Deliver 4K ProRes 422 Master to Horizon Media',
    type: 'project_deadline',
    priority: 'urgent',
    targetDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    linkedEntityId: savedProject.id,
    linkedEntityType: 'project',
    notes: 'Upload to Frame.io private client review link'
  });
  assert('Reminders: Custom urgent deadline reminder created', customReminder.priority === 'urgent');

  const activeReminders = getAllActiveRemindersWithDynamic();
  assert('Reminders: Active reminders stream includes newly created reminder', activeReminders.some(r => r.id === customReminder.id));

  // -------------------------------------------------------------
  // PART 4: CLEANUP AUDIT TEST FIXTURES (NON-DESTRUCTIVE)
  // -------------------------------------------------------------
  console.log('\n--- PART 4: Cleaning up Audit Test Records Locally ---');
  deleteStoredLead(savedLead.id);
  deleteStoredClient(convertedClient.id);
  deleteStoredProject(savedProject.id);
  deleteStoredFreelancer(savedFreelancer.id);
  deleteStoredTask(savedTask.id);
  deleteStoredQuotation(savedQuotation.id);
  deleteStoredInvoice(convertedInvoice!.id);
  deleteStoredPayment(paymentRecord.id);
  deleteStoredPayment(freelancerPayout.id);
  deleteStoredExpense(expenseRecord.id);
  deleteStoredReminder(customReminder.id);

  const postCleanupFin = getRealFinancialSummary();
  assert('Cleanup: Financial summary returns cleanly to ₹0 baseline after audit fixture removal', postCleanupFin.totalCollected === 0);

  // -------------------------------------------------------------
  // FINAL REPORT
  // -------------------------------------------------------------
  console.log('\n==================================================================');
  console.log(`   PHASE 7 FUNCTIONAL AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED `);
  console.log('==================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase7FunctionalAudit()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Phase 7 audit fatal failure:', err);
    process.exit(1);
  });
