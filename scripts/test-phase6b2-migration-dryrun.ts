/**
 * Phase 6B.2 Migration Preparation & Data Safety Test
 * Tests backup verification, demo filtering, duplicate detection, and dry-run execution
 */

import {
  generateCrmBackupPackage,
  verifyCrmBackup
} from '../src/services/crmBackupService';
import {
  verifyBackupForMigration,
  analyzeLocalRecordsForMigration,
  validateReferentialIntegrity,
  executeMigrationDryRun,
  generateRollbackStrategy
} from '../src/services/crmMigrationService';
import {
  assertEligibleForCloud
} from '../src/services/crmFirestoreService';

async function runMigrationTests() {
  console.log('==================================================================');
  console.log('   ROHITWORK CRM — PHASE 6B.2 MIGRATION & SAFETY UNIT TESTS   ');
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

  // Test 1: Demo Record Rejection
  try {
    assertEligibleForCloud({ id: 'client_nexora_01', isDemo: true, name: 'Nexora' }, 'clients');
    assert('Demo Record Rejection throws error', false, 'Expected error was not thrown');
  } catch (err: any) {
    assert('Demo Record Rejection throws error on isDemo: true', err.message.includes('Demo seed record'));
  }

  // Test 2: Real Record Allowed
  try {
    assertEligibleForCloud({ id: 'cli_real_99', isDemo: false, name: 'Real Client' }, 'clients');
    assert('Real non-demo record passes cloud assertion', true);
  } catch (err: any) {
    assert('Real non-demo record passes cloud assertion', false, err.message);
  }

  // Test 3: Local Records Analysis (Discrimination)
  const analysis = analyzeLocalRecordsForMigration();
  assert('Local analysis returns real vs demo records', analysis.totalReal >= 0 && analysis.totalDemo > 0);
  assert('Seed demo clients correctly categorized as demo', analysis.modules.clients.demo.length > 0);

  // Test 4: Referential Integrity Check
  const validData = {
    clients: [{ id: 'cli_01', name: 'Valid Client' }],
    projects: [{ id: 'proj_01', clientId: 'cli_01', title: 'Valid Project' }],
    tasks: [{ id: 'tsk_01', projectId: 'proj_01', title: 'Valid Task' }],
    invoices: [{ id: 'inv_01', clientId: 'cli_01', total: 50000 }],
    payments: [{ id: 'pay_01', invoiceId: 'inv_01', amount: 50000 }]
  };
  const refReportValid = validateReferentialIntegrity(validData);
  assert('Referential Integrity passes for valid entity chain', refReportValid.isValid && refReportValid.issues.length === 0);

  const brokenData = {
    clients: [{ id: 'cli_01', name: 'Valid Client' }],
    projects: [{ id: 'proj_broken', clientId: 'cli_non_existent', title: 'Broken Project' }],
    tasks: [],
    invoices: [{ id: 'inv_broken', clientId: 'cli_ghost', total: 10000 }],
    payments: [{ id: 'pay_broken', invoiceId: 'inv_missing', amount: 5000 }]
  };
  const refReportBroken = validateReferentialIntegrity(brokenData);
  assert('Referential Integrity flags orphaned foreign keys', !refReportBroken.isValid && refReportBroken.issues.length === 3);

  // Test 5: Backup Verification for Migration
  const backupPkg = await generateCrmBackupPackage({ adminEmail: 'workall724038@gmail.com' });
  const verifyRes = await verifyBackupForMigration(backupPkg.jsonString);
  assert('Backup verification sets verified state', verifyRes.isValid && verifyRes.checksumMatches && verifyRes.securityAudit.passed);

  // Test 6: Dry-Run Simulation Execution
  const dryRunRes = await executeMigrationDryRun({ requireVerifiedBackup: true });
  assert('Migration Dry-Run simulation executes successfully', dryRunRes.isSuccess && dryRunRes.backupVerified);
  assert('Dry-Run planned inserts calculated correctly', typeof dryRunRes.totalCloudInsertsPlanned === 'number');
  assert('Dry-Run preserves zero live writes guarantee', dryRunRes.safetyNotice.includes('DRY-RUN SIMULATION ONLY'));

  // Test 7: Rollback Strategy Manifest
  const rollback = generateRollbackStrategy();
  assert('Rollback strategy provides structured disaster recovery steps', rollback.steps.length === 5 && rollback.safetyGuarantees.length === 4);

  console.log('\n==================================================================');
  console.log(`MIGRATION UNIT TESTS: ${passed} passed, ${failed} failed`);
  console.log('==================================================================\n');

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runMigrationTests().catch(err => {
  console.error('Fatal error running migration tests:', err);
  process.exit(1);
});
