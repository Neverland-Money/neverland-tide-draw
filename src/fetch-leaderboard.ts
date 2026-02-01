import { fetchCompleteLeaderboard } from './envio-client.js';
import { createLogger } from './logger.js';
import { loadBlacklist } from './blacklist.js';
import fs from 'fs/promises';
import path from 'path';

const logger = createLogger('fetch-leaderboard');

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

function formatUnits(rawValue: string, decimals: number, displayDecimals: number): string {
  const normalized = BigInt(rawValue).toString();
  const negative = normalized.startsWith('-');
  const unsigned = negative ? normalized.slice(1) : normalized;
  const padded = unsigned.padStart(decimals + 1, '0');

  let integerPart = padded.slice(0, -decimals);
  let fractionalPart = padded.slice(-decimals);

  if (displayDecimals < decimals) {
    const roundDigit = fractionalPart[displayDecimals] ?? '0';
    fractionalPart = fractionalPart.slice(0, displayDecimals);

    if (roundDigit >= '5') {
      const fractionDigits = fractionalPart.split('');
      let carry = 1;

      for (let i = fractionDigits.length - 1; i >= 0 && carry; i -= 1) {
        const next = fractionDigits[i].charCodeAt(0) - 48 + carry;
        if (next === 10) {
          fractionDigits[i] = '0';
          carry = 1;
        } else {
          fractionDigits[i] = String(next);
          carry = 0;
        }
      }

      if (carry) {
        integerPart = (BigInt(integerPart) + 1n).toString();
      }

      fractionalPart = fractionDigits.join('');
    }
  } else if (displayDecimals > decimals) {
    fractionalPart = fractionalPart.padEnd(displayDecimals, '0');
  }

  if (displayDecimals === 0) {
    return `${negative ? '-' : ''}${integerPart}`;
  }

  const displayFraction = fractionalPart.padEnd(displayDecimals, '0');
  return `${negative ? '-' : ''}${integerPart}.${displayFraction}`;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Error: Epoch number is required');
    console.log('Usage: pnpm fetch-leaderboard <epoch> [--blacklist <path>]');
    console.log('Example: pnpm fetch-leaderboard 1');
    console.log('Example: pnpm fetch-leaderboard 1 --blacklist ./blacklist.json');
    process.exit(1);
  }

  const epochArg = args.find(arg => !arg.startsWith('--'));
  const epoch = epochArg ? parseInt(epochArg, 10) : NaN;

  if (isNaN(epoch) || epoch < 0) {
    console.error('❌ Error: Invalid epoch number. Must be a positive number.');
    process.exit(1);
  }

  const outputDir = path.join(process.cwd(), 'tides', String(epoch));
  const outputPath = path.join(outputDir, 'leaderboard.json');

  try {
    await fs.mkdir(outputDir, { recursive: true });
    const blacklistPath = getArgValue(args, '--blacklist') || process.env.BLACKLIST_PATH;
    const blacklist = await loadBlacklist(blacklistPath);

    logger.info('Starting leaderboard fetch', {
      epoch,
      blacklistCount: blacklist.size,
      blacklistPath: blacklistPath || 'none',
    });

    logger.info('Fetching leaderboard data from indexer');
    const leaderboard = await fetchCompleteLeaderboard(epoch, Array.from(blacklist));

    if (leaderboard.length === 0) {
      logger.warn('No entries found for this epoch', { epoch });
      process.exit(0);
    }

    logger.info('Leaderboard data fetched', { totalUsers: leaderboard.length });

    logger.info('Formatting points to decimal notation');
    const leaderboardFormatted = leaderboard.map((entry: any) => {
      const depositRaw = BigInt(entry.depositPointsWithMultiplier).toString();
      const borrowRaw = BigInt(entry.borrowPointsWithMultiplier).toString();
      const lpRaw = BigInt(entry.lpPointsWithMultiplier).toString();
      const vpRaw = BigInt(entry.vpPointsWithMultiplier).toString();
      const totalRaw = BigInt(entry.totalPointsWithMultiplier).toString();

      return {
        user_id: entry.user_id,
        rank: entry.rank,
        depositPointsWithMultiplier: formatUnits(depositRaw, 18, 2),
        depositPointsWithMultiplierRaw: depositRaw,
        borrowPointsWithMultiplier: formatUnits(borrowRaw, 18, 2),
        borrowPointsWithMultiplierRaw: borrowRaw,
        lpPointsWithMultiplier: formatUnits(lpRaw, 18, 2),
        lpPointsWithMultiplierRaw: lpRaw,
        vpPointsWithMultiplier: formatUnits(vpRaw, 18, 2),
        vpPointsWithMultiplierRaw: vpRaw,
        totalPointsWithMultiplier: formatUnits(totalRaw, 18, 2),
        totalPointsWithMultiplierRaw: totalRaw,
        lastAppliedMultiplierBps: entry.lastAppliedMultiplierBps,
        testnetBonusBps: entry.testnetBonusBps,
      };
    });

    logger.info('Points formatted', { entries: leaderboardFormatted.length });

    logger.info('Saving to file', { path: outputPath });
    const output = {
      epoch,
      timestamp: new Date().toISOString(),
      totalEntries: leaderboard.length,
      leaderboard: leaderboardFormatted,
    };

    await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
    logger.info('Leaderboard saved successfully', { path: outputPath });

    if (leaderboard.length > 0) {
      const top1 = leaderboard[0];
      const top1Points = formatUnits(top1.totalPointsWithMultiplier, 18, 2);
      logger.info('Top performer', {
        address: top1.user_id,
        points: top1Points,
      });

      if (leaderboard.length >= 10) {
        const top10 = leaderboard.slice(0, 10).map((entry: any, i: number) => ({
          rank: i + 1,
          address: entry.user_id,
          points: formatUnits(entry.totalPointsWithMultiplier, 18, 2),
        }));
        logger.info('Top 10 leaderboard', { top10 });
      }
    }

    logger.info('Fetch complete', { totalEntries: leaderboard.length });
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

main();
