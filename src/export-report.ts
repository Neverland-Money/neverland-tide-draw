import { getLeaderboard } from './graphql-client.js';
import { config } from './config.js';
import type { WinnerReport, BracketReport } from './types.js';
import fs from 'fs/promises';
import path from 'path';

async function generateReport(epochId: number): Promise<WinnerReport> {
  console.log('📡 Fetching leaderboard data...');
  const leaderboard = await getLeaderboard(epochId);

  const tideDir = path.join(process.cwd(), 'tides', String(epochId));
  const winnersPath = path.join(tideDir, 'winners.json');
  let winners = [];

  try {
    const winnersData = await fs.readFile(winnersPath, 'utf-8');
    const parsed = JSON.parse(winnersData);
    winners = parsed.winners || [];
    console.log(`✅ Loaded ${winners.length} winners from ${winnersPath}`);
  } catch (error) {
    console.log(`⚠️  No winners file found. Generating report without winners.`);
  }

  const bracketReports: BracketReport[] = config.brackets.map(bracket => {
    const participants = leaderboard.filter(
      entry => entry.rank >= bracket.minRank && entry.rank <= bracket.maxRank
    );

    const totalPearls = participants.reduce((sum, entry) => sum + BigInt(entry.pearls), 0n);

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

    console.log(`\n💾 Report saved to: ${reportPath}\n`);

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
