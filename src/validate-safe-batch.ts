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

  // Check for multiple batch files (safe-batch-1.json, safe-batch-2.json, etc.)
  const batchFiles: string[] = [];
  let batchIndex = 1;
  while (true) {
    const batchPath = path.join(tideDir, `safe-batch-${batchIndex}.json`);
    try {
      await fs.access(batchPath);
      batchFiles.push(batchPath);
      batchIndex++;
    } catch {
      break;
    }
  }

  // If no numbered batches found, check for single batch file
  if (batchFiles.length === 0) {
    const singleBatchPath = path.join(tideDir, 'safe-batch.json');
    try {
      await fs.access(singleBatchPath);
      batchFiles.push(singleBatchPath);
    } catch {
      console.error('❌ Error: No batch files found');
      process.exit(1);
    }
  }

  console.log('🔍 Validating Safe batch(es) against winners list...\n');
  console.log(`📦 Found ${batchFiles.length} batch file(s)`);

  // Read winners.txt
  const winnersText = await fs.readFile(winnersTextPath, 'utf-8');
  const winnersFromFile = winnersText
    .split('\n')
    .map(addr => addr.trim().toLowerCase())
    .filter(addr => addr.length > 0);

  console.log(`📋 Winners from file: ${winnersFromFile.length}`);

  // Read all batch files and collect addresses
  const allAddressesFromBatches: string[] = [];
  const batchAddressCounts: number[] = [];

  for (let i = 0; i < batchFiles.length; i++) {
    const batchPath = batchFiles[i];
    const safeBatchContent = await fs.readFile(batchPath, 'utf-8');
    const safeBatch: SafeBatch = JSON.parse(safeBatchContent);

    const addressesInBatch = safeBatch.transactions.map(tx =>
      tx.contractInputsValues._to.toLowerCase()
    );

    batchAddressCounts.push(addressesInBatch.length);
    allAddressesFromBatches.push(...addressesInBatch);

    console.log(
      `📄 Batch ${i + 1}: ${path.basename(batchPath)} - ${addressesInBatch.length} transactions`
    );
  }

  console.log(`📊 Total transactions across all batches: ${allAddressesFromBatches.length}\n`);

  // Check for duplicates across all batches
  const batchDuplicates = allAddressesFromBatches.filter(
    (addr, idx) => allAddressesFromBatches.indexOf(addr) !== idx
  );
  if (batchDuplicates.length > 0) {
    console.error(`❌ Found ${batchDuplicates.length} duplicate(s) across batches:`);
    const uniqueDuplicates = [...new Set(batchDuplicates)];
    uniqueDuplicates.forEach(addr => console.error(`   ${addr}`));
    process.exit(1);
  }

  // Check all winners are in batches
  const missingFromBatch = winnersFromFile.filter(addr => !allAddressesFromBatches.includes(addr));
  if (missingFromBatch.length > 0) {
    console.error(`❌ Missing ${missingFromBatch.length} winner(s) from batches:`);
    missingFromBatch.forEach(addr => console.error(`   ${addr}`));
    process.exit(1);
  }

  // Check for extra addresses in batches
  const extraInBatch = allAddressesFromBatches.filter(addr => !winnersFromFile.includes(addr));
  if (extraInBatch.length > 0) {
    console.error(`❌ Found ${extraInBatch.length} extra address(es) in batches:`);
    extraInBatch.forEach(addr => console.error(`   ${addr}`));
    process.exit(1);
  }

  // Verify order matches across all batches
  let orderMismatch = false;
  for (let i = 0; i < winnersFromFile.length; i++) {
    if (winnersFromFile[i] !== allAddressesFromBatches[i]) {
      if (!orderMismatch) {
        console.warn('\n⚠️  Order mismatch detected:');
        orderMismatch = true;
      }
      console.warn(
        `   Position ${i + 1}: expected ${winnersFromFile[i]}, found ${allAddressesFromBatches[i]}`
      );
    }
  }

  if (!orderMismatch) {
    console.log('✅ All checks passed!');
    console.log(`   • ${winnersFromFile.length} winners verified`);
    console.log(
      `   • ${allAddressesFromBatches.length} total transactions across ${batchFiles.length} batch(es)`
    );
    if (batchFiles.length > 1) {
      batchAddressCounts.forEach((count, idx) => {
        console.log(`     - Batch ${idx + 1}: ${count} transactions`);
      });
    }
    console.log('   • No duplicates');
    console.log('   • Order matches');
    console.log('\n🎉 Safe batch(es) valid and ready to execute!\n');
  } else {
    console.log('\n⚠️  Validation passed with warnings (order mismatch)');
    console.log('   All addresses are present but order differs from winners.txt\n');
  }
}

main().catch(error => {
  console.error('Error:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
