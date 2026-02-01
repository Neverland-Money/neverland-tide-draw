import { selectAllWinners } from './selection.js';
import { config } from './config.js';
import { createRandomSource, generateSeed } from './random.js';
import type { LeaderboardEntry } from './types.js';
import { createLogger } from './logger.js';
import { loadBlacklist } from './blacklist.js';
import fs from 'fs/promises';
import path from 'path';

const logger = createLogger('pick-winners');

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
  if (!value) {
    return 0n;
  }

  if (!value.includes('.')) {
    return BigInt(value);
  }

  const [integerPart, decimalPart = ''] = value.split('.');
  const paddedDecimal = (decimalPart + '0'.repeat(18)).substring(0, 18);
  return BigInt(`${integerPart}${paddedDecimal}`);
}

async function main() {
  const args = process.argv.slice(2);

  const epochArg = args.find(arg => !arg.startsWith('--'));
  if (!epochArg) {
    console.error('❌ Error: Epoch ID is required');
    console.log('Usage: pnpm pick-winners <epochId> [--seed <hex>] [--blacklist <path>]');
    console.log('Example: pnpm pick-winners 1');
    console.log('Example: pnpm pick-winners 1 --seed <hex> --blacklist ./blacklist.json');
    process.exit(1);
  }

  const epochId = parseInt(epochArg, 10);

  if (isNaN(epochId) || epochId < 0) {
    console.error('❌ Error: Invalid epoch ID. Must be a positive number.');
    process.exit(1);
  }

  const tideDir = path.join(process.cwd(), 'tides', String(epochId));
  const leaderboardPath = path.join(tideDir, 'leaderboard.json');
  const outputPath = path.join(tideDir, 'winners.json');

  try {
    const seedArg = getArgValue(args, '--seed');
    const seed = seedArg ? seedArg.trim() : generateSeed();
    const randomSource = createRandomSource(seed);
    const blacklistPath = getArgValue(args, '--blacklist') || process.env.BLACKLIST_PATH;
    const blacklist = await loadBlacklist(blacklistPath);

    logger.info('Starting winner selection', {
      epochId,
      seed,
      seedSource: seedArg ? 'provided' : 'generated',
      blacklistCount: blacklist.size,
      blacklistPath: blacklistPath || 'none',
      timestamp: new Date().toISOString(),
    });

    await fs.mkdir(tideDir, { recursive: true });
    logger.info('Loading leaderboard from file', { path: leaderboardPath });
    const fileContent = await fs.readFile(leaderboardPath, 'utf-8');
    const data = JSON.parse(fileContent);

    if (!data.leaderboard || data.leaderboard.length === 0) {
      logger.warn('No eligible participants found for this epoch', { epochId });
      process.exit(0);
    }

    let blacklistExcluded = 0;
    let zeroPearlsExcluded = 0;

    const leaderboard: LeaderboardEntry[] = data.leaderboard
      .map((entry: any) => {
        const rawPoints = entry.totalPointsWithMultiplierRaw ?? entry.totalPointsWithMultiplier;
        const pearlsWei = parsePearlsToWei(String(rawPoints ?? '0'));
        const address = String(entry.user_id ?? entry.address).toLowerCase();
        const isBlacklisted =
          blacklist.has(address) || Boolean(entry.is_blacklisted ?? entry.isBlacklisted ?? false);

        return {
          address,
          pearls: pearlsWei.toString(),
          rank: Number(entry.rank),
          isBlacklisted,
        };
      })
      .filter((entry: LeaderboardEntry) => {
        if (entry.isBlacklisted) {
          blacklistExcluded += 1;
          return false;
        }
        if (BigInt(entry.pearls) <= 0n) {
          zeroPearlsExcluded += 1;
          return false;
        }
        return true;
      });

    leaderboard.sort((a, b) => {
      if (a.rank !== b.rank) {
        return a.rank - b.rank;
      }
      return a.address.localeCompare(b.address);
    });

    logger.info('Leaderboard loaded', {
      totalParticipants: leaderboard.length,
      zeroPearlsExcluded,
      blacklistExcluded,
    });

    logger.info('Starting winner selection process');
    const winners = selectAllWinners(leaderboard, config.brackets, randomSource);
    logger.info('Winners selected', {
      totalWinners: winners.length,
      brackets: config.brackets.length,
    });

    logger.info('Saving winners to file', { path: outputPath });
    const output = {
      epochId,
      timestamp: new Date().toISOString(),
      seed,
      totalParticipants: leaderboard.length,
      totalWinners: winners.length,
      winners: winners.map((w: any) => ({
        address: w.address,
        rank: w.rank,
        pearls: w.pearls,
        bracket: w.bracket,
        probability: w.probability,
      })),
    };

    await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
    logger.info('Winners saved successfully', { path: outputPath });

    const bracketSummary = config.brackets.map(bracket => ({
      bracket: bracket.name,
      winners: winners.filter((w: any) => w.bracket === bracket.name).length,
    }));
    logger.info('Summary by bracket', { brackets: bracketSummary });

    const top10 = winners.slice(0, 10).map((w: any, i: number) => ({
      position: i + 1,
      rank: w.rank,
      address: w.address,
      probability: w.probability.toFixed(4),
    }));
    logger.info('Top 10 winners', { top10 });

    logger.info('Winner selection complete', { totalWinners: winners.length });
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
