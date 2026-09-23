import type { DetectedTransactionDirection } from '../types/transactionDetection.types';

export interface DetectionSignal {
  isTransaction: boolean;
  direction: DetectedTransactionDirection | null;
  isFailedOrDeclined: boolean;
  isReversal: boolean;
  isSelfTransfer: boolean;
}

const DEBIT_SIGNALS = [
  /\bdebited\b/i,
  /\bdebit\b/i,
  /\bspent\b/i,
  /\bpaid\b/i,
  /\bpurchase\b/i,
  /\bwithdrawn\b/i,
  /\bsent\b/i,
  /\bpayment\b/i,
  /\btransferred\b/i,
];

const CREDIT_SIGNALS = [
  /\bcredited\b/i,
  /\bcredit\b/i,
  /\breceived\b/i,
  /\bdeposited\b/i,
  /\bsalary\b/i,
  /\brefund\b/i,
  /\bcashback\b/i,
  /\breversal\b/i,
];

const FAILURE_SIGNALS = [
  /\bdeclined\b/i,
  /\bfailed\b/i,
  /\bunsuccessful\b/i,
  /\bcancelled\b/i,
  /\bcanceled\b/i,
  /\brejected\b/i,
];

const REVERSAL_SIGNALS = [/\breversed\b/i, /\breversal\b/i, /\brefunded\b/i, /\brefund\b/i];

const SELF_TRANSFER_SIGNALS = [
  /to\s*own\s*a\/?c/i,
  /self\s*transfer/i,
  /transferred\s*to\s*self/i,
  /between\s*your\s*accounts/i,
];

export function detectFinancialMovement(content: string): DetectionSignal {
  const isFailedOrDeclined = FAILURE_SIGNALS.some((p) => p.test(content));
  const isReversal = REVERSAL_SIGNALS.some((p) => p.test(content));
  const isSelfTransfer = SELF_TRANSFER_SIGNALS.some((p) => p.test(content));

  // If transaction explicitly failed or was declined, mark failed
  if (isFailedOrDeclined && !isReversal) {
    return {
      isTransaction: false,
      direction: null,
      isFailedOrDeclined: true,
      isReversal: false,
      isSelfTransfer: false,
    };
  }

  const debitMatch = DEBIT_SIGNALS.some((p) => p.test(content));
  const creditMatch = CREDIT_SIGNALS.some((p) => p.test(content));

  let direction: DetectedTransactionDirection | null = null;
  if (debitMatch && !creditMatch) {
    direction = 'DEBIT';
  } else if (creditMatch && !debitMatch) {
    direction = 'CREDIT';
  } else if (debitMatch && creditMatch) {
    // Contextual resolution: whichever keyword appears closer to amount or has stronger active verb
    const debitIndex = content.search(/debited|spent|paid|withdrawn/i);
    const creditIndex = content.search(/credited|received|deposited/i);
    if (debitIndex !== -1 && (creditIndex === -1 || debitIndex < creditIndex)) {
      direction = 'DEBIT';
    } else {
      direction = 'CREDIT';
    }
  }

  return {
    isTransaction: direction !== null,
    direction,
    isFailedOrDeclined: false,
    isReversal,
    isSelfTransfer,
  };
}
