/**
 * Pure TypeScript SHA-256 Implementation.
 * Ensures synchronous, sub-millisecond fingerprint hashing in React Native / Expo Headless tasks
 * without native async bridge overhead.
 */
function sha256(ascii: string): string {
  function rightRotate(value: number, amount: number): number {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i = 0,
    j = 0;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab,
    0x5be0cd19,
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4,
    0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe,
    0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f,
    0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc,
    0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116,
    0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
    0xc67178f2,
  ];

  let primeCounter = 0;
  for (let candidate = 2; primeCounter < 64; candidate++) {
    let isPrime = true;
    for (let factor = 2; factor * factor <= candidate; factor++) {
      if (candidate % factor === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) {
      primeCounter++;
    }
  }

  ascii += '\x80';
  while ((ascii.length % 64) - 56) ascii += '\x00';
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  for (j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const i2 = i + j;
      const w15 = w[i - 15],
        w2 = w[i - 2];

      const a = hash[0],
        e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);
      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

export function computeClientFingerprint(
  userId: string,
  amount: number,
  currency: string,
  direction: string,
  transactionType: string,
  normalizedMerchant: string | null,
  accountTail: string | null,
  referenceOrDate: string
): string {
  const normMerchant = (normalizedMerchant || 'unknown').trim().toLowerCase();
  const accTail = (accountTail || 'none').trim();
  const refOrDt = referenceOrDate.trim();
  const curr = (currency || 'INR').trim().toUpperCase();
  const amt = Number(amount).toFixed(2);

  const rawSeed = `${userId}:${amt}:${curr}:${direction}:${transactionType}:${normMerchant}:${accTail}:${refOrDt}`;
  return sha256(rawSeed);
}

export interface ExistingTransactionSummary {
  amount: number;
  date: string;
  type: string;
}

/**
 * Fuzzy duplicate matcher against existing manually logged transactions:
 * Matches if same amount, same type, and date is within ±24 hours.
 */
export function isFuzzyManualDuplicate(
  detectedAmount: number,
  detectedDate: string,
  detectedType: string,
  existingTransactions: ExistingTransactionSummary[]
): boolean {
  const dt = new Date(detectedDate).getTime();
  const toleranceMs = 24 * 60 * 60 * 1000; // ±24 hours

  return existingTransactions.some((tx) => {
    if (Math.abs(tx.amount - detectedAmount) > 0.01) return false;
    if (tx.type !== detectedType) return false;

    const existingTime = new Date(tx.date).getTime();
    return Math.abs(dt - existingTime) <= toleranceMs;
  });
}
