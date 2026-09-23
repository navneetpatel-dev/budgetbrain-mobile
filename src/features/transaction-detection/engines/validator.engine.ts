export interface ValidationOutcome {
  isValid: boolean;
  reason?: string;
}

export function validateProcessedTransaction(
  amount: number | null,
  currency: string,
  direction: string | null,
  transactionDate: string
): ValidationOutcome {
  if (amount === null || typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
    return { isValid: false, reason: 'Transaction amount must be a positive number' };
  }

  if (!currency || currency.length !== 3) {
    return { isValid: false, reason: 'Valid 3-letter currency code required' };
  }

  if (direction !== 'DEBIT' && direction !== 'CREDIT') {
    return { isValid: false, reason: 'Transaction direction must be DEBIT or CREDIT' };
  }

  const d = new Date(transactionDate);
  if (isNaN(d.getTime())) {
    return { isValid: false, reason: 'Invalid transaction date' };
  }

  // Check if date is in the distant future (more than 1 day ahead)
  const now = new Date();
  const maxFuture = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  if (d.getTime() > maxFuture.getTime()) {
    return { isValid: false, reason: 'Transaction date cannot be in the future' };
  }

  return { isValid: true };
}
