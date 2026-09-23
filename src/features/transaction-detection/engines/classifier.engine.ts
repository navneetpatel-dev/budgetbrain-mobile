import type {
  DetectedTransactionDirection,
  DetectedTransactionType,
} from '../types/transactionDetection.types';
import type { DetectionSignal } from './detector.engine';

export function classifyTransactionType(
  direction: DetectedTransactionDirection,
  signals: Pick<DetectionSignal, 'isSelfTransfer' | 'isReversal'>,
  content: string
): DetectedTransactionType {
  // 1. Transfers: self-transfers or internal account movement
  if (signals.isSelfTransfer || /transfer\s*to\s*(?:own|self)/i.test(content)) {
    return 'transfer';
  }

  // 2. Refunds: reversals, cashbacks, or merchant refunds
  if (signals.isReversal || /refund|cashback|reversal/i.test(content)) {
    return 'refund';
  }

  // 3. Direction-based classification
  if (direction === 'DEBIT') {
    return 'expense';
  }

  // 4. Credits default to income
  return 'income';
}
