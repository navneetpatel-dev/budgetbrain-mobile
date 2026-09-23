import { KNOWN_MERCHANTS } from '../constants/merchantCatalog';

export interface NormalizedMerchantResult {
  rawMerchant: string | null;
  normalizedMerchant: string | null;
  categoryHint: string | null;
}

export function resolveMerchant(rawCandidate: string | null): NormalizedMerchantResult {
  if (!rawCandidate) {
    return {
      rawMerchant: null,
      normalizedMerchant: null,
      categoryHint: null,
    };
  }

  let cleaned = rawCandidate.trim();

  // Strip VPA handles: e.g. "swiggy@icici" -> "swiggy"
  if (cleaned.includes('@')) {
    cleaned = cleaned.split('@')[0].trim();
  }

  // Strip corporate suffixes (e.g. "Pvt Ltd", "Limited", "Retail")
  cleaned = cleaned
    .replace(/\b(?:pvt|ltd|limited|services|technologies|corp|inc|retail)\b/gi, '')
    .trim();

  // Match against known catalog
  for (const entry of KNOWN_MERCHANTS) {
    if (entry.aliases.some((alias) => alias.test(cleaned))) {
      return {
        rawMerchant: rawCandidate,
        normalizedMerchant: entry.canonicalName,
        categoryHint: entry.categoryHint,
      };
    }
  }

  // Capitalize words if unknown
  const formatted = cleaned
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return {
    rawMerchant: rawCandidate,
    normalizedMerchant: formatted || rawCandidate,
    categoryHint: null,
  };
}
