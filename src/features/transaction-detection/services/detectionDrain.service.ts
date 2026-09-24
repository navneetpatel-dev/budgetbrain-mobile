import { ackSmsMessages, drainSmsQueue, toNormalizedMessage } from '@/shared/services/sms/smsDetector.service';
import type { DetectionConfig, DetectionTransport } from '../types/transactionDetection.types';
import { loadDetectionCategories, loadDetectionContext } from './detectionContext.service';
import { processMessages } from './transactionPipeline.service';
import { runDetectionSync, type SyncRunSummary } from './syncManager.service';

/**
 * Moves SMS candidates from the native queue into the detection store, then syncs (plan T2.4).
 * Used by the headless task and by the foreground app when a live SMS arrives.
 *
 * Candidates are acknowledged (deleted natively) only after the store transaction that holds
 * them has committed, so a process killed mid-run loses nothing; the next run sees them again
 * and the UNIQUE fingerprint drops the repeats.
 */
const PAGE = 50;
const MAX_PER_RUN = 200;

export interface DrainResult {
  drained: number;
  stored: number;
  sync: SyncRunSummary | null;
  notificationPreference: 'all' | 'needs_review' | 'off';
}

let running: Promise<DrainResult> | null = null;

export function drainAndSync(options: {
  transport: DetectionTransport;
  config: DetectionConfig | null;
  /** Caps sync requests; the headless run sends at most one (plan §3.1). */
  maxRequests?: number;
}): Promise<DrainResult> {
  if (!running) {
    running = doDrain(options).finally(() => {
      running = null;
    });
  }
  return running;
}

async function doDrain(options: {
  transport: DetectionTransport;
  config: DetectionConfig | null;
  maxRequests?: number;
}): Promise<DrainResult> {
  const context = await loadDetectionContext();
  const active = Boolean(context?.userId && context.isAutoTrackingEnabled);
  const categories = active ? await loadDetectionCategories() : [];
  const result: DrainResult = {
    drained: 0,
    stored: 0,
    sync: null,
    notificationPreference: context?.notificationPreference ?? 'all',
  };

  while (result.drained < MAX_PER_RUN) {
    const candidates = await drainSmsQueue(PAGE);
    if (candidates.length === 0) break;
    result.drained += candidates.length;
    if (active && context) {
      const stored = await processMessages(candidates.map(toNormalizedMessage), context, {
        categories,
        config: options.config,
      });
      result.stored += stored.length;
    }
    // Signed out or detection off: the candidates are dropped, never kept.
    await ackSmsMessages(candidates.map((candidate) => candidate.queueId));
    if (candidates.length < PAGE) break;
  }

  if (active && context?.userId) {
    result.sync = await runDetectionSync(options.transport, context.userId, { maxRequests: options.maxRequests });
  }
  return result;
}

/** Test helper. */
export function __resetDrainForTests() {
  running = null;
}
