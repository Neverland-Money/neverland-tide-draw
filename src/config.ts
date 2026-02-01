import { config as loadEnv } from 'dotenv';

loadEnv();

const hasuraEndpoint = process.env.INDEXER_ENDPOINT;
const hasuraAdminSecret = process.env.HASURA_ADMIN_SECRET;

if (!hasuraEndpoint || !hasuraAdminSecret) {
  throw new Error(
    'Missing required environment variables: INDEXER_ENDPOINT and HASURA_ADMIN_SECRET'
  );
}

export const config = {
  hasuraEndpoint,
  hasuraAdminSecret,
  brackets: [
    { name: 'Ranks 1-100', minRank: 1, maxRank: 100, winnerCount: 50 },
    { name: 'Ranks 101-200', minRank: 101, maxRank: 200, winnerCount: 25 },
    { name: 'Ranks 201-300', minRank: 201, maxRank: 300, winnerCount: 15 },
    { name: 'Ranks 301+', minRank: 301, maxRank: Infinity, winnerCount: 10 },
  ],
  pearlDecimals: 18,
};
