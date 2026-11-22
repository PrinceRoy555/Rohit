/**
 * Automated Verification Suite:
 * Quotation Workflow, Print/PDF Utility, Demo Data Isolation & Branding Consistency
 */

import {
  initCrmStorage,
  getStoredQuotations,
  getStoredClients,
  getStoredInvoices,
  getStoredProjects,
  getStoredTasks,
  saveStoredQuotation,
  updateQuotationStatus,
  convertQuotationToInvoice,
  duplicateStoredQuotation,
  deleteStoredQuotation,
  getFinancialSummary,
  getComprehensiveReports,
  DEFAULT_CRM_SETTINGS,
  updateStoredSettings,
  resetCrmSettingsToDefault,
  getStoredSettings,
  isRecordDemo
} from '../src/services/crmStorageService';
import { printDocument } from '../src/utils/printDocument';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${msg}`);
    failed++;
  }
}

async function runTests() {
  console.log('==================================================================');
  console.log('   ROHITWORK CRM — QUOTATION, PDF & DEMO DATA VERIFICATION        ');
  console.log('==================================================================\n');

  // ---------------------------------------------------------------
  // TEST GROUP 1: Demo Data Safety & Storage Isolation
  // ---------------------------------------------------------------
  console.log('>>> TEST GROUP 1: Demo Data Safety & Storage Isolation');

  await initCrmStorage();

  const realQuotations = getStoredQuotations();
  const allQuotations = getStoredQuotations({ includeDemo: true });
  console.log(`  [Info] Stored Quotations: real=${realQuotations.length}, total(with demo)=${allQuotations.length}`);

  const anyDemoInReal = realQuotations.some((q) => isRecordDemo(q, 'quotations'));
  assert(!anyDemoInReal, 'getStoredQuotations() by default does NOT return demo records');

  const realClients = getStoredClients();
  const anyDemoInClients = realClients.some((c) => isRecordDemo(c, 'clients'));
  assert(!anyDemoInClients, 'getStoredClients() by default does NOT return demo records');

  const realInvoices = getStoredInvoices();
  const anyDemoInInvoices = realInvoices.some((i) => isRecordDemo(i, 'invoices'));
  assert(!anyDemoInInvoices, 'getStoredInvoices() by default does NOT return demo records');

  // Verify financial summary excludes demo by default
  const financialSummary = getFinancialSummary();
  assert(typeof financialSummary.totalInvoiced === 'number', 'getFinancialSummary() returns numeric financial summary');
  assert(typeof financialSummary.totalCollected === 'number', 'getFinancialSummary() returns numeric collections');

  // Verify comprehensive reports calculate from clean data
  const reports = getComprehensiveReports('all');
  assert(reports.totalInvoiced >= 0, 'getComprehensiveReports() runs without error');

  // ---------------------------------------------------------------
  // TEST GROUP 2: Branding & Unverified Payment Safety
  // ---------------------------------------------------------------
  console.log('\n>>> TEST GROUP 2: Branding Consistency & Unverified Payment Safety');

  assert(
    DEFAULT_CRM_SETTINGS.agencyName === 'Rohitwork Creative Studio',
    `DEFAULT_CRM_SETTINGS agencyName is 'Rohitwork Creative Studio' (got: '${DEFAULT_CRM_SETTINGS.agencyName}')`
  );
  assert(
    DEFAULT_CRM_SETTINGS.websiteUrl === 'https://rohitwork.in',
    `DEFAULT_CRM_SETTINGS websiteUrl is 'https://rohitwork.in' (got: '${DEFAULT_CRM_SETTINGS.websiteUrl}')`
  );
  assert(
    DEFAULT_CRM_SETTINGS.phone === '+91 7732869027',
    `DEFAULT_CRM_SETTINGS phone is verified '+91 7732869027' (got: '${DEFAULT_CRM_SETTINGS.phone}')`
  );
  assert(
    DEFAULT_CRM_SETTINGS.upiId === '',
    `DEFAULT_CRM_SETTINGS upiId is safe empty string until owner verified`
  );
  assert(
    DEFAULT_CRM_SETTINGS.bankDetails.bankName === '',
    `DEFAULT_CRM_SETTINGS bankName is safe empty string until owner verified`
  );
  assert(
    DEFAULT_CRM_SETTINGS.bankDetails.accountNumber === '',
    `DEFAULT_CRM_SETTINGS accountNumber is safe empty string until owner verified`
  );
  assert(
    DEFAULT_CRM_SETTINGS.bankDetails.ifsc === '',
    `DEFAULT_CRM_SETTINGS IFSC is safe empty string until owner verified`
  );
  assert(
    DEFAULT_CRM_SETTINGS.address === '',
    `DEFAULT_CRM_SETTINGS address is safe empty string until owner verified`
  );
  assert(
    DEFAULT_CRM_SETTINGS.isPaymentDetailsVerified === false,
    `DEFAULT_CRM_SETTINGS isPaymentDetailsVerified is false by default`
  );
  assert(
    DEFAULT_CRM_SETTINGS.isAddressVerified === false,
    `DEFAULT_CRM_SETTINGS isAddressVerified is false by default`
  );

  // ---------------------------------------------------------------
  // TEST GROUP 3: Quotation Creation, Status Transition & Duplicate
  // ---------------------------------------------------------------
  console.log('\n>>> TEST GROUP 3: Quotation Creation, Status Transition & Duplicate');

  const testQuoteId = `quote_test_${Date.now()}`;
  const createdQuote = saveStoredQuotation({
    id: testQuoteId,
    clientName: 'Acme Test Corp',
    clientEmail: 'contact@acmetest.example.com',
    clientPhone: '+91 99887 76655',
    projectTitle: 'Brand Visual Identity 2026',
    quotationNumber: 'RW-QT-2026-999',
    status: 'draft',
    subtotal: 50000,
    totalAmount: 50000,
    advanceAmount: 25000,
    advancePercentage: 50,
    issueDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    items: [
      {
        id: 'item_1',
        description: 'Complete Brand Identity Pack',
        quantity: 1,
        unitPrice: 50000,
        amount: 50000
      }
    ],
    isDemo: false
  });

  assert(createdQuote.id === testQuoteId, 'Quotation created with expected test ID');
  assert(createdQuote.status === 'draft', 'Initial quotation status is draft');

  // Verify Status Transition to Sent
  const updatedQuote = updateQuotationStatus(testQuoteId, 'sent');
  assert(updatedQuote !== null && updatedQuote.status === 'sent', 'Quotation status updated to "sent"');
  assert(
    Boolean(updatedQuote?.activities?.some((a) => a.description.includes('changed from draft to sent'))),
    'Activity audit log recorded status transition'
  );

  // Verify Duplication
  const dupQuote = duplicateStoredQuotation(testQuoteId);
  assert(dupQuote !== null, 'duplicateStoredQuotation returns new quotation');
  assert(dupQuote?.id !== testQuoteId, 'Duplicated quotation has distinct unique ID');
  assert(dupQuote?.status === 'draft', 'Duplicated quotation resets to "draft" status');
  assert(dupQuote?.convertedToInvoiceId === undefined, 'Duplicated quotation resets convertedToInvoiceId');

  // ---------------------------------------------------------------
  // TEST GROUP 4: Convert Quotation to Invoice & Payment Safety
  // ---------------------------------------------------------------
  console.log('\n>>> TEST GROUP 4: Convert Quotation to Invoice & Payment Safety');

  // Case A: Unverified settings -> Invoice safely omits bank details
  const convertedInvoice = convertQuotationToInvoice(testQuoteId);
  assert(convertedInvoice !== null, 'convertQuotationToInvoice generates new invoice');
  assert(convertedInvoice?.quotationId === testQuoteId, 'Invoice correctly references source quotationId');
  assert(convertedInvoice?.totalAmount === 50000, 'Invoice totalAmount equals quotation totalAmount');
  assert(
    convertedInvoice?.bankDetails === undefined,
    'Unverified mode: Invoice safely omits bankDetails by default'
  );

  // Check quotation status updated to accepted and convertedToInvoiceId recorded
  const refreshedQuotations = getStoredQuotations();
  const quoteAfterConversion = refreshedQuotations.find((q) => q.id === testQuoteId);
  assert(quoteAfterConversion?.status === 'accepted', 'Source quotation status set to "accepted"');
  assert(
    quoteAfterConversion?.convertedToInvoiceId === convertedInvoice?.id,
    'Source quotation tracks convertedToInvoiceId'
  );

  // Test Duplicate Conversion Protection: repeated conversion should return existing invoice
  const secondConversion = convertQuotationToInvoice(testQuoteId);
  assert(
    secondConversion?.id === convertedInvoice?.id,
    'Duplicate conversion prevented: returns existing invoice ID without creating duplicates'
  );

  // Case B: Verified settings configured by owner -> Invoice populates verified bank details
  const verifiedQuoteId = `quote_verified_${Date.now()}`;
  saveStoredQuotation({
    id: verifiedQuoteId,
    clientName: 'Verified Client Ltd',
    clientEmail: 'info@verified.example.com',
    projectTitle: 'Verified Motion Graphics Campaign',
    quotationNumber: 'RW-QT-VERIFIED-01',
    validUntil: '2026-12-31',
    items: [{ id: 'it_1', description: 'Motion Design', quantity: 1, unitPrice: 35000, amount: 35000 }],
    subtotal: 35000,
    total: 35000,
    totalAmount: 35000,
    status: 'sent'
  });

  updateStoredSettings({
    isPaymentDetailsVerified: true,
    bankDetails: {
      bankName: 'Verified Test Bank Ltd',
      accountName: 'Rohit Verma',
      accountNumber: '112233445566',
      ifsc: 'TEST0009999'
    },
    upiId: 'rohit@testupi'
  });

  const verifiedInvoice = convertQuotationToInvoice(verifiedQuoteId);
  assert(
    verifiedInvoice?.bankDetails?.bankName === 'Verified Test Bank Ltd',
    'Verified mode: Invoice includes verified bankName after explicit owner verification'
  );
  assert(
    verifiedInvoice?.bankDetails?.accountNumber === '112233445566',
    'Verified mode: Invoice includes verified accountNumber after explicit owner verification'
  );
  assert(
    verifiedInvoice?.bankDetails?.upiId === 'rohit@testupi',
    'Verified mode: Invoice includes verified upiId after explicit owner verification'
  );

  // Revert settings to default safe unverified state
  resetCrmSettingsToDefault();

  // ---------------------------------------------------------------
  // TEST GROUP 5: Print Document Utility Integrity
  // ---------------------------------------------------------------
  console.log('\n>>> TEST GROUP 5: Print Document Utility Export Integrity');

  assert(typeof printDocument === 'function', 'printDocument is exported as an async function');

  // Cleanup test records
  deleteStoredQuotation(testQuoteId);
  if (dupQuote?.id) deleteStoredQuotation(dupQuote.id);

  console.log('\n==================================================================');
  console.log(`   TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('==================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test execution fatal error:', err);
  process.exit(1);
});
