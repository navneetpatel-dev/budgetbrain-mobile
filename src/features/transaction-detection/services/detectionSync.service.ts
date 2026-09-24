import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '@/shared/store';
import { clearLegacyFingerprints, setPendingReviewCount, setSyncStatus } from '@/shared/store/transactionDetectionSlice';
import { queryClient } from '@/shared/services/queryClient';
import { invalidateMoneyQueries } from '@/shared/services/queryInvalidation';
import {
  initSmsWatermark,
  scheduleSmsCatchUp,
  setSmsSenderFilter,
} from '@/shared/services/sms/smsDetector.service';
import { getApiErrorCode } from '@/shared/services/api';
import {
  fetchCategoriesForDetection,
  fetchRecentTransactions,
  fetchSyncState,
  uploadDetectionDiagnostics,
  uploadMessageSkeletons,
} from '../api/detectedTransactions.api';
import { ensureActivePack, nativeSenderFilter } from './detectionPack.service';
import { updateKnowledgePack } from './packManager.service';
import { syncLinkedAccountTails, syncMerchantRules } from './detectionProfile.service';
import type { SyncFlushSummary, SyncItemPayload } from '../types/transactionDetection.types';
import { getDetectionConfig } from './detectionConfig.service';
import { contextFromState, saveDetectionCategories, saveDetectionContext } from './detectionContext.service';
import { drainAndSync } from './detectionDrain.service';
import { refreshRecentDigest } from './recentDigest.service';
import { notifyDetectionSummary } from './detectionNotifier.service';
import { uploadDetectionTelemetry, type TelemetryUploader } from './detectionTelemetry.service';
import { getKv, importLegacyState, purgeOld, resetBackoff, setKv } from './store/detectionStore.service';
import { apiTransport } from './transport/apiTransport';

/**
 * Foreground side of detection: drains the native queue, syncs, then applies the app-only side
 * effects (Redux sync status, React Query invalidation, review count, one notification).
 */

const EMPTY: SyncFlushSummary = { sent: 0, created: 0, needsReview: 0, alreadySynced: 0, rejected: 0, remaining: 0 };
const LEGACY_QUEUE_KEY = 'transactionDetection.syncQueue.v1';
const LEGACY_IMPORTED_KEY = 'legacy_v1_imported';
const LAST_PURGE_KEY = 'last_purge_at';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
/** Live SMS are drained after this idle time, so a burst becomes one sync request. */
const FLUSH_DEBOUNCE_MS = 2000;

const telemetryUploader: TelemetryUploader = {
  uploadDiagnostics: uploadDetectionDiagnostics,
  uploadSkeletons: uploadMessageSkeletons,
  errorCode: getApiErrorCode,
};

let flushTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleFlush(delayMs = FLUSH_DEBOUNCE_MS) {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushDetectedQueue();
  }, delayMs);
}

export function cancelScheduledFlush() {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = null;
}

/**
 * Runs once per session when detection is on: imports Phase 1 state, hands the sender filter
 * and the catch-up start to the native side, saves categories for headless runs, and purges
 * old rows weekly. Every step is best effort.
 */
export async function prepareForegroundDetection(): Promise<void> {
  await migrateLegacyDetectionState().catch(() => {});
  await persistDetectionContext().catch(() => {});
  await ensureActivePack();
  await applyNativeFilters();
  // Daily, on Wi-Fi or while charging; a new pack also updates the native filters.
  void updateKnowledgePack({ onActivated: applyNativeFilters });
  // Fresh install: catch-up starts now; older messages come only from the inbox scan the user chooses.
  await initSmsWatermark(Date.now()).catch(() => {});
  await scheduleSmsCatchUp().catch(() => {});
  try {
    await saveDetectionCategories(await fetchCategoriesForDetection());
  } catch {
    // Keep the saved list.
  }
  // Rules on login and daily (T5.3); account tails for transfer detection (T5.7).
  await syncMerchantRules().catch(() => {});
  await syncLinkedAccountTails().catch(() => {});
  await refreshDigest();
  await persistDetectionContext().catch(() => {});
  const lastPurge = (await getKv<number>(LAST_PURGE_KEY).catch(() => null)) ?? 0;
  if (Date.now() - lastPurge > WEEK_MS) {
    await purgeOld().catch(() => {});
    await setKv(LAST_PURGE_KEY, Date.now()).catch(() => {});
  }
}

/** Recent transactions for core's duplicate and pairing checks (T3.7, T3.12); at most every 15 minutes. */
async function refreshDigest(): Promise<void> {
  const userId = store.getState().auth.user?.id;
  if (userId) await refreshRecentDigest(fetchRecentTransactions, userId).catch(() => false);
}

/** Hands the active pack's SMS headers, bank names and IFSC prefixes to the native pre-filter. */
async function applyNativeFilters(): Promise<void> {
  await setSmsSenderFilter(nativeSenderFilter()).catch(() => {});
}

/** Saves the Redux settings the headless drain reads. Cheap: skipped when nothing changed. */
export function persistDetectionContext(): Promise<void> {
  return saveDetectionContext(contextFromState(store.getState()));
}

/** Drains and sends everything pending. Safe to call concurrently. */
export async function flushDetectedQueue(options: { resetBackoff?: boolean } = {}): Promise<SyncFlushSummary> {
  const userId = store.getState().auth.user?.id;
  if (!userId) return EMPTY;
  await persistDetectionContext();
  if (options.resetBackoff) await resetBackoff(userId);
  const config = await getDetectionConfig(apiTransport);
  // Before the drain, so new alerts are checked against what the user entered by hand.
  await refreshDigest();

  store.dispatch(setSyncStatus({ status: 'syncing' }));
  let summary: SyncFlushSummary = EMPTY;
  try {
    const result = await drainAndSync({ transport: apiTransport, config });
    if (result.sync) {
      const { reviewIds, failed, ...counts } = result.sync;
      summary = counts;
      store.dispatch(setSyncStatus({ status: failed ? 'error' : 'idle', timestamp: failed ? undefined : new Date().toISOString() }));
      if (counts.created > 0 || counts.needsReview > 0) {
        invalidateMoneyQueries(queryClient);
        await refreshPendingCount();
        await notifyDetectionSummary({ ...counts, reviewIds }, result.notificationPreference);
      }
      // Diagnostics of finished days and opt-in shapes ride along with a working sync (T7.1, T7.4).
      if (!failed) await uploadDetectionTelemetry(telemetryUploader, { templateLearning: config ? config.templateLearning === true : null });
    } else {
      store.dispatch(setSyncStatus({ status: 'idle' }));
    }
  } catch {
    store.dispatch(setSyncStatus({ status: 'error' }));
  }
  return summary;
}

export async function refreshPendingCount(): Promise<void> {
  try {
    const state = await fetchSyncState();
    store.dispatch(setPendingReviewCount(state.pendingReviewCount));
  } catch {
    // Keep the last known count.
  }
}

/**
 * One-time import of Phase 1 state into the detection store (plan T2.8): the AsyncStorage
 * queue and the Redux fingerprint ring buffer. Both are removed afterwards.
 */
export async function migrateLegacyDetectionState(): Promise<void> {
  const userId = store.getState().auth.user?.id;
  if (!userId || (await getKv<boolean>(LEGACY_IMPORTED_KEY))) return;
  let queued: SyncItemPayload[] = [];
  try {
    const raw = await AsyncStorage.getItem(LEGACY_QUEUE_KEY);
    queued = raw ? (JSON.parse(raw) as SyncItemPayload[]) : [];
  } catch {
    queued = [];
  }
  const detection = store.getState().transactionDetection as { recentFingerprints?: string[] };
  await importLegacyState({ userId, queued, fingerprints: detection.recentFingerprints ?? [] });
  await setKv(LEGACY_IMPORTED_KEY, true);
  await AsyncStorage.removeItem(LEGACY_QUEUE_KEY).catch(() => {});
  store.dispatch(clearLegacyFingerprints());
}
