# Neverland Tide Draw

CLI tooling to fetch leaderboard data and select Tide winners using a bracketed, weighted random process. It is designed to be auditable and reproducible: a published seed plus the saved leaderboard file must allow anyone to re-run the selection and get identical winners.

## Purpose

- Provide a transparent, deterministic methodology for selecting Tide winners.
- Keep the selection logic separate from the indexer, so results can be verified independently.
- Produce machine-readable outputs for publication and analysis.

## How It Works (Methodology)

1. Fetch and rank leaderboard entries for an epoch:
   - Pulls all entries from the indexer in batches.
   - Sorts by `totalPointsWithMultiplier` (descending), with a stable tie-breaker by address.
   - Writes `tides/{epoch}/leaderboard.json`, including both display points and raw 18-decimal values.
2. Build the eligible pool:
   - Reads the saved leaderboard file.
   - Excludes blacklisted addresses (optional input file).
   - Excludes entries with zero Pearls.
   - Uses 18-decimal raw totals for selection weights when available.
3. Split into rank brackets:
   - Ranks 1–100: 50 winners
   - Ranks 101–200: 25 winners
   - Ranks 201–300: 15 winners
   - Ranks 301+: 10 winners
4. Run weighted random draws per bracket (no replacement):
   - For each winner slot, draw one winner.
   - A wallet's chance in a draw is:
     `Pearls / Total Remaining Pearls in that bracket`
   - After a wallet wins, it is removed from that bracket for subsequent draws.
5. Write results:
   - Outputs `tides/{epochId}/winners.json` including the seed and per-draw probability for each winner.

## Reproducibility

- If you run `pick-winners` with `--seed <hex>`, the draw is fully deterministic.
- If you do not pass a seed, one is generated and stored in the output file.
- Publish both the seed and the exact `tides/{epoch}/leaderboard.json` used for selection so anyone can reproduce the results.

## Eligibility Rules

- Only addresses with **non-zero** Pearls are eligible.
- Blacklisted addresses can be excluded via a supplied blacklist file.
- Eligibility is evaluated at the time of selection using the saved leaderboard file.

## Inputs and Outputs

### Leaderboard file (`tides/{epoch}/leaderboard.json`)
Written by `fetch-leaderboard`.
- Includes ranks and display points with 2 decimals.
- Also preserves raw 18-decimal values for accurate weighting.

Example fields:
```json
{
  "totalPointsWithMultiplier": "21010489.03",
  "totalPointsWithMultiplierRaw": "21010489030000000000000000"
}
```

### Winners file (`tides/{epochId}/winners.json`)
Written by `pick-winners`.
```json
{
  "epochId": 1,
  "timestamp": "2026-02-01T11:51:00.000Z",
  "seed": "random-seed-hex",
  "totalParticipants": 500,
  "totalWinners": 100,
  "winners": [
    {
      "address": "0x...",
      "rank": 5,
      "pearls": "1234567890123456789012",
      "bracket": "Ranks 1-100",
      "probability": 5.234
    }
  ]
}
```

### Report file (`tides/{epochId}/report.json`)
Written by `export-report`.
- Summarizes participants, total Pearls, and winners per bracket.

## Usage

### Setup

1. Create `.env`:
```bash
cp .env.example .env
```

2. Configure Hasura credentials:
```env
INDEXER_ENDPOINT=https://index.neverland.money/v1/graphql
HASURA_ADMIN_SECRET=your-actual-admin-secret
```
If you run the indexer locally, you don't need to set up Hasura credentials, as the indexer will use the local Hasura instance.
See [neverland-hyperindex/README.md](https://github.com/Neverland-Money/neverland-hyperindex/blob/main/README.md) for more details.

3. Install dependencies:
```bash
pnpm install
```

### Fetch Leaderboard

```bash
pnpm fetch-leaderboard <epoch> [--blacklist <path>]
```

Blacklist input can be provided via `--blacklist` or `BLACKLIST_PATH` and supports:
- JSON array: `["0x...", "0x..."]`
- JSON object: `{ "addresses": ["0x..."] }`
- Newline-delimited addresses

### Pick Winners

```bash
pnpm pick-winners <epochId> [--seed <hex>] [--blacklist <path>]
```

Reproducible run with a published seed:
```bash
pnpm pick-winners 1 --seed <seed-hex>
```

### Export Report

```bash
pnpm export-report <epochId>
```

## Configuration

Edit `src/config.ts` to change:
- Bracket ranges and winner counts
- Pearls decimals
- Hasura endpoint and admin secret

## Testing and Coverage

The core selection logic has deterministic unit tests.

```bash
pnpm test
pnpm test:coverage
```

Coverage is scoped to the core algorithm modules:
- `src/blacklist.ts`
- `src/random.ts`
- `src/selection.ts`

## Notes

- Pearls are stored with 18-decimal precision (like ETH wei).
- Probabilities are per draw, not guarantees.
- Selection is fair by process, not by outcome; winners are random but weighted.
