import type { DetectionTransport, SyncFlushSummary, SyncItemPayload } from '../types/transactionDetection.types';
import { applySyncResults, markAttemptFailed, pendingCount, pendingForSync } from './store/detectionStore.service';

/**
 * Sends pending detected items to `/detected-transactions/sync` (plan T2.9). It doesn't touch
 * Redux, React Query or notifications, so the foreground app and the headless drain share it
 * and each apply their own side effects to the returned summary.
 *
 * Items leave the pending state only when the server answers for them. A failed request, or an
 * item the server didn't answer, is retried with exponential backoff (30 s → 30 min).
 */
const MAX_BATCH = 100;

export interface SyncRunSummary extends SyncFlushSummary {
  /** Server ids of items now in the review queue. */
  reviewIds: string[];
  failed: boolean;
}

let running: Promise<SyncRunSummary> | null = null;

/** Single-flight: a call made while a run is in progress gets that run's result. */
export function runDetectionSync(
  transport: DetectionTransport,
  userId: string,
  options: { maxRequests?: number; now?: () => number } = {}
): Promise<SyncRunSummary> {
  if (!running) {
    running = doSync(transport, userId, options).finally(() => {
      running = null;
    });
  }
  return running;
}

async function doSync(
  transport: DetectionTransport,
  userId: string,
  options: { maxRequests?: number; now?: () => number }
): Promise<SyncRunSummary> {
  const now = options.now ?? Date.now;
  const summary: SyncRunSummary = {
    sent: 0,
    created: 0,
    needsReview: 0,
    alreadySynced: 0,
    rejected: 0,
    remaining: 0,
    reviewIds: [],
    failed: false,
  };

  if (await transport.isOnline()) {
    const maxRequests = options.maxRequests ?? Number.POSITIVE_INFINITY;
    for (let requests = 0; requests < maxRequests; requests += 1) {
      const batch = await pendingForSync(userId, MAX_BATCH, now());
      if (batch.length === 0) break;
      let results;
      try {
        results = (await transport.syncBatch(batch, batchKey(batch))).results;
      } catch {
        await markAttemptFailed(
          batch.map((item) => item.clientId),
          now()
        );
        summary.failed = true;
        break;
      }
      const applied = await applySyncResults(results, now());
      summary.sent += batch.length;
      summary.created += applied.created;
      summary.needsReview += applied.needsReview;
      summary.alreadySynced += applied.alreadySynced;
      summary.rejected += applied.rejected;
      summary.reviewIds.push(...applied.reviewIds);

      const answered = new Set(results.map((result) => result.clientId));
      const unanswered = batch.filter((item) => !answered.has(item.clientId)).map((item) => item.clientId);
      if (unanswered.length > 0) {
        await markAttemptFailed(unanswered, now());
        summary.failed = true;
        break;
      }
    }
  }
  summary.remaining = await pendingCount(userId);
  return summary;
}

/**
 * A stable key per batch, so a request retried after a timeout is replayed from the server's
 * idempotency cache instead of being processed again. FNV-1a over the items' fingerprints.
 */
export function batchKey(batch: SyncItemPayload[]): string {
  let hash = 0x811c9dc5;
  for (const item of batch) {
    for (let i = 0; i < item.dedupFingerprint.length; i += 1) {
      hash ^= item.dedupFingerprint.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
  }
  return `detect-${batch.length}-${hash.toString(16).padStart(8, '0')}`;
}

/** Test helper. */
export function __resetSyncManagerForTests() {
  running = null;
}
