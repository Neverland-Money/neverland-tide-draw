/**
 * replace-winners.ts
 *
 * Deterministically replaces specific winners (e.g. addresses that turned out to
 * be smart contracts) with the highest-ranked *eligible non-winner* from the SAME
 * rank-bracket.
 *
 * A replacement candidate is eligible when it:
 *   - falls in the same bracket (rank range) as the winner being replaced
 *   - has pearls > 0
 *   - is NOT blacklisted
 *   - is NOT already a winner
 *   - is NOT one of the addresses being replaced
 *   - is NOT a deployed contract on-chain (plain EOAs and EIP-7702 delegated
 *     EOAs are allowed; addresses with real contract bytecode are skipped)
 *
 * Candidates are considered in ascending rank order ("next rank") so the result
 * is fully deterministic — no randomness involved.
 *
 * Usage:
 *   pnpm tsx src/replace-winners.ts <epochId> --replace <addr1,addr2,...> [options]
 *
 * Options:
 *   --replace <list>   Comma-separated addresses to replace (required)
 *   --rpc <url>        JSON-RPC endpoint (default: env RPC_URL or BlockPi)
 *   --blacklist <path> Blacklist file (default: ./blacklist.json)
 *   --dry-run          Print the plan without writing any files
 *
 * Example:
 *   pnpm tsx src/replace-winners.ts 5 \
 *     --replace 0x82c370ba90e38ef6acd8b1b078d34fd86fc6bac9,0x8d5c2df3eef09088fcccf3376d8ecd0dd505f642,0x4e8aaecce10ad9394e96fe5f2bd4e587a7b04298
 */

import fs from 'fs/promises';
import path from 'path';
import { config } from './config.js';
import { calculateProbabilityPercent } from './selection.js';
import { loadBlacklist } from './blacklist.js';
import { createLogger } from './logger.js';

const logger = createLogger('replace-winners');

const DEFAULT_RPC = process.env.RPC_URL || 'https://rpc.monad.xyz';

interface WinnerRecord {
  address: string;
  rank: number;
  pearls: string;
  bracket: string;
  probability: number;
}

interface Candidate {
  address: string;
  rank: number;
  pearls: bigint;
}

type CodeKind = 'eoa' | 'eip7702' | 'contract';

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

function parsePearlsToWei(value: string): bigint {
  if (!value) return 0n;
  if (!value.includes('.')) return BigInt(value);
  const [integerPart, decimalPart = ''] = value.split('.');
  const paddedDecimal = (decimalPart + '0'.repeat(18)).substring(0, 18);
  return BigInt(`${integerPart}${paddedDecimal}`);
}

async function getCodeKind(rpc: string, address: string): Promise<CodeKind> {
  const res = await fetch(rpc, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getCode',
      params: [address, 'latest'],
    }),
  });
  const json = (await res.json()) as { result?: string; error?: { message: string } };
  if (json.error) {
    throw new Error(`eth_getCode failed for ${address}: ${json.error.message}`);
  }
  const code = (json.result || '0x').toLowerCase();
  if (code === '0x' || code === '') return 'eoa';
  // EIP-7702 delegation indicator: 0xef0100 || 20-byte address (23 bytes total).
  if (code.startsWith('0xef0100')) return 'eip7702';
  return 'contract';
}

function bracketFor(rank: number) {
  return config.brackets.find(b => rank >= b.minRank && rank <= b.maxRank);
}

async function main() {
  const args = process.argv.slice(2);

  const epochArg = args.find(arg => !arg.startsWith('--'));
  if (!epochArg) {
    console.error('❌ Error: Epoch ID is required');
    console.log(
      'Usage: pnpm tsx src/replace-winners.ts <epochId> --replace <addr1,addr2,...> [--rpc <url>] [--blacklist <path>] [--dry-run]'
    );
    process.exit(1);
  }
  const epochId = parseInt(epochArg, 10);
  if (isNaN(epochId) || epochId < 0) {
    console.error('❌ Error: Invalid epoch ID. Must be a positive number.');
    process.exit(1);
  }

  const replaceArg = getArgValue(args, '--replace');
  if (!replaceArg) {
    console.error('❌ Error: --replace <comma-separated addresses> is required');
    process.exit(1);
  }
  const replaceList = replaceArg
    .split(',')
    .map(a => a.trim().toLowerCase())
    .filter(Boolean);
  if (replaceList.length === 0) {
    console.error('❌ Error: --replace contained no addresses');
    process.exit(1);
  }

  const rpc = getArgValue(args, '--rpc') || DEFAULT_RPC;
  const dryRun = args.includes('--dry-run');
  const blacklistPath =
    getArgValue(args, '--blacklist') ||
    process.env.BLACKLIST_PATH ||
    path.join(process.cwd(), 'blacklist.json');

  const tideDir = path.join(process.cwd(), 'tides', String(epochId));
  const winnersPath = path.join(tideDir, 'winners.json');
  const winnersTxtPath = path.join(tideDir, 'winners.txt');
  const leaderboardPath = path.join(tideDir, 'leaderboard.json');
  const reportPath = path.join(tideDir, 'replacements.json');

  logger.info('Starting winner replacement', {
    epochId,
    replace: replaceList,
    rpc,
    blacklistPath,
    dryRun,
  });

  // --- Load winners ---
  const winnersFile = JSON.parse(await fs.readFile(winnersPath, 'utf-8'));
  const winners: WinnerRecord[] = winnersFile.winners;
  const winnerSet = new Set(winners.map(w => w.address.toLowerCase()));

  // Validate the requested replacements are actually current winners.
  for (const addr of replaceList) {
    if (!winnerSet.has(addr)) {
      console.error(`❌ Error: ${addr} is not a current winner in tide ${epochId}`);
      process.exit(1);
    }
  }

  // --- Load leaderboard + blacklist ---
  const leaderboardFile = JSON.parse(await fs.readFile(leaderboardPath, 'utf-8'));
  const blacklist = await loadBlacklist(blacklistPath);

  const entries: Candidate[] = leaderboardFile.leaderboard.map((e: any) => {
    const rawPoints = e.totalPointsWithMultiplierRaw ?? e.totalPointsWithMultiplier;
    return {
      address: String(e.user_id ?? e.address).toLowerCase(),
      rank: Number(e.rank),
      pearls: parsePearlsToWei(String(rawPoints ?? '0')),
      isBlacklisted:
        blacklist.has(String(e.user_id ?? e.address).toLowerCase()) ||
        Boolean(e.is_blacklisted ?? e.isBlacklisted ?? false),
    } as any;
  });

  const replaceSet = new Set(replaceList);

  // Build the per-bracket eligible pool (excluding current winners + replaced + blacklist + zero pearls),
  // sorted by ascending rank ("next rank" first).
  function eligiblePool(bracketName: string): Candidate[] {
    const bracket = config.brackets.find(b => b.name === bracketName)!;
    return (entries as any[])
      .filter(
        e =>
          e.rank >= bracket.minRank &&
          e.rank <= bracket.maxRank &&
          e.pearls > 0n &&
          !e.isBlacklisted &&
          !winnerSet.has(e.address) &&
          !replaceSet.has(e.address)
      )
      .sort((a, b) => (a.rank !== b.rank ? a.rank - b.rank : a.address.localeCompare(b.address)));
  }

  // Total eligible pearls per bracket — used only to report an indicative probability.
  const bracketTotals = new Map<string, bigint>();

  // Track addresses already chosen so two slots don't grab the same candidate.
  const reserved = new Set<string>();

  const replacements: Array<{
    index: number;
    old: WinnerRecord;
    new: WinnerRecord;
    skippedContracts: string[];
  }> = [];

  for (const oldAddr of replaceList) {
    const index = winners.findIndex(w => w.address.toLowerCase() === oldAddr);
    const oldWinner = winners[index];
    const bracketName = oldWinner.bracket;

    // Order eligible candidates by closeness in rank to the winner being replaced
    // (smallest |rank difference| first; ties → lower rank, then address).
    const pool = eligiblePool(bracketName)
      .filter(c => !reserved.has(c.address))
      .sort((a, b) => {
        const da = Math.abs(a.rank - oldWinner.rank);
        const db = Math.abs(b.rank - oldWinner.rank);
        if (da !== db) return da - db;
        if (a.rank !== b.rank) return a.rank - b.rank;
        return a.address.localeCompare(b.address);
      });
    if (!bracketTotals.has(bracketName)) {
      bracketTotals.set(
        bracketName,
        eligiblePool(bracketName).reduce((s, c) => s + c.pearls, 0n)
      );
    }
    const totalPearls = bracketTotals.get(bracketName)!;

    let picked: Candidate | undefined;
    const skippedContracts: string[] = [];

    for (const cand of pool) {
      const kind = await getCodeKind(rpc, cand.address);
      if (kind === 'contract') {
        skippedContracts.push(cand.address);
        logger.info('Skipping contract candidate', {
          address: cand.address,
          rank: cand.rank,
          bracket: bracketName,
        });
        continue;
      }
      picked = cand;
      logger.info('Selected replacement', {
        replaces: oldAddr,
        address: cand.address,
        rank: cand.rank,
        kind,
        bracket: bracketName,
      });
      break;
    }

    if (!picked) {
      console.error(
        `❌ Error: No eligible non-contract replacement found in bracket "${bracketName}" for ${oldAddr}`
      );
      process.exit(1);
    }

    reserved.add(picked.address);

    const newWinner: WinnerRecord = {
      address: picked.address,
      rank: picked.rank,
      pearls: picked.pearls.toString(),
      bracket: bracketName,
      probability: calculateProbabilityPercent(picked.pearls, totalPearls),
    };

    replacements.push({ index, old: oldWinner, new: newWinner, skippedContracts });
    winners[index] = newWinner;
  }

  // --- Report ---
  console.log('\n🔁 Replacement plan:');
  for (const r of replacements) {
    console.log(
      `  [pos ${r.index + 1}] ${r.old.address} (rank ${r.old.rank}) → ${r.new.address} (rank ${r.new.rank})` +
        (r.skippedContracts.length ? `  [skipped ${r.skippedContracts.length} contract(s)]` : '')
    );
  }

  if (dryRun) {
    console.log('\n💡 Dry run — no files written.');
    return;
  }

  // Persist updated winners.json (same schema), winners.txt, and an audit report.
  const updated = {
    ...winnersFile,
    winners,
    replacedAt: new Date().toISOString(),
  };
  await fs.writeFile(winnersPath, JSON.stringify(updated, null, 2));
  await fs.writeFile(winnersTxtPath, winners.map(w => w.address).join('\n') + '\n', 'utf-8');

  const report = {
    epochId,
    timestamp: new Date().toISOString(),
    rpc,
    rule: 'same-bracket-closest-rank-eligible-non-winner',
    replacements: replacements.map(r => ({
      position: r.index + 1,
      bracket: r.old.bracket,
      removed: { address: r.old.address, rank: r.old.rank, pearls: r.old.pearls },
      added: { address: r.new.address, rank: r.new.rank, pearls: r.new.pearls },
      skippedContracts: r.skippedContracts,
    })),
  };
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n✅ Updated:\n   ${winnersPath}\n   ${winnersTxtPath}\n   ${reportPath}`);
  logger.info('Replacement complete', { count: replacements.length });
}

main().catch(err => {
  console.error('\n❌ Error:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
