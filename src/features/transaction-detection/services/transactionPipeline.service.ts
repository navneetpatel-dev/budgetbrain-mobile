import {
  computeFingerprint,
  formatMinorToDecimal,
  isAllowedDirectionType,
  isSupportedCurrency,
  minorUnits,
  scoreEvidence,
  type DetectionEvidence,
  type ReasonCode,
} from '@budgetbrain/detection-core';
import type {
  DetectionCategory,
  DetectionConfig,
  DetectionContext,
  RawIncomingMessage,
  SyncItemPayload,
} from '../types/transactionDetection.types';
import { eligibilityReason } from '../engines/eligibility.engine';
import { detectFinancialMovement } from '../engines/detector.engine';
import { extractTransactionDetails } from '../engines/extractor.engine';
import { classifyTransactionType } from '../engines/classifier.engine';
import { resolveMerchant } from '../engines/merchant.engine';
import { resolveCategory, type CategoryResolutionResult } from '../engines/category.engine';
import { validateProcessedTransaction } from '../engines/validator.engine';
import { resolveInstitutionId } from '../constants/institutionKeywords';
import { saveProcessed, type PipelineOutcome } from './store/detectionStore.service';

const CATEGORY_SOURCE: Record<CategoryResolutionResult['source'], SyncItemPayload['categorySource']> = {
  user_rule: 'rule',
  merchant_catalog: 'knowledge_base',
  context_keyword: 'context',
  fallback: 'fallback',
};

export type MessageEvaluation = { ok: true; payload: SyncItemPayload } | { ok: false; outcome: PipelineOutcome };

/** Bodies are truncated before parsing so one huge message can't stall a run (plan §3.1). */
const MAX_BODY_CHARS = 1000;

/**
 * Turns one message into a sync payload, or says where and why it stopped (plan T2.10).
 * Pure: no storage, network or Redux, so the headless drain can run it. Duplicate detection
 * happens when the result is stored (the fingerprint is UNIQUE in the local store).
 *
 * The confidence tier comes from core `scoreEvidence`, the same function the server runs, over
 * facts this code actually observed. The server recomputes it and decides what is added.
 * Low-confidence results are dropped here, never queued (spec §18).
 */
export function evaluateMessage(
  input: RawIncomingMessage,
  context: DetectionContext,
  availableCategories: DetectionCategory[] = []
): MessageEvaluation {
  const institutionId = resolveInstitutionId(input.sender);
  const stop = (state: PipelineOutcome['state'], reason: ReasonCode): MessageEvaluation => ({
    ok: false,
    outcome: { state, reason, institutionId },
  });
  const userId = context.userId;
  // The server binds every fingerprint to the signed-in user, so nothing is processed without one.
  if (!userId || !context.isAutoTrackingEnabled) return stop('INELIGIBLE', 'kill_switch');

  if (context.selectedSimSlot !== 'all' && input.simSlot !== undefined) {
    if (String(input.simSlot) !== context.selectedSimSlot) return stop('INELIGIBLE', 'sim_filtered');
  }

  const message = input.body.length > MAX_BODY_CHARS ? { ...input, body: input.body.slice(0, MAX_BODY_CHARS) } : input;
  const ineligible = eligibilityReason(message.body);
  if (ineligible) return stop('INELIGIBLE', ineligible);

  const signals = detectFinancialMovement(message.body);
  if (!signals.isTransaction) return stop('INELIGIBLE', 'no_movement_wording');
  if (!signals.direction) return stop('PARSE_FAILED', 'ambiguous_direction');

  const extracted = extractTransactionDetails(message.body, message.receivedAt);
  if (!extracted.amount) return stop('PARSE_FAILED', 'no_amount');
  if (!isSupportedCurrency(extracted.currency)) return stop('PARSE_FAILED', 'unsupported_currency');

  const transactionType = classifyTransactionType(signals.direction, signals, message.body);
  // The classifier can't yet tell every case apart; never send a pairing the server rejects.
  if (!isAllowedDirectionType(signals.direction, transactionType)) return stop('PARSE_FAILED', 'unknown_type');

  const merchant = resolveMerchant(extracted.rawMerchantCandidate);
  const merchantName = merchant.normalizedMerchant;
  if (merchantName && context.excludedMerchants.includes(merchantName.toLowerCase())) {
    return stop('INELIGIBLE', 'excluded_merchant');
  }
  if (extracted.accountTail && context.excludedAccountTails.includes(extracted.accountTail)) {
    return stop('INELIGIBLE', 'excluded_account');
  }

  const validation = validateProcessedTransaction(
    extracted.amount,
    extracted.currency,
    signals.direction,
    extracted.transactionDate
  );
  if (!validation.isValid) {
    const why = validation.reason ?? '';
    return stop('PARSE_FAILED', /future/i.test(why) ? 'future_date' : /amount/i.test(why) ? 'invalid_amount' : 'invalid_date');
  }

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
  if (confidenceTier === 'low') {
    return stop('PARSE_FAILED', extracted.amountCandidateCount > 1 ? 'multiple_amounts' : 'low_confidence');
  }

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

  const category =
    transactionType === 'transfer'
      ? null
      : resolveCategory(merchantName, merchant.categoryHint, message.body, context.learnedRules, availableCategories);

  const payload: SyncItemPayload = {
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
  return { ok: true, payload };
}

/**
 * Runs a batch of messages through the pipeline and stores the results for sync in one write
 * transaction. The server kill switch is applied by the caller's `config` (plan T1.16).
 * Returns the payloads that were new; repeats of a stored fingerprint are counted as duplicates.
 */
export async function processMessages(
  messages: RawIncomingMessage[],
  context: DetectionContext,
  options: { categories?: DetectionCategory[]; config?: DetectionConfig | null; now?: number } = {}
): Promise<SyncItemPayload[]> {
  const userId = context.userId;
  if (!userId || !context.isAutoTrackingEnabled || messages.length === 0) return [];

  const payloads: SyncItemPayload[] = [];
  const outcomes: PipelineOutcome[] = [];
  if (options.config && !options.config.enabled) {
    for (const message of messages) {
      outcomes.push({ state: 'INELIGIBLE', reason: 'kill_switch', institutionId: resolveInstitutionId(message.sender) });
    }
  } else {
    for (const message of messages) {
      try {
        const result = evaluateMessage(message, context, options.categories);
        if (result.ok) payloads.push(result.payload);
        else outcomes.push(result.outcome);
      } catch {
        // One unparseable message never stops the batch.
        outcomes.push({ state: 'PARSE_FAILED', reason: 'no_amount', institutionId: null });
      }
    }
  }
  return saveProcessed({ userId, payloads, outcomes, now: options.now });
}
