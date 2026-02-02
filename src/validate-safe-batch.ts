import fs from 'fs/promises';
import path from 'path';

interface SafeBatchTransaction {
  contractInputsValues: {
    _to: string;
  };
}

interface SafeBatch {
  transactions: SafeBatchTransaction[];
}

async function main() {
  const args = process.argv.slice(2);

  const epochArg = args.find(arg => !arg.startsWith('--'));
  if (!epochArg) {
    console.error('❌ Error: Epoch ID is required');
    console.log('Usage: tsx src/validate-safe-batch.ts <epochId>');
    process.exit(1);
  }

  const epochId = parseInt(epochArg, 10);
  if (isNaN(epochId) || epochId < 0) {
    console.error('❌ Error: Invalid epoch ID');
    process.exit(1);
  }

  const tideDir = path.join(process.cwd(), 'tides', String(epochId));
  const winnersTextPath = path.join(tideDir, 'winners.txt');
  const safeBatchPath = path.join(tideDir, 'safe-batch.json');

  console.log('🔍 Validating Safe batch against winners list...\n');

  // Read winners.txt
  const winnersText = await fs.readFile(winnersTextPath, 'utf-8');
  const winnersFromFile = winnersText
    .split('\n')
    .map(addr => addr.trim().toLowerCase())
    .filter(addr => addr.length > 0);

  console.log(`📋 Winners from file: ${winnersFromFile.length}`);

  // Read safe-batch.json
  const safeBatchContent = await fs.readFile(safeBatchPath, 'utf-8');
  const safeBatch: SafeBatch = JSON.parse(safeBatchContent);

  const addressesFromBatch = safeBatch.transactions.map(tx =>
    tx.contractInputsValues._to.toLowerCase()
  );

  console.log(`📄 Transactions in batch: ${addressesFromBatch.length}\n`);

  // Check for duplicates in batch
  const batchDuplicates = addressesFromBatch.filter(
    (addr, idx) => addressesFromBatch.indexOf(addr) !== idx
  );
  if (batchDuplicates.length > 0) {
    console.error(`❌ Found ${batchDuplicates.length} duplicate(s) in batch:`);
    batchDuplicates.forEach(addr => console.error(`   ${addr}`));
    process.exit(1);
  }

  // Check all winners are in batch
  const missingFromBatch = winnersFromFile.filter(addr => !addressesFromBatch.includes(addr));
  if (missingFromBatch.length > 0) {
    console.error(`❌ Missing ${missingFromBatch.length} winner(s) from batch:`);
    missingFromBatch.forEach(addr => console.error(`   ${addr}`));
    process.exit(1);
  }

  // Check for extra addresses in batch
  const extraInBatch = addressesFromBatch.filter(addr => !winnersFromFile.includes(addr));
  if (extraInBatch.length > 0) {
    console.error(`❌ Found ${extraInBatch.length} extra address(es) in batch:`);
    extraInBatch.forEach(addr => console.error(`   ${addr}`));
    process.exit(1);
  }

  // Verify order matches
  let orderMismatch = false;
  for (let i = 0; i < winnersFromFile.length; i++) {
    if (winnersFromFile[i] !== addressesFromBatch[i]) {
      if (!orderMismatch) {
        console.warn('\n⚠️  Order mismatch detected:');
        orderMismatch = true;
      }
      console.warn(
        `   Position ${i + 1}: expected ${winnersFromFile[i]}, found ${addressesFromBatch[i]}`
      );
    }
  }

  if (!orderMismatch) {
    console.log('✅ All checks passed!');
    console.log(`   • ${winnersFromFile.length} winners verified`);
    console.log(`   • ${addressesFromBatch.length} transactions in batch`);
    console.log('   • No duplicates');
    console.log('   • Order matches');
    console.log('\n🎉 Safe batch is valid and ready to execute!\n');
  } else {
    console.log('\n⚠️  Validation passed with warnings (order mismatch)');
    console.log('   All addresses are present but order differs from winners.txt\n');
  }
}

main().catch(error => {
  console.error('Error:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
