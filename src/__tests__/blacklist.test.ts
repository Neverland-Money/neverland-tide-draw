import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { loadBlacklist } from '../blacklist.js';

async function writeTempFile(contents: string): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'blacklist-'));
  const filePath = path.join(dir, 'blacklist.txt');
  await fs.writeFile(filePath, contents, 'utf-8');
  return filePath;
}

test('loadBlacklist returns empty set without path', async () => {
  const result = await loadBlacklist();
  assert.equal(result.size, 0);
});

test('loadBlacklist supports JSON array', async () => {
  const filePath = await writeTempFile(JSON.stringify(['0xAbC', '0xDEF']));
  const result = await loadBlacklist(filePath);
  assert.deepEqual(Array.from(result).sort(), ['0xabc', '0xdef']);
});

test('loadBlacklist supports JSON object with addresses', async () => {
  const filePath = await writeTempFile(JSON.stringify({ addresses: ['0xAAA', '0xbbb'] }));
  const result = await loadBlacklist(filePath);
  assert.deepEqual(Array.from(result).sort(), ['0xaaa', '0xbbb']);
});

test('loadBlacklist supports newline-delimited text', async () => {
  const filePath = await writeTempFile('0xAAA\n\n0xbbb\n');
  const result = await loadBlacklist(filePath);
  assert.deepEqual(Array.from(result).sort(), ['0xaaa', '0xbbb']);
});

test('loadBlacklist handles empty files', async () => {
  const filePath = await writeTempFile('   \n');
  const result = await loadBlacklist(filePath);
  assert.equal(result.size, 0);
});

test('loadBlacklist falls back when JSON format is unsupported', async () => {
  const filePath = await writeTempFile(JSON.stringify({ foo: 'bar' }));
  const result = await loadBlacklist(filePath);
  assert.deepEqual(Array.from(result), ['{"foo":"bar"}']);
});
