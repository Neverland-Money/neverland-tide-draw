import fs from 'fs/promises';
import path from 'path';
import { createLogger } from './logger.js';

const logger = createLogger('generate-safe-batch');

interface SafeTransaction {
  to: string;
  value: string;
  data: null;
  contractMethod: {
    inputs: Array<{
      internalType: string;
      name: string;
      type: string;
    }>;
    name: string;
    payable: boolean;
  };
  contractInputsValues: {
    _value: string;
    _lockDuration: string;
    _to: string;
  };
}

interface SafeBatch {
  version: string;
  chainId: string;
  createdAt: number;
  meta: {
    name: string;
    description: string;
    txBuilderVersion: string;
    createdFromSafeAddress: string;
    createdFromOwnerAddress: string;
    checksum: string;
  };
  transactions: SafeTransaction[];
}

interface Winner {
  address: string;
  rank: number;
  pearls: string;
  bracket: string;
  probability: number;
}

function getArgValue(args: string[], flag: string): string | undefined {
  const withEquals = args.find(arg => arg.startsWith(`${flag}=`));
  if (withEquals) {
    return withEquals.slice(flag.length + 1);
  }

  const index = args.indexOf(flag);
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1];
  }

  return undefined;
}

async function main() {
  const args = process.argv.slice(2);

  const epochArg = args.find(arg => !arg.startsWith('--'));
  if (!epochArg) {
    console.error('❌ Error: Epoch ID is required');
    console.log(
      'Usage: pnpm generate-safe-batch <epochId> [--contract <address>] [--amount <dust>] [--safe <address>] [--chain <id>]'
    );
    console.log('Example: pnpm generate-safe-batch 1');
    console.log('Example: pnpm generate-safe-batch 1 --amount 100');
    process.exit(1);
  }

  const epochId = parseInt(epochArg, 10);

  if (isNaN(epochId) || epochId < 0) {
    console.error('❌ Error: Invalid epoch ID. Must be a positive number.');
    process.exit(1);
  }

  const contractAddress =
    getArgValue(args, '--contract') ||
    process.env.VOTING_ESCROW_CONTRACT ||
    '0xBB4738D05AD1b3Da57a4881baE62Ce9bb1eEeD6C';
  const dustAmountRaw = getArgValue(args, '--amount') || process.env.REWARD_AMOUNT || '100';
  const dustAmount = (BigInt(dustAmountRaw) * BigInt(10 ** 18)).toString(); // Convert DUST to wei
  const safeAddress =
    getArgValue(args, '--safe') ||
    process.env.SAFE_ADDRESS ||
    '0xb83a6637c87E6a7192b3ADA845c0745F815e9006';
  const chainId = getArgValue(args, '--chain') || process.env.CHAIN_ID || '143';

  const tideDir = path.join(process.cwd(), 'tides', String(epochId));
  const winnersPath = path.join(tideDir, 'winners.json');
  const outputPath = path.join(tideDir, 'safe-batch.json');

  try {
    logger.info('Loading winners from file', { path: winnersPath });
    const fileContent = await fs.readFile(winnersPath, 'utf-8');
    const data = JSON.parse(fileContent);

    if (!data.winners || data.winners.length === 0) {
      logger.warn('No winners found', { epochId });
      process.exit(0);
    }

    const winners: Winner[] = data.winners;
    logger.info('Winners loaded', { count: winners.length });

    logger.info('Generating Safe transaction batch', {
      contract: contractAddress,
      dustAmount: dustAmountRaw,
      dustAmountWei: dustAmount,
      safeAddress,
      chainId,
    });

    const transactions: SafeTransaction[] = winners.map(winner => ({
      to: contractAddress,
      value: '0',
      data: null,
      contractMethod: {
        inputs: [
          {
            internalType: 'uint256',
            name: '_value',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: '_lockDuration',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: '_to',
            type: 'address',
          },
        ],
        name: 'createLockPermanentFor',
        payable: false,
      },
      contractInputsValues: {
        _value: dustAmount,
        _lockDuration: '15552000',
        _to: winner.address,
      },
    }));

    const safeBatch: SafeBatch = {
      version: '1.0',
      chainId: chainId,
      createdAt: Date.now(),
      meta: {
        name: `Tide ${epochId} - 6-Month Locks for Winners`,
        description: `Create 6-month locks for ${winners.length} Tide ${epochId} winners (${dustAmountRaw} DUST each)`,
        txBuilderVersion: '1.18.3',
        createdFromSafeAddress: safeAddress,
        createdFromOwnerAddress: '',
        checksum: '0x0000000000000000000000000000000000000000000000000000000000000000',
      },
      transactions,
    };

    await fs.writeFile(outputPath, JSON.stringify(safeBatch, null, 2));
    logger.info('Safe batch file created', { path: outputPath, transactions: transactions.length });

    console.log('\n✅ Safe Transaction Batch Generated!');
    console.log(`📄 File: ${outputPath}`);
    console.log(`🔢 Transactions: ${transactions.length}`);
    console.log(`💰 Amount per winner: ${dustAmountRaw} DUST (${dustAmount} wei)`);
    console.log(`📍 Contract: ${contractAddress}`);
    console.log(`🔐 Safe: ${safeAddress}`);
    console.log(`⛓️  Chain ID: ${chainId}`);
    console.log('\nNext steps:');
    console.log('1. Review the generated safe-batch.json file');
    console.log('2. Import it into the Safe Transaction Builder');
    console.log('3. Review and sign the transactions\n');
  } catch (error) {
    logger.error('Error generating Safe batch', {
      error: error instanceof Error ? error.message : String(error),
    });
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

main();
