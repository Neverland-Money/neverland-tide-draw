import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRandomSource, generateSecureRandomBigInt, generateSeed } from '../random.js';

test('generateSeed returns 64 hex characters', () => {
  const seed = generateSeed();
  assert.equal(seed.length, 64);
  assert.match(seed, /^[0-9a-f]+$/);
});

test('createRandomSource without seed returns bytes of requested length', () => {
  const source = createRandomSource();
  const bytes = source.nextBytes(16);
  assert.equal(bytes.length, 16);
});

test('createRandomSource with seed is deterministic across instances', () => {
  const seed = 'a1'.repeat(32);
  const sourceA = createRandomSource(seed);
  const sourceB = createRandomSource(seed);

  const firstA = sourceA.nextBytes(32);
  const firstB = sourceB.nextBytes(32);
  assert.deepEqual(firstA, firstB);

  const secondA = sourceA.nextBytes(32);
  const secondB = sourceB.nextBytes(32);
  assert.deepEqual(secondA, secondB);
});

test('createRandomSource accepts 0x-prefixed seeds', () => {
  const seed = `0x${'d4'.repeat(32)}`;
  const source = createRandomSource(seed);
  const bytes = source.nextBytes(8);
  assert.equal(bytes.length, 8);
});

test('createRandomSource handles empty byte request', () => {
  const seed = 'b2'.repeat(32);
  const source = createRandomSource(seed);
  const bytes = source.nextBytes(0);
  assert.equal(bytes.length, 0);
});

test('createRandomSource returns partial digest slices for short requests', () => {
  const seed = 'c3'.repeat(32);
  const source = createRandomSource(seed);
  const bytes = source.nextBytes(20);
  assert.equal(bytes.length, 20);
});

test('createRandomSource rejects invalid seeds', () => {
  assert.throws(() => createRandomSource('abc'), /Seed must/);
  assert.throws(() => createRandomSource('zz'), /Seed must/);
});

test('generateSecureRandomBigInt throws on non-positive max', () => {
  const source = createRandomSource();
  assert.throws(() => generateSecureRandomBigInt(0n, source), /Max must be greater than 0/);
});

test('generateSecureRandomBigInt retries until value is below max', () => {
  const sequence = [Buffer.from([0xff]), Buffer.from([0x05])];
  const source = {
    nextBytes: () => sequence.shift() ?? Buffer.from([0x00]),
  };

  const result = generateSecureRandomBigInt(10n, source);
  assert.equal(result, 5n);
  assert.equal(sequence.length, 0);
});
