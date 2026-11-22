const { execSync } = require('child_process');

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

const testScripts = [
  'scripts/test-phase6b2-migration-dryrun.ts',
  'scripts/test-phase6b2-persistence-emulator.ts',
  'scripts/test-cross-browser-sync.ts',
  'scripts/test-phase6b3-readiness-audit.ts',
  'scripts/test-public-payload-compatibility.ts',
  'scripts/test-firestore-rules-emulator.ts',
  'scripts/test-phase6c-dashboard-integrity.ts',
  'scripts/test-phase7-functional-audit.ts',
  'scripts/test-phase2-phase3-fasttrack.ts',
  'scripts/verify-rollback-rules.ts',
  'scripts/test-phase10-full-e2e.ts',
  'scripts/test-quotation-pdf-demo-repair.ts',
  'scripts/test-pdf-visual-inspection.ts'
];

console.log('==================================================================');
console.log('   ROHITWORK CRM — RUNNING ALL INTEGRATED TEST SUITES             ');
console.log('==================================================================\n');

for (const script of testScripts) {
  console.log(`\n>>> EXECUTING ${script}...\n`);
  try {
    execSync(`npx.cmd tsx ${script}`, { stdio: 'inherit', env: process.env });
  } catch (err) {
    console.error(`FAILED: ${script}`);
    process.exit(1);
  }
}

console.log('\n==================================================================');
console.log('   ALL TEST SUITES EXECUTED WITH 100% SUCCESS!                    ');
console.log('==================================================================\n');
