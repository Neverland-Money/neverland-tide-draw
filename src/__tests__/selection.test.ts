import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateProbabilityPercent,
  selectAllWinners,
  selectWinnersFromBracket,
} from '../selection.js';

const zeroRandomSource = {
  nextBytes: (length: number) => Buffer.alloc(length),
};

test('selectWinnersFromBracket returns empty when no entries match', () => {
  const entries = [{ address: '0x1', pearls: '10', rank: 1, isBlacklisted: false }];
  const bracket = { name: 'Ranks 10-20', minRank: 10, maxRank: 20, winnerCount: 1 };

  const winners = selectWinnersFromBracket(entries, bracket, zeroRandomSource);
  assert.equal(winners.length, 0);
});

test('selectWinnersFromBracket stops when total pearls are zero', () => {
  const entries = [{ address: '0x1', pearls: '0', rank: 1, isBlacklisted: false }];
  const bracket = { name: 'Ranks 1-5', minRank: 1, maxRank: 5, winnerCount: 1 };

  const winners = selectWinnersFromBracket(entries, bracket, zeroRandomSource);
  assert.equal(winners.length, 0);
});

test('selectWinnersFromBracket selects winners without replacement', () => {
  const entries = [
    { address: '0x1', pearls: '10', rank: 1, isBlacklisted: false },
    { address: '0x2', pearls: '20', rank: 2, isBlacklisted: false },
    { address: '0x3', pearls: '30', rank: 3, isBlacklisted: false },
  ];
  const bracket = { name: 'Ranks 1-3', minRank: 1, maxRank: 3, winnerCount: 2 };

  const winners = selectWinnersFromBracket(entries, bracket, zeroRandomSource);
  assert.equal(winners.length, 2);
  assert.equal(winners[0].address, '0x1');
  assert.equal(winners[1].address, '0x2');
  assert.equal(winners[0].bracket, 'Ranks 1-3');
  assert.equal(winners[0].rank, 1);
  assert.ok(Math.abs(winners[0].probability - 16.666666) < 1e-6);
});

test('selectAllWinners aggregates winners across brackets', () => {
  const entries = [
    { address: '0x1', pearls: '10', rank: 1, isBlacklisted: false },
    { address: '0x2', pearls: '20', rank: 2, isBlacklisted: false },
    { address: '0x3', pearls: '30', rank: 3, isBlacklisted: false },
    { address: '0x4', pearls: '40', rank: 4, isBlacklisted: false },
  ];
  const brackets = [
    { name: 'Ranks 1-2', minRank: 1, maxRank: 2, winnerCount: 1 },
    { name: 'Ranks 3-4', minRank: 3, maxRank: 4, winnerCount: 1 },
  ];

  const winners = selectAllWinners(entries, brackets, zeroRandomSource);
  assert.equal(winners.length, 2);
  assert.equal(winners[0].bracket, 'Ranks 1-2');
  assert.equal(winners[1].bracket, 'Ranks 3-4');
});

test('calculateProbabilityPercent returns 0 when total pearls is zero', () => {
  const probability = calculateProbabilityPercent(10n, 0n);
  assert.equal(probability, 0);
});
