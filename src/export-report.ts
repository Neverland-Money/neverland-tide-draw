import { config } from './config.js';
import type { WinnerReport, BracketReport } from './types.js';
import fs from 'fs/promises';
import path from 'path';

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

async function generateReport(epochId: number): Promise<WinnerReport> {
  const tideDir = path.join(process.cwd(), 'tides', String(epochId));
  const leaderboardPath = path.join(tideDir, 'leaderboard.json');
  const winnersPath = path.join(tideDir, 'winners.json');
  let winners = [];

  console.log('📡 Loading leaderboard data...');
  let leaderboard = [];

  try {
    const leaderboardData = await fs.readFile(leaderboardPath, 'utf-8');
    const parsed = JSON.parse(leaderboardData);
    const entries = Array.isArray(parsed?.leaderboard) ? parsed.leaderboard : [];

    leaderboard = entries
      .map((entry: any) => {
        const rawPoints = entry.totalPointsWithMultiplierRaw ?? entry.totalPointsWithMultiplier;
        const pearlsWei = parsePearlsToWei(String(rawPoints ?? '0'));
        const isBlacklisted = Boolean(entry.is_blacklisted ?? entry.isBlacklisted ?? false);

        return {
          address: entry.user_id ?? entry.address,
          rank: Number(entry.rank),
          pearls: pearlsWei.toString(),
          isBlacklisted,
        };
      })
      .filter(
        (entry: { address: string; rank: number; pearls: string; isBlacklisted: boolean }) =>
          !entry.isBlacklisted && BigInt(entry.pearls) > 0n
      );

    console.log(`✅ Loaded ${leaderboard.length} eligible entries from ${leaderboardPath}`);
  } catch (error) {
    throw new Error(
      `Missing leaderboard file at ${leaderboardPath}. Run \"pnpm fetch-leaderboard ${epochId}\" first.`
    );
  }

  try {
    const winnersData = await fs.readFile(winnersPath, 'utf-8');
    const parsed = JSON.parse(winnersData);
    winners = parsed.winners || [];
    console.log(`✅ Loaded ${winners.length} winners from ${winnersPath}`);
  } catch (error) {
    console.log('⚠️  No winners file found. Generating report without winners.');
  }

  const bracketReports: BracketReport[] = config.brackets.map(bracket => {
    const participants = leaderboard.filter(
      (entry: any) => entry.rank >= bracket.minRank && entry.rank <= bracket.maxRank
    );

    const totalPearls = participants.reduce(
      (sum: bigint, entry: any) => sum + BigInt(entry.pearls),
      0n
    );

    const winnersInBracket = winners.filter((w: any) => w.bracket === bracket.name);

    return {
      name: bracket.name,
      totalParticipants: participants.length,
      totalPearls: totalPearls.toString(),
      winnersSelected: winnersInBracket.length,
    };
  });

  return {
    timestamp: new Date().toISOString(),
    totalParticipants: leaderboard.length,
    totalWinners: winners.length,
    brackets: bracketReports,
    winners,
  };
}

function formatPearls(pearlsWei: string): string {
  const whole = Number(BigInt(pearlsWei)) / 1e18;
  return whole.toFixed(2);
}

function buildMarkdownReport(epochId: number, report: WinnerReport): string {
  const lines: string[] = [];

  lines.push(`# Tide ${epochId} Report`);
  lines.push('');
  lines.push(`Generated: ${report.timestamp}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Total participants: ${report.totalParticipants}`);
  lines.push(`- Total winners: ${report.totalWinners}`);
  lines.push('');
  lines.push('## Files');
  lines.push('');
  lines.push('- [Leaderboard JSON](./leaderboard.json)');
  lines.push('- [Winners JSON](./winners.json)');
  lines.push('- [Report JSON](./report.json)');
  lines.push('');
  lines.push('## Bracket Breakdown');
  lines.push('');
  lines.push('| Bracket | Participants | Total Pearls | Winners |');
  lines.push('| --- | ---: | ---: | ---: |');
  for (const bracket of report.brackets) {
    lines.push(
      `| ${bracket.name} | ${bracket.totalParticipants} | ${formatPearls(
        bracket.totalPearls
      )} | ${bracket.winnersSelected} |`
    );
  }

  if (report.winners.length > 0) {
    lines.push('');
    lines.push('## Winners');
    lines.push('');
    lines.push('| # | Address | Rank | Bracket | Pearls | Probability (%) |');
    lines.push('| ---: | --- | ---: | --- | ---: | ---: |');
    report.winners.forEach((winner, index) => {
      lines.push(
        `| ${index + 1} | ${winner.address} | ${winner.rank} | ${winner.bracket} | ${formatPearls(
          winner.pearls
        )} | ${winner.probability.toFixed(6)} |`
      );
    });
  }

  lines.push('');
  return lines.join('\n');
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Error: Epoch ID is required');
    console.log('Usage: pnpm export-report <epochId>');
    console.log('Example: pnpm export-report 1');
    process.exit(1);
  }

  const epochId = parseInt(args[0], 10);

  if (isNaN(epochId) || epochId < 0) {
    console.error('❌ Error: Invalid epoch ID. Must be a positive number.');
    process.exit(1);
  }

  console.log('📊 Neverland Leaderboard Report Generation');
  console.log('==========================================\n');
  console.log(`📅 Epoch ID: ${epochId}\n`);

  try {
    const report = await generateReport(epochId);

    const tideDir = path.join(process.cwd(), 'tides', String(epochId));
    await fs.mkdir(tideDir, { recursive: true });
    const reportPath = path.join(tideDir, 'report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    const reportMarkdownPath = path.join(tideDir, 'report.md');
    const reportMarkdown = buildMarkdownReport(epochId, report);
    await fs.writeFile(reportMarkdownPath, reportMarkdown, 'utf-8');

    const winnersTextPath = path.join(tideDir, 'winners.txt');
    const winnersText = report.winners.map(winner => winner.address).join('\n') + '\n';
    await fs.writeFile(winnersTextPath, winnersText, 'utf-8');

    console.log(`\n💾 Report saved to: ${reportPath}\n`);
    console.log(`📝 Report markdown saved to: ${reportMarkdownPath}\n`);
    console.log(`📄 Winners text saved to: ${winnersTextPath}\n`);

    console.log('📈 Report Summary:');
    console.log(`   Total Participants: ${report.totalParticipants}`);
    console.log(`   Total Winners: ${report.totalWinners}`);
    console.log('\n📊 Bracket Breakdown:');

    for (const bracket of report.brackets) {
      const pearlsInEther = Number(BigInt(bracket.totalPearls)) / 1e18;
      console.log(`\n   ${bracket.name}:`);
      console.log(`      Participants: ${bracket.totalParticipants}`);
      console.log(`      Total Pearls: ${pearlsInEther.toFixed(2)}`);
      console.log(`      Winners: ${bracket.winnersSelected}`);
    }

    console.log('\n✅ Report generation complete!\n');
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
