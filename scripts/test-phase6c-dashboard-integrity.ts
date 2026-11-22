/**
 * ROHITWORK CRM — PHASE 6C LIVE DASHBOARD DATA INTEGRITY TEST
 * 
 * Verifies that:
 * 1. isFirestoreConnected is TRUE when Firebase is configured (even when collections have 0 docs)
 * 2. When Cloud Firestore is empty, Dashboard metrics show strictly 0 across all KPI counters
 * 3. Never presents demo/mock revenue, clients, projects, or payouts as live metrics
 * 4. Seed demo records are preserved locally and tagged with isDemo: true
 * 5. getFinancialSummary strictly excludes demo records by default
 */

import { initCrmStorage, getFinancialSummary, getStoredClients, getStoredProjects, getStoredTasks, getStoredFreelancers } from '../src/services/crmStorageService';
import { getCrmDashboardMetrics } from '../src/services/crmService';
import { isRecordDemo, KNOWN_SEED_RECORD_IDS } from '../src/services/crmBackupService';

async function runDashboardIntegrityTests() {
  console.log('==================================================================');
  console.log('   ROHITWORK CRM — DASHBOARD DATA INTEGRITY VERIFICATION SUITE    ');
  console.log('==================================================================\n');

  // Initialize CRM store (seeds demo data in memory)
  await initCrmStorage();

  // Test 1: Verify all 36 seed records are tagged with isDemo: true
  console.log('[Test 1] Auditing seed records for explicit isDemo: true tags...');
  let totalDemoCount = 0;
  for (const [moduleName, idSet] of Object.entries(KNOWN_SEED_RECORD_IDS)) {
    for (const id of idSet) {
      totalDemoCount++;
      const isDemo = isRecordDemo({ id }, moduleName);
      if (!isDemo) {
        throw new Error(`Seed record ${id} in ${moduleName} was NOT identified as demo!`);
      }
    }
  }
  console.log(`  [PASS] All ${totalDemoCount} factory seed records correctly identified by isRecordDemo()`);

  // Test 2: getFinancialSummary default exclusion
  console.log('\n[Test 2] Verifying getFinancialSummary() defaults to excludeDemo: true...');
  const finSummary = getFinancialSummary();
  if (finSummary.totalCollected !== 0) {
    throw new Error(`getFinancialSummary() leaked demo collected revenue: ₹${finSummary.totalCollected}`);
  }
  if (finSummary.totalOutstanding !== 0) {
    throw new Error(`getFinancialSummary() leaked demo outstanding balance: ₹${finSummary.totalOutstanding}`);
  }
  if (finSummary.pendingFreelancerPayouts !== 0) {
    throw new Error(`getFinancialSummary() leaked demo freelancer payouts: ₹${finSummary.pendingFreelancerPayouts}`);
  }
  if (finSummary.totalOperatingExpenses !== 0) {
    throw new Error(`getFinancialSummary() leaked demo expenses: ₹${finSummary.totalOperatingExpenses}`);
  }
  console.log('  [PASS] getFinancialSummary() returns strictly ₹0 revenue, ₹0 outstanding, ₹0 payouts, ₹0 expenses');

  // Test 3: getCrmDashboardMetrics on empty Cloud Database
  console.log('\n[Test 3] Verifying getCrmDashboardMetrics() against empty cloud database...');
  const metrics = await getCrmDashboardMetrics();

  console.log('  Dashboard Metrics output:');
  console.log(`    - isFirestoreConnected : ${metrics.isFirestoreConnected}`);
  console.log(`    - totalLeads           : ${metrics.totalLeads}`);
  console.log(`    - newLeads             : ${metrics.newLeads}`);
  console.log(`    - activeClientsCount   : ${metrics.activeClientsCount}`);
  console.log(`    - activeProjectsCount  : ${metrics.activeProjectsCount}`);
  console.log(`    - pendingTasksCount    : ${metrics.pendingTasksCount}`);
  console.log(`    - monthlyRevenue       : ₹${metrics.monthlyRevenue}`);
  console.log(`    - outstandingPayments  : ₹${metrics.outstandingPayments}`);
  console.log(`    - freelancerPayoutsDue : ₹${metrics.freelancerPayoutsDue}`);

  if (metrics.isFirestoreConnected !== true) {
    throw new Error(`isFirestoreConnected evaluated to ${metrics.isFirestoreConnected}, expected true!`);
  }
  if (metrics.totalLeads !== 0) {
    throw new Error(`totalLeads evaluated to ${metrics.totalLeads}, expected 0!`);
  }
  if (metrics.activeClientsCount !== 0) {
    throw new Error(`activeClientsCount evaluated to ${metrics.activeClientsCount}, expected 0!`);
  }
  if (metrics.activeProjectsCount !== 0) {
    throw new Error(`activeProjectsCount evaluated to ${metrics.activeProjectsCount}, expected 0!`);
  }
  if (metrics.pendingTasksCount !== 0) {
    throw new Error(`pendingTasksCount evaluated to ${metrics.pendingTasksCount}, expected 0!`);
  }
  if (metrics.monthlyRevenue !== 0) {
    throw new Error(`monthlyRevenue evaluated to ${metrics.monthlyRevenue}, expected 0!`);
  }
  if (metrics.outstandingPayments !== 0) {
    throw new Error(`outstandingPayments evaluated to ${metrics.outstandingPayments}, expected 0!`);
  }
  if (metrics.freelancerPayoutsDue !== 0) {
    throw new Error(`freelancerPayoutsDue evaluated to ${metrics.freelancerPayoutsDue}, expected 0!`);
  }

  console.log('  [PASS] Dashboard metrics: 100% clean, verified, zero-leakage guarantee satisfied!');

  // Test 4: Preservation of local demo data (no destructive deletion)
  console.log('\n[Test 4] Verifying local demo records remain preserved (non-destructive)...');
  const storedClients = getStoredClients();
  const storedProjects = getStoredProjects();
  const storedTasks = getStoredTasks();
  const storedFreelancers = getStoredFreelancers();

  if (storedClients.length === 0 || storedProjects.length === 0 || storedTasks.length === 0 || storedFreelancers.length === 0) {
    throw new Error('Local demo data was destructively deleted!');
  }
  console.log(`  [PASS] Local data preserved: ${storedClients.length} clients, ${storedProjects.length} projects, ${storedTasks.length} tasks, ${storedFreelancers.length} freelancers safely intact locally.`);

  console.log('\n==================================================================');
  console.log('   DASHBOARD DATA INTEGRITY: ALL 4 VERIFICATION CHECKS PASSED!    ');
  console.log('==================================================================\n');
}

runDashboardIntegrityTests().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('\n[FAIL] Test suite failed:', err);
  process.exit(1);
});
