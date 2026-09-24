import type { ReasonCode } from '@budgetbrain/detection-core';

const OTP_PATTERNS = [
  /\botp\b/i,
  /one\s*time\s*password/i,
  /verification\s*code/i,
  /security\s*code/i,
  /secret\s*code/i,
  /do\s*not\s*share/i,
  /valid\s*for\s*\d+\s*mins?/i,
];

const PROMOTIONAL_PATTERNS = [
  /pre-?approved/i,
  /apply\s*now/i,
  /congratulations/i,
  /discount\s*code/i,
  /limited\s*period\s*offer/i,
  /cashback\s*offer/i,
  /voucher/i,
  /click\s*here\s*to/i,
  /upgrade\s*your\s*card/i,
  /flat\s*\d+%\s*off/i,
];

const NON_TRANSACTION_BANK_PATTERNS = [
  /login\s*alert/i,
  /logged\s*in/i,
  /password\s*changed/i,
  /profile\s*updated/i,
  /statement\s*for/i,
  /e-?statement/i,
  /kyc\s*update/i,
  /card\s*dispatched/i,
  /cheque\s*book\s*request/i,
];

/**
 * Why a message is not eligible for the pipeline, or null when it is (spec §5).
 * Conservative: OTPs, promos and account notices are rejected before any parsing.
 */
export function eligibilityReason(content: string): ReasonCode | null {
  if (!content || typeof content !== 'string') return 'no_money_token';
  // OTP messages must never enter the pipeline.
  if (OTP_PATTERNS.some((p) => p.test(content))) return 'otp_marker';
  if (PROMOTIONAL_PATTERNS.some((p) => p.test(content))) return 'promo_marker';
  if (NON_TRANSACTION_BANK_PATTERNS.some((p) => p.test(content))) return 'non_transaction_notice';
  // Must contain a currency token and movement wording. An unknown sender stays eligible, but
  // its payload is marked unverified so it can only reach review.
  if (!/(?:Rs\.?|INR|₹|\$|EUR|USD)/i.test(content)) return 'no_money_token';
  if (!/(?:debited|credited|spent|paid|withdrawn|received|deposited|sent|refund)/i.test(content)) {
    return 'no_movement_wording';
  }
  return null;
}

/** Whether a message is eligible for the financial transaction pipeline. */
export function isMessageEligible(_sender: string, content: string): boolean {
  return eligibilityReason(content) === null;
}
