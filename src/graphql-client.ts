import { GraphQLClient } from 'graphql-request';
import { config } from './config.js';
import type { LeaderboardEntry } from './types.js';

const client = new GraphQLClient(config.hasuraEndpoint, {
  headers: {
    'x-hasura-admin-secret': config.hasuraAdminSecret,
  },
});

const GET_LEADERBOARD_QUERY = `
  query GetLeaderboard($epochId: Int!) {
    leaderboard_entries(
      where: {
        epoch_id: { _eq: $epochId }
        pearls: { _gt: "0" }
        is_blacklisted: { _eq: false }
      }
      order_by: [{ pearls: desc }, { address: asc }]
    ) {
      address
      pearls
      is_blacklisted
    }
  }
`;

export async function getLeaderboard(epochId: number): Promise<LeaderboardEntry[]> {
  const data = await client.request<{
    leaderboard_entries: Array<{
      address: string;
      pearls: string;
      is_blacklisted: boolean;
    }>;
  }>(GET_LEADERBOARD_QUERY, { epochId });

  return data.leaderboard_entries
    .filter(entry => !entry.is_blacklisted && BigInt(entry.pearls) > 0n)
    .map((entry, index) => ({
      address: entry.address,
      pearls: entry.pearls,
      rank: index + 1,
      isBlacklisted: entry.is_blacklisted,
    }));
}
