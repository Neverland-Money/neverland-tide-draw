import crypto from 'crypto';

export interface RandomSource {
  nextBytes: (length: number) => Buffer;
}

const defaultRandomSource: RandomSource = {
  nextBytes: (length: number) => crypto.randomBytes(length),
};

function normalizeSeed(seedHex: string): Buffer {
  const cleaned = seedHex.startsWith('0x') ? seedHex.slice(2) : seedHex;

  if (!cleaned || cleaned.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(cleaned)) {
    throw new Error('Seed must be a non-empty hex string with even length');
  }

  return Buffer.from(cleaned, 'hex');
}

export function createRandomSource(seedHex?: string): RandomSource {
  if (!seedHex) {
    return defaultRandomSource;
  }

  const seed = normalizeSeed(seedHex);
  let counter = 0n;

  return {
    nextBytes: (length: number) => {
      if (length <= 0) {
        return Buffer.alloc(0);
      }

      const chunks: Buffer[] = [];
      let remaining = length;

      while (remaining > 0) {
        const hmac = crypto.createHmac('sha256', seed);
        const counterBuffer = Buffer.alloc(8);
        counterBuffer.writeBigUInt64BE(counter);
        hmac.update(counterBuffer);
        const digest = hmac.digest();
        counter += 1n;

        if (remaining >= digest.length) {
          chunks.push(digest);
          remaining -= digest.length;
        } else {
          chunks.push(digest.subarray(0, remaining));
          remaining = 0;
        }
      }

      return Buffer.concat(chunks, length);
    },
  };
}

export function generateSecureRandomBigInt(
  max: bigint,
  randomSource: RandomSource = defaultRandomSource
): bigint {
  if (max <= 0n) {
    throw new Error('Max must be greater than 0');
  }

  const bitLength = max.toString(2).length;
  const byteLength = Math.ceil(bitLength / 8);

  let result: bigint;
  do {
    const randomBytes = randomSource.nextBytes(byteLength);
    result = BigInt('0x' + randomBytes.toString('hex'));
  } while (result >= max);

  return result;
}

export function generateSeed(): string {
  return crypto.randomBytes(32).toString('hex');
}
