import { analyzeLocalRecordsForMigration } from '../src/services/crmMigrationService';
import { generateCrmBackupPackage, verifyCrmBackup } from '../src/services/crmBackupService';

async function main() {
  console.log('=== AUDITING LOCAL CRM STORAGE FOR REAL VS DEMO DATA ===');
  const analysis = analyzeLocalRecordsForMigration();
  
  console.log(`Total real records found: ${analysis.totalReal}`);
  console.log(`Total demo records found: ${analysis.totalDemo}`);
  
  for (const [mod, data] of Object.entries(analysis.modules)) {
    console.log(`Module [${mod}]: Total=${data.total}, Real=${data.real.length}, Demo=${data.demo.length}`);
    if (data.real.length > 0) {
      console.log(`  -> Real IDs: ${data.real.map(r => r.id).join(', ')}`);
    }
  }
}

main().catch(console.error);
