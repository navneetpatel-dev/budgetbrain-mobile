import { isFinancialSender } from '../constants/institutionKeywords';

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
 * Determines whether a message is eligible for the financial transaction pipeline.
 * Rule (Section 5): Conservative filtering. OTPs, promos, and security alerts are immediately rejected.
 */
export function isMessageEligible(sender: string, content: string): boolean {
  if (!content || typeof content !== 'string') return false;

  // 1. Hard Reject: OTP messages must NEVER enter the pipeline
  if (OTP_PATTERNS.some((p) => p.test(content))) {
    return false;
  }

  // 2. Reject pure promotional and marketing spam
  if (PROMOTIONAL_PATTERNS.some((p) => p.test(content))) {
    return false;
  }

  // 3. Reject non-transactional account notifications
  if (NON_TRANSACTION_BANK_PATTERNS.some((p) => p.test(content))) {
    return false;
  }

  // 4. Must contain at least one currency or financial indicator
  const hasCurrencySignal = /(?:Rs\.?|INR|₹|\$|EUR|USD)/i.test(content);
  const hasMovementSignal = /(?:debited|credited|spent|paid|withdrawn|received|deposited|sent|refund)/i.test(
    content
  );

  if (!hasCurrencySignal || !hasMovementSignal) {
    return false;
  }

  // 5. If sender is identifiable as financial, definitely eligible
  if (isFinancialSender(sender)) {
    return true;
  }

  // If sender is unknown but wording strongly suggests a financial movement with amount
  return hasCurrencySignal && hasMovementSignal;
}
