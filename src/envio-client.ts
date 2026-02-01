import { GraphQLClient } from 'graphql-request';
import { config } from './config.js';

const client = new GraphQLClient(config.hasuraEndpoint, {
  headers: {
    'x-hasura-admin-secret': config.hasuraAdminSecret,
  },
});

const LEADERBOARD_QUERY = `
  query LeaderboardPage(
    $epoch: numeric!
    $blacklist: [String!]
    $limit: Int!
    $offset: Int!
  ) {
    UserEpochStats(
      where: { epochNumber: { _eq: $epoch }, user_id: { _nin: $blacklist } }
      limit: $limit
      offset: $offset
    ) {
      user_id
      depositPointsWithMultiplier
      borrowPointsWithMultiplier
      lpPointsWithMultiplier
      vpPointsWithMultiplier
      totalPointsWithMultiplier
      lastAppliedMultiplierBps
      testnetBonusBps
    }
  }
`;

export interface UserEpochStat {
  user_id: string;
  depositPointsWithMultiplier: string;
  borrowPointsWithMultiplier: string;
  lpPointsWithMultiplier: string;
  vpPointsWithMultiplier: string;
  totalPointsWithMultiplier: string;
  lastAppliedMultiplierBps: number;
  testnetBonusBps: number;
}

export interface RankedUserEpochStat extends UserEpochStat {
  rank: number;
}

export async function fetchLeaderboardPage(
  epoch: number,
  blacklist: string[],
  limit: number,
  offset: number
): Promise<UserEpochStat[]> {
  const data = await client.request<{
    UserEpochStats: UserEpochStat[];
  }>(LEADERBOARD_QUERY, {
    epoch,
    blacklist,
    limit,
    offset,
  });

  return data.UserEpochStats;
}

export async function fetchCompleteLeaderboard(
  epoch: number,
  blacklist: string[] = []
): Promise<RankedUserEpochStat[]> {
  const batchSize = 1000;
  let offset = 0;
  const allEntries: UserEpochStat[] = [];

  console.log(`📡 Fetching ALL users for epoch ${epoch} (unsorted)...`);
  console.log(`   Will sort and rank after fetching complete dataset\n`);

  while (true) {
    console.log(`   Fetching batch at offset ${offset}...`);

    const batch = await fetchLeaderboardPage(epoch, blacklist, batchSize, offset);

    allEntries.push(...batch);
    console.log(`   ✓ Retrieved ${batch.length} entries (total: ${allEntries.length})`);

    if (batch.length < batchSize) {
      console.log(`   ✅ Reached end of leaderboard (last batch: ${batch.length})`);
      break;
    }

    offset += batchSize;
  }

  console.log(`\n📊 Fetch complete: ${allEntries.length} total entries`);
  console.log(`\n🔄 Sorting all entries by totalPointsWithMultiplier (descending)...`);

  allEntries.sort((a, b) => {
    const aPoints = BigInt(a.totalPointsWithMultiplier);
    const bPoints = BigInt(b.totalPointsWithMultiplier);

    if (aPoints > bPoints) return -1;
    if (aPoints < bPoints) return 1;

    const aTotalPoints =
      BigInt(a.depositPointsWithMultiplier || '0') +
      BigInt(a.borrowPointsWithMultiplier || '0') +
      BigInt(a.lpPointsWithMultiplier || '0') +
      BigInt(a.vpPointsWithMultiplier || '0');
    const bTotalPoints =
      BigInt(b.depositPointsWithMultiplier || '0') +
      BigInt(b.borrowPointsWithMultiplier || '0') +
      BigInt(b.lpPointsWithMultiplier || '0') +
      BigInt(b.vpPointsWithMultiplier || '0');

    if (aTotalPoints > bTotalPoints) return -1;
    if (aTotalPoints < bTotalPoints) return 1;

    const aId = a.user_id.toLowerCase();
    const bId = b.user_id.toLowerCase();
    if (aId < bId) return -1;
    if (aId > bId) return 1;

    return 0;
  });

  console.log(`   ✅ Sorting complete\n`);

  console.log(`🏅 Assigning ranks (1-${allEntries.length})...`);

  const rankedEntries: RankedUserEpochStat[] = allEntries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));

  console.log(`   ✅ Ranking complete: ${rankedEntries.length} users ranked\n`);

  return rankedEntries;
}
