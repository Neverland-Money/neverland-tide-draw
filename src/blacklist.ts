import fs from 'fs/promises';

export async function loadBlacklist(path?: string): Promise<Set<string>> {
  if (!path) {
    return new Set();
  }

  const content = await fs.readFile(path, 'utf-8');
  const trimmed = content.trim();

  if (!trimmed) {
    return new Set();
  }

  let addresses: string[] = [];

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      addresses = parsed;
    } else if (parsed && Array.isArray(parsed.addresses)) {
      addresses = parsed.addresses;
    } else {
      throw new Error('Unsupported JSON format');
    }
  } catch {
    addresses = trimmed
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);
  }

  return new Set(addresses.map(address => address.toLowerCase()));
}
