import { CONFIDENCE_THRESHOLDS } from '../constants/transactionDetection.constants';
import { isFinancialSender } from '../constants/institutionKeywords';

export interface ConfidenceEvaluation {
  score: number;
  tier: 'high' | 'medium' | 'low';
  factors: {
    isFinancialSender: boolean;
    hasAmount: boolean;
    hasClearMovement: boolean;
    hasIdentifiedMerchantOrRef: boolean;
    hasValidDate: boolean;
  };
}

export function evaluateConfidence(
  sender: string,
  amount: number | null,
  direction: string | null,
  merchant: string | null,
  reference: string | null,
  transactionDate: string | null
): ConfidenceEvaluation {
  let score = 0;

  const senderIsFinancial = isFinancialSender(sender);
  if (senderIsFinancial) score += 0.25;

  const hasAmount = typeof amount === 'number' && !isNaN(amount) && amount > 0;
  if (hasAmount) score += 0.25;

  const hasClearMovement = Boolean(direction);
  if (hasClearMovement) score += 0.25;

  const hasIdentifiedMerchantOrRef = Boolean(merchant || reference);
  if (hasIdentifiedMerchantOrRef) score += 0.15;

  const hasValidDate = Boolean(transactionDate && !isNaN(new Date(transactionDate).getTime()));
  if (hasValidDate) score += 0.10;

  score = Math.min(1.0, Math.round(score * 100) / 100);

  let tier: 'high' | 'medium' | 'low' = 'low';
  if (score >= CONFIDENCE_THRESHOLDS.HIGH) {
    tier = 'high';
  } else if (score >= CONFIDENCE_THRESHOLDS.MEDIUM) {
    tier = 'medium';
  }

  return {
    score,
    tier,
    factors: {
      isFinancialSender: senderIsFinancial,
      hasAmount,
      hasClearMovement,
      hasIdentifiedMerchantOrRef,
      hasValidDate,
    },
  };
}
