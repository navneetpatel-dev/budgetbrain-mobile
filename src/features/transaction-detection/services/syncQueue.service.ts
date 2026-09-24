import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { store } from '@/shared/store';
import { setPendingReviewCount, setSyncStatus } from '@/shared/store/transactionDetectionSlice';
import { queryClient } from '@/shared/services/queryClient';
import { invalidateMoneyQueries } from '@/shared/services/queryInvalidation';
import { showLocalDetectionNotification } from '@/shared/services/notifications';
import { fetchSyncState, syncDetectedBatch } from '../api/detectedTransactions.api';
import type { SyncFlushSummary, SyncItemPayload } from '../types/transactionDetection.types';

/**
 * Durable queue of detected transactions waiting to reach the server (plan tasks T1.12, T1.14).
 *
 * Detected items are only ever sent to `/detected-transactions/sync`, which keeps refunds and
 * transfers as they are and applies review and duplicate checks. The old fallback that queued
 * them as plain transactions is gone (gap P0-3). This interim queue lives in AsyncStorage until
 * the SQLite store replaces it (plan T2.8).
 */

const STORAGE_KEY = 'transactionDetection.syncQueue.v1';
/** Oldest items are dropped past this size; the next inbox scan picks them up again. */
const MAX_QUEUE = 500;
const MAX_BATCH = 100;
/** Live messages are flushed after this idle time, or at once when a batch fills up. */
const FLUSH_DEBOUNCE_MS = 2000;
const FLUSH_AT_SIZE = 20;

let memoryQueue: SyncItemPayload[] | null = null;
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushing: Promise<SyncFlushSummary> | null = null;

async function load(): Promise<SyncItemPayload[]> {
  if (memoryQueue) return memoryQueue;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    memoryQueue = raw ? (JSON.parse(raw) as SyncItemPayload[]) : [];
  } catch {
    memoryQueue = [];
  }
  return memoryQueue;
}

async function save(queue: SyncItemPayload[]): Promise<void> {
  memoryQueue = queue;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // Keep the in-memory copy; it is retried on the next save.
  }
}

/** Adds items to the queue (skipping ones already queued) and schedules a flush. */
export async function enqueueDetected(items: SyncItemPayload[], options: { flush?: 'debounced' | 'none' } = {}): Promise<void> {
  if (items.length === 0) return;
  const queue = await load();
  const queued = new Set(queue.map((item) => item.dedupFingerprint));
  const next = [...queue, ...items.filter((item) => !queued.has(item.dedupFingerprint))].slice(-MAX_QUEUE);
  await save(next);
  if (options.flush !== 'none') scheduleFlush(next.length >= FLUSH_AT_SIZE ? 0 : FLUSH_DEBOUNCE_MS);
}

export async function queuedCount(): Promise<number> {
  return (await load()).length;
}

function scheduleFlush(delayMs: number) {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushDetectedQueue();
  }, delayMs);
}

/** Sends everything queued, 100 items per request. Safe to call concurrently. */
export function flushDetectedQueue(): Promise<SyncFlushSummary> {
  if (!flushing) {
    flushing = doFlush().finally(() => {
      flushing = null;
    });
  }
  return flushing;
}

async function doFlush(): Promise<SyncFlushSummary> {
  const summary: SyncFlushSummary = { sent: 0, created: 0, needsReview: 0, alreadySynced: 0, rejected: 0, remaining: 0 };
  const net = await NetInfo.fetch();
  if (!net.isConnected || net.isInternetReachable === false) {
    summary.remaining = (await load()).length;
    return summary;
  }

  store.dispatch(setSyncStatus({ status: 'syncing' }));
  let failed = false;
  // Items are removed only after the server answered for them; a failed request keeps them.
  for (;;) {
    const queue = await load();
    if (queue.length === 0) break;
    const batch = queue.slice(0, MAX_BATCH);
    let results;
    try {
      const response = await syncDetectedBatch(batch, batchKey(batch));
      results = response.results;
    } catch {
      failed = true;
      break;
    }
    const answered = new Set<string>();
    for (const result of results) {
      answered.add(result.clientId);
      if (result.status === 'created') summary.created += 1;
      else if (result.status === 'needs_review') summary.needsReview += 1;
      else if (result.status === 'already_synced') summary.alreadySynced += 1;
      // A validation error will fail the same way every time, so it is dropped, not retried.
      else summary.rejected += 1;
    }
    summary.sent += batch.length;
    const current = await load();
    await save(current.filter((item) => !answered.has(item.clientId)));
    if (answered.size === 0) {
      failed = true;
      break;
    }
  }
  summary.remaining = (await load()).length;
  store.dispatch(setSyncStatus({ status: failed ? 'error' : 'idle', timestamp: failed ? undefined : new Date().toISOString() }));

  if (summary.created > 0 || summary.needsReview > 0) {
    invalidateMoneyQueries(queryClient);
    await refreshPendingCount();
    notifyFlush(summary);
  }
  return summary;
}

/**
 * A stable key per batch, so a request retried after a timeout is replayed from the server's
 * idempotency cache instead of being processed again. FNV-1a over the items' fingerprints.
 */
function batchKey(batch: SyncItemPayload[]): string {
  let hash = 0x811c9dc5;
  for (const item of batch) {
    for (let i = 0; i < item.dedupFingerprint.length; i += 1) {
      hash ^= item.dedupFingerprint.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
  }
  return `detect-${batch.length}-${hash.toString(16).padStart(8, '0')}`;
}

export async function refreshPendingCount(): Promise<void> {
  try {
    const state = await fetchSyncState();
    store.dispatch(setPendingReviewCount(state.pendingReviewCount));
  } catch {
    // Keep the last known count.
  }
}

/** One grouped notification per flush instead of one per message (plan §3.1). */
function notifyFlush(summary: SyncFlushSummary) {
  const pref = store.getState().transactionDetection.notificationPreference;
  if (pref === 'off') return;
  if (pref === 'needs_review' && summary.needsReview === 0) return;
  const parts: string[] = [];
  if (summary.created > 0) parts.push(`${summary.created} added`);
  if (summary.needsReview > 0) parts.push(`${summary.needsReview} to review`);
  showLocalDetectionNotification({
    title: summary.needsReview > 0 ? 'Transactions need review' : 'Transactions added',
    // Counts only: amounts and merchants stay off the lock screen (gap P6).
    body: `Detected from your bank messages: ${parts.join(', ')}.`,
    data: { detectedId: 'batch', status: summary.needsReview > 0 ? 'pending_review' : 'auto_approved' },
  }).catch(() => {});
}

/** Test helper: forget the in-memory copy so the next call reads storage again. */
export function __resetSyncQueueForTests() {
  memoryQueue = null;
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = null;
  flushing = null;
}
