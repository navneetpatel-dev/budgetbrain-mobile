export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.80,    // Auto-approve and add to local transactions
  MEDIUM: 0.50,  // Add to Pending Review list
} as const;

export const DETECTION_STATUS = {
  AUTO_APPROVED: 'auto_approved',
  PENDING_REVIEW: 'pending_review',
  USER_CONFIRMED: 'user_confirmed',
  REJECTED: 'rejected',
  DUPLICATE: 'duplicate',
} as const;

export const TRANSACTION_DIRECTION = {
  DEBIT: 'DEBIT',
  CREDIT: 'CREDIT',
} as const;

export const TRANSACTION_TYPE = {
  EXPENSE: 'expense',
  INCOME: 'income',
  REFUND: 'refund',
  TRANSFER: 'transfer',
} as const;

export const PERMISSION_STATUS = {
  GRANTED: 'granted',
  DENIED: 'denied',
  BLOCKED: 'blocked',
  NOT_REQUESTED: 'not_requested',
} as const;

export const HISTORICAL_SCAN_RANGES = [
  { label: 'Last 30 Days (Recommended)', days: 30 },
  { label: 'Last 60 Days', days: 60 },
  { label: 'Last 90 Days', days: 90 },
] as const;
