import { store } from '@/shared/store';
import {
  recordFingerprint,
  incrementPendingReviewCount,
  setSyncStatus,
} from '@/shared/store/transactionDetectionSlice';
import { queueOfflineAction, isOnline } from '@/shared/services/offlineSync';
import { queryClient } from '@/shared/services/queryClient';
import { invalidateMoneyQueries } from '@/shared/services/queryInvalidation';
import { showLocalDetectionNotification } from '@/shared/services/notifications';
import { syncDetectedBatch } from '../api/detectedTransactions.api';
import type {
  ProcessedTransaction,
  RawIncomingMessage,
} from '../types/transactionDetection.types';
import { isMessageEligible } from '../engines/eligibility.engine';
import { detectFinancialMovement } from '../engines/detector.engine';
import { extractTransactionDetails } from '../engines/extractor.engine';
import { classifyTransactionType } from '../engines/classifier.engine';
import { resolveMerchant } from '../engines/merchant.engine';
import { resolveCategory } from '../engines/category.engine';
import { evaluateConfidence } from '../engines/confidence.engine';
import { computeClientFingerprint } from '../engines/duplicate.engine';
import { validateProcessedTransaction } from '../engines/validator.engine';

export async function processIncomingMessage(
  message: RawIncomingMessage,
  availableCategories: Array<{ id: string; name: string }> = []
): Promise<ProcessedTransaction | null> {
  const state = store.getState();
  const detectionState = state.transactionDetection;
  const user = state.auth.user;
  const userId = user?.id || 'local-user';

  // 1. Feature flag / Opt-in check
  if (!detectionState.isAutoTrackingEnabled) {
    return null;
  }

  // 2. SIM slot filter check
  if (detectionState.selectedSimSlot !== 'all' && message.simSlot !== undefined) {
    if (String(message.simSlot) !== detectionState.selectedSimSlot) {
      return null;
    }
  }

  // 3. Message Eligibility Filter (Section 5)
  if (!isMessageEligible(message.sender, message.content)) {
    return null;
  }

  // 4. Financial Movement Detection (Section 6, 7)
  const signals = detectFinancialMovement(message.content);
  if (!signals.isTransaction || !signals.direction) {
    return null;
  }

  // 5. Information Extraction (Section 13, 14)
  const extracted = extractTransactionDetails(message.content, message.receivedAt);
  if (!extracted.amount) {
    return null;
  }

  // 6. Classification (Section 8, 9, 10, 11, 12)
  const transactionType = classifyTransactionType(
    signals.direction,
    signals,
    message.content
  );

  // 7. Merchant Resolution & Normalization (Section 15)
  const merchantResult = resolveMerchant(extracted.rawMerchantCandidate);
  const normalizedMerchant = merchantResult.normalizedMerchant;

  // 8. Exclusion / Blacklist check
  if (normalizedMerchant) {
    if (detectionState.excludedMerchants.includes(normalizedMerchant.toLowerCase())) {
      return null;
    }
  }
  if (extracted.accountTail) {
    if (detectionState.excludedAccountTails.includes(extracted.accountTail)) {
      return null;
    }
  }

  // 9. Category Engine (Section 16, 17)
  const categoryResult = resolveCategory(
    normalizedMerchant,
    merchantResult.categoryHint,
    message.content,
    detectionState.learnedRules,
    availableCategories
  );

  // 10. Confidence Evaluation (Section 18)
  const confidenceResult = evaluateConfidence(
    message.sender,
    extracted.amount,
    signals.direction,
    normalizedMerchant,
    extracted.referenceNumber,
    extracted.transactionDate
  );

  // If low confidence, do not create transaction (fail-safe)
  if (confidenceResult.tier === 'low') {
    return null;
  }

  // 11. Deduplication Identity Fingerprint (Section 19)
  const fingerprint = computeClientFingerprint(
    userId,
    extracted.amount,
    extracted.currency,
    signals.direction,
    transactionType,
    normalizedMerchant,
    extracted.accountTail,
    extracted.referenceNumber || extracted.transactionDate
  );

  if (detectionState.recentFingerprints.includes(fingerprint)) {
    return null; // duplicate dropped
  }

  // 12. Transaction Validation (Section 30)
  const validation = validateProcessedTransaction(
    extracted.amount,
    extracted.currency,
    signals.direction,
    extracted.transactionDate
  );

  if (!validation.isValid) {
    return null;
  }

  // 13. Build Processed Transaction
  const isHighConfidence = confidenceResult.tier === 'high';
  const status = isHighConfidence ? 'auto_approved' : 'pending_review';
  const localId = `detected-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const processed: ProcessedTransaction = {
    id: localId,
    amount: extracted.amount,
    currency: extracted.currency,
    direction: signals.direction,
    transactionType,
    merchant: extracted.rawMerchantCandidate,
    normalizedMerchant,
    categoryId: categoryResult.categoryId,
    categoryName: categoryResult.categoryName,
    financialAccountId: null,
    accountTail: extracted.accountTail,
    referenceNumber: extracted.referenceNumber,
    institutionName: message.sender,
    transactionDate: extracted.transactionDate,
    confidence: confidenceResult.score,
    dedupFingerprint: fingerprint,
    source: message.source,
    status,
    isSynced: false,
    notes: 'Auto-detected from bank message',
    tags: ['auto-detected', message.source],
    createdAt: new Date().toISOString(),
  };

  // Record fingerprint in local Redux ring buffer
  store.dispatch(recordFingerprint(fingerprint));

  if (!isHighConfidence) {
    store.dispatch(incrementPendingReviewCount());
  }

  // 14. Live sync with backend (or offline queue if disconnected)
  try {
    const isConn = await isOnline();
    if (isConn) {
      await syncDetectedBatch({
        items: [
          {
            amount: processed.amount,
            currency: processed.currency,
            direction: processed.direction,
            transactionType: processed.transactionType,
            merchant: processed.merchant,
            normalizedMerchant: processed.normalizedMerchant,
            categoryId: processed.categoryId,
            financialAccountId: processed.financialAccountId,
            accountTail: processed.accountTail,
            referenceNumber: processed.referenceNumber,
            institutionName: processed.institutionName,
            transactionDate: processed.transactionDate,
            confidence: processed.confidence,
            dedupFingerprint: processed.dedupFingerprint,
            source: processed.source,
            status: processed.status,
          },
        ],
      });
      processed.isSynced = true;
      store.dispatch(
        setSyncStatus({
          status: 'idle',
          timestamp: new Date().toISOString(),
        })
      );
      if (isHighConfidence) {
        invalidateMoneyQueries(queryClient);
      }
    } else {
      // Offline fallback: queue offline action
      queueOfflineAction(
        'create',
        {
          amount: processed.amount,
          currency: processed.currency,
          type: processed.transactionType === 'income' ? 'income' : 'expense',
          date: processed.transactionDate,
          merchant: processed.normalizedMerchant || processed.merchant,
          categoryId: processed.categoryId,
          tags: ['auto-detected', processed.source],
          notes: 'Auto-detected from bank message',
        },
        'transaction'
      );
    }
  } catch {
    // Network error fallback
    queueOfflineAction(
      'create',
      {
        amount: processed.amount,
        currency: processed.currency,
        type: processed.transactionType === 'income' ? 'income' : 'expense',
        date: processed.transactionDate,
        merchant: processed.normalizedMerchant || processed.merchant,
        categoryId: processed.categoryId,
        tags: ['auto-detected', processed.source],
        notes: 'Auto-detected from bank message',
      },
      'transaction'
    );
  }

  // 15. Trigger native local notification if user preferences permit
  const notifPref = detectionState.notificationPreference;
  if (notifPref === 'all' || (notifPref === 'needs_review' && !isHighConfidence)) {
    const symbol = processed.currency === 'INR' ? '₹' : processed.currency;
    const title = isHighConfidence
      ? `${processed.transactionType === 'income' ? 'Income Added' : 'Expense Added'}: ${symbol}${processed.amount.toLocaleString()}`
      : `Transaction Needs Review: ${symbol}${processed.amount.toLocaleString()}`;

    const body = `${processed.normalizedMerchant || 'Bank Transaction'} • ${processed.categoryName || 'General'}`;

    showLocalDetectionNotification({
      title,
      body,
      data: {
        detectedId: processed.id,
        status: processed.status,
      },
    }).catch(() => {});
  }

  return processed;
}
