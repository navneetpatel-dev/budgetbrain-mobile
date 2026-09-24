/**
 * Known Indian Bank Sender Prefixes and Keywords.
 * SMS sender IDs in India follow the TRAI format: XX-HDFCBK, VM-ICICIB, BZ-SBIINB, etc.
 */
export const FINANCIAL_SENDER_PATTERNS = [
  /HDFC/i,
  /ICICI/i,
  /SBI/i,
  /AXIS/i,
  /KOTAK/i,
  /PNB/i,
  /BOB/i,
  /INDUS/i,
  /YESB/i,
  /CANARA/i,
  /UNIONB/i,
  /IDFC/i,
  /RBL/i,
  /PAYTM/i,
  /PHONEPE/i,
  /GPAY/i,
  /AMEX/i,
  /SCBL/i,
  /CITI/i,
  /FEDERAL/i,
  /JUPITER/i,
  /SLICE/i,
  /FI/i,
];

/**
 * Exact SMS headers of banks this app version recognizes, mapped to knowledge-pack institution
 * ids. Only these count as a verified institution for confidence scoring; everything else waits
 * for review. Replaced by the downloadable knowledge pack in Phase 4 (plan T4.5).
 */
const INSTITUTION_BY_SMS_HEADER: Readonly<Record<string, string>> = {
  HDFCBK: 'in.hdfc_bank',
  ICICIB: 'in.icici_bank',
  SBIINB: 'in.state_bank_of_india',
  SBIPSG: 'in.state_bank_of_india',
  CBSSBI: 'in.state_bank_of_india',
  AXISBK: 'in.axis_bank',
  KOTAKB: 'in.kotak_mahindra_bank',
  PAYTMB: 'in.paytm_payments_bank',
};

/** India DLT senders look like `VM-HDFCBK` or `AD-HDFCBK-S`; the 6-character header identifies the bank. */
export function resolveInstitutionId(sender: string): string | null {
  const parts = sender.trim().toUpperCase().split('-');
  const header = parts.length >= 2 && /^[A-Z]{2}$/.test(parts[0]) ? parts[1] : parts[0];
  return (header && INSTITUTION_BY_SMS_HEADER[header]) ?? null;
}

export function isFinancialSender(sender: string): boolean {
  if (!sender) return false;
  return FINANCIAL_SENDER_PATTERNS.some((pattern) => pattern.test(sender));
}
