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

export function isFinancialSender(sender: string): boolean {
  if (!sender) return false;
  return FINANCIAL_SENDER_PATTERNS.some((pattern) => pattern.test(sender));
}
