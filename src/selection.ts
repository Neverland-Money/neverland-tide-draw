import type { LeaderboardEntry, Bracket, Winner } from './types.js';
import { generateSecureRandomBigInt } from './random.js';
import type { RandomSource } from './random.js';

export function calculateProbabilityPercent(pearls: bigint, totalPearls: bigint): number {
  if (totalPearls === 0n) {
    return 0;
  }

  const scaled = (pearls * 100n * 1_000_000n) / totalPearls;
  return Number(scaled) / 1_000_000;
}

export function selectWinnersFromBracket(
  entries: LeaderboardEntry[],
  bracket: Bracket,
  randomSource: RandomSource
): Winner[] {
  const bracketEntries = entries.filter(
    entry => entry.rank >= bracket.minRank && entry.rank <= bracket.maxRank
  );

  if (bracketEntries.length === 0) {
    console.log(`⚠️  No participants in ${bracket.name}`);
    return [];
  }

  const winnersToSelect = Math.min(bracket.winnerCount, bracketEntries.length);
  const winners: Winner[] = [];
  const remainingEntries = [...bracketEntries];

  console.log(`\n📊 ${bracket.name}`);
  console.log(`   Participants: ${bracketEntries.length}`);
  console.log(`   Winners to select: ${winnersToSelect}`);

  for (let i = 0; i < winnersToSelect; i++) {
    const totalPearls = remainingEntries.reduce((sum, entry) => sum + BigInt(entry.pearls), 0n);

    if (totalPearls === 0n) {
      console.log(`⚠️  No remaining pearls in bracket, stopping selection`);
      break;
    }

    const randomValue = generateSecureRandomBigInt(totalPearls, randomSource);
    let accumulatedWeight = 0n;
    let selectedIndex = -1;

    for (let j = 0; j < remainingEntries.length; j++) {
      accumulatedWeight += BigInt(remainingEntries[j].pearls);
      if (randomValue < accumulatedWeight) {
        selectedIndex = j;
        break;
      }
    }

    /* c8 ignore next 3 */
    if (selectedIndex === -1) {
      selectedIndex = remainingEntries.length - 1;
    }

    const selected = remainingEntries[selectedIndex];
    const probability = calculateProbabilityPercent(BigInt(selected.pearls), totalPearls);

    winners.push({
      address: selected.address,
      pearls: selected.pearls,
      rank: selected.rank,
      bracket: bracket.name,
      probability,
    });

    console.log(`   ✓ Winner ${i + 1}: Rank ${selected.rank} (${probability.toFixed(4)}% chance)`);

    remainingEntries.splice(selectedIndex, 1);
  }

  return winners;
}

export function selectAllWinners(
  entries: LeaderboardEntry[],
  brackets: Bracket[],
  randomSource: RandomSource
): Winner[] {
  console.log(`\n🎯 Starting winner selection...`);
  console.log(`Total eligible participants: ${entries.length}\n`);

  const allWinners: Winner[] = [];

  for (const bracket of brackets) {
    const winners = selectWinnersFromBracket(entries, bracket, randomSource);
    allWinners.push(...winners);
  }

  console.log(`\n✅ Total winners selected: ${allWinners.length}\n`);

  return allWinners;
}
