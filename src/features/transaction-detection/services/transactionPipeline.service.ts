import {
  categoryForTaxonomy,
  formatMinorToDecimal,
  merchantKey,
  processMessage,
  type DetectedCandidate,
  type UserContext,
} from '@budgetbrain/detection-core';
import type {
  DetectionCategory,
  DetectionConfig,
  DetectionContext,
  RawIncomingMessage,
  SyncItemPayload,
} from '../types/transactionDetection.types';
import { getCompiledPack } from './detectionPack.service';
import { saveProcessed, type PipelineOutcome } from './store/detectionStore.service';

/**
 * Thin adapter over the core pipeline (plan T3.15): builds the core user context from the
 * persisted detection context, runs `processMessage`, and turns the result into a sync payload
 * or a counted outcome. All parsing rules live in `@budgetbrain/detection-core`.
 */

export type MessageEvaluation = { ok: true; payload: SyncItemPayload } | { ok: false; outcome: PipelineOutcome };

const CATEGORY_SOURCE: Record<NonNullable<DetectedCandidate['categorySource']>, SyncItemPayload['categorySource']> = {
  rule: 'rule',
  knowledge_base: 'knowledge_base',
  mcc: 'knowledge_base',
  context: 'context',
  fallback: 'fallback',
};

/** Core user context from the app's detection settings. */
export function toUserContext(context: DetectionContext & { userId: string }): UserContext {
  const merchantRules: Record<string, { categoryId: string }> = {};
  for (const rule of Object.values(context.learnedRules)) {
    const key = merchantKey(rule.merchant);
    if (key) merchantRules[key] = { categoryId: rule.categoryId };
  }
  return {
    userId: context.userId,
    merchantRules,
    excludedMerchants: context.excludedMerchants.map(merchantKey).filter(Boolean),
    excludedAccountTails: context.excludedAccountTails,
    simSlot: context.selectedSimSlot === 'all' ? null : Number(context.selectedSimSlot),
  };
}

function toPayload(candidate: DetectedCandidate, categories: DetectionCategory[]): SyncItemPayload {
  const categoryId = candidate.categoryId ?? categoryForTaxonomy(candidate.taxonomyCode, categories, getCompiledPack());
  return {
    clientId: candidate.fingerprint.slice(3, 27),
    amount: formatMinorToDecimal(candidate.amountMinor, candidate.currency),
    currency: candidate.currency,
    direction: candidate.direction,
    transactionType: candidate.transactionType,
    subtype: candidate.subtype,
    // The backend has no `wallet` payment method yet (see core PAYMENT_METHODS).
    paymentMethod: candidate.paymentMethod === 'wallet' ? 'other' : candidate.paymentMethod,
    institutionId: candidate.institutionId,
    accountTail: candidate.accountTail,
    referenceNumber: candidate.referenceNumber,
    // Only the cleaned name leaves the device, never raw message text (spec §22).
    merchantName: candidate.merchantName,
    merchantId: candidate.merchantId,
    taxonomyCode: candidate.taxonomyCode,
    categoryId,
    categorySource: candidate.categorySource ? CATEGORY_SOURCE[candidate.categorySource] : null,
    financialAccountId: null,
    transactionDate: candidate.transactionDate,
    receivedAt: candidate.receivedAt,
    evidence: candidate.evidence,
    confidenceTier: candidate.confidenceTier,
    dedupFingerprint: candidate.fingerprint,
    source: candidate.source,
  };
}

/**
 * One message → a sync payload, or where and why it stopped (plan T2.10). Pure: the local
 * duplicate check happens when the payload is stored (UNIQUE fingerprint).
 */
export function evaluateMessage(
  message: RawIncomingMessage,
  context: DetectionContext,
  availableCategories: DetectionCategory[] = []
): MessageEvaluation {
  const userId = context.userId;
  if (!userId || !context.isAutoTrackingEnabled) {
    return { ok: false, outcome: { state: 'INELIGIBLE', reason: 'kill_switch', institutionId: null } };
  }
  const result = processMessage(message, getCompiledPack(), toUserContext({ ...context, userId }));
  if (result.candidate && result.terminal !== 'IGNORED') {
    return { ok: true, payload: toPayload(result.candidate, availableCategories) };
  }
  return { ok: false, outcome: { state: result.stage, reason: result.reasonCode, institutionId: result.institutionId } };
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
    for (let i = 0; i < messages.length; i += 1) outcomes.push({ state: 'INELIGIBLE', reason: 'kill_switch', institutionId: null });
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
