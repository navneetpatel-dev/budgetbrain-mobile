import {
  computeFingerprint,
  formatMinorToDecimal,
  isAllowedDirectionType,
  isSupportedCurrency,
  minorUnits,
  scoreEvidence,
  type DetectionEvidence,
} from '@budgetbrain/detection-core';
import { store } from '@/shared/store';
import { recordFingerprint } from '@/shared/store/transactionDetectionSlice';
import type { RawIncomingMessage, SyncItemPayload } from '../types/transactionDetection.types';
import { isMessageEligible } from '../engines/eligibility.engine';
import { detectFinancialMovement } from '../engines/detector.engine';
import { extractTransactionDetails } from '../engines/extractor.engine';
import { classifyTransactionType } from '../engines/classifier.engine';
import { resolveMerchant } from '../engines/merchant.engine';
import { resolveCategory, type CategoryResolutionResult } from '../engines/category.engine';
import { validateProcessedTransaction } from '../engines/validator.engine';
import { resolveInstitutionId } from '../constants/institutionKeywords';
import { getDetectionConfig } from './detectionConfig.service';
import { enqueueDetected } from './syncQueue.service';

type AvailableCategory = { id: string; name: string };

const CATEGORY_SOURCE: Record<CategoryResolutionResult['source'], SyncItemPayload['categorySource']> = {
  user_rule: 'rule',
  merchant_catalog: 'knowledge_base',
  context_keyword: 'context',
  fallback: 'fallback',
};

/**
 * Turns one message into a sync payload, or null when it must not become a transaction.
 * Synchronous and free of I/O: storage and network happen in the caller, once per batch.
 *
 * The confidence tier comes from core `scoreEvidence`, the same function the server runs, over
 * facts this code actually observed. The server recomputes it and decides what is added.
 * Low-confidence results are dropped here, never queued (spec §18).
 */
export function processIncomingMessage(
  message: RawIncomingMessage,
  availableCategories: AvailableCategory[] = []
): SyncItemPayload | null {
  const state = store.getState();
  const detection = state.transactionDetection;
  const userId = state.auth.user?.id;
  // The server binds every fingerprint to the signed-in user, so nothing is processed without one.
  if (!userId || !detection.isAutoTrackingEnabled) return null;

  if (detection.selectedSimSlot !== 'all' && message.simSlot !== undefined) {
    if (String(message.simSlot) !== detection.selectedSimSlot) return null;
  }

  if (!isMessageEligible(message.sender, message.body)) return null;

  const signals = detectFinancialMovement(message.body);
  if (!signals.isTransaction || !signals.direction) return null;

  const extracted = extractTransactionDetails(message.body, message.receivedAt);
  if (!extracted.amount || !isSupportedCurrency(extracted.currency)) return null;

  const transactionType = classifyTransactionType(signals.direction, signals, message.body);
  // The classifier can't yet tell every case apart; never send a pairing the server rejects.
  if (!isAllowedDirectionType(signals.direction, transactionType)) return null;

  const merchant = resolveMerchant(extracted.rawMerchantCandidate);
  const merchantName = merchant.normalizedMerchant;
  if (merchantName && detection.excludedMerchants.includes(merchantName.toLowerCase())) return null;
  if (extracted.accountTail && detection.excludedAccountTails.includes(extracted.accountTail)) return null;

  const validation = validateProcessedTransaction(
    extracted.amount,
    extracted.currency,
    signals.direction,
    extracted.transactionDate
  );
  if (!validation.isValid) return null;

  const institutionId = resolveInstitutionId(message.sender);
  const referenceNumber = extracted.referenceNumber;
  const evidence: DetectionEvidence = {
    templateMatched: false,
    institutionVerified: institutionId !== null,
    amountRoleUnique: extracted.amountCandidateCount === 1,
    directionUnambiguous: !signals.directionAmbiguous,
    merchantKnown: merchant.categoryHint !== null,
    dateExtracted: extracted.dateFromMessage,
    referencePresent: referenceNumber !== null,
    merchantFuzzy: false,
  };
  const confidenceTier = scoreEvidence(evidence);
  if (confidenceTier === 'low') return null;

  const amountMinor = Math.round(extracted.amount * 10 ** minorUnits(extracted.currency));
  const dedupFingerprint = computeFingerprint({
    userId,
    institutionId,
    accountTail: extracted.accountTail,
    amountMinor,
    currency: extracted.currency,
    direction: signals.direction,
    referenceNumber,
    transactionDate: extracted.transactionDate,
    receivedAt: message.receivedAt,
  });
  if (detection.recentFingerprints.includes(dedupFingerprint)) return null;
  store.dispatch(recordFingerprint(dedupFingerprint));

  const category =
    transactionType === 'transfer'
      ? null
      : resolveCategory(merchantName, merchant.categoryHint, message.body, detection.learnedRules, availableCategories);

  return {
    clientId: dedupFingerprint.slice(3, 27),
    amount: formatMinorToDecimal(amountMinor, extracted.currency),
    currency: extracted.currency,
    direction: signals.direction,
    transactionType,
    subtype: null,
    paymentMethod: null,
    institutionId,
    accountTail: extracted.accountTail,
    referenceNumber,
    // Only the cleaned name leaves the device, never raw message text (spec §22).
    merchantName,
    merchantId: null,
    taxonomyCode: null,
    categoryId: category?.categoryId ?? null,
    categorySource: category ? CATEGORY_SOURCE[category.source] : null,
    financialAccountId: null,
    transactionDate: extracted.transactionDate,
    receivedAt: message.receivedAt,
    evidence,
    confidenceTier,
    dedupFingerprint,
    source: message.source,
  };
}

/**
 * Runs a batch of messages through the pipeline and queues the results for sync.
 * Checks the server kill switch once per batch (plan task T1.16). Returns how many were queued.
 */
export async function processAndQueueMessages(
  messages: RawIncomingMessage[],
  availableCategories: AvailableCategory[] = [],
  options: { flush?: 'debounced' | 'none' } = {}
): Promise<number> {
  const config = await getDetectionConfig();
  if (config && !config.enabled) return 0;

  const payloads: SyncItemPayload[] = [];
  for (const message of messages) {
    try {
      const payload = processIncomingMessage(message, availableCategories);
      if (payload) payloads.push(payload);
    } catch {
      // One unparseable message never stops the batch.
    }
  }
  await enqueueDetected(payloads, options);
  return payloads.length;
}
