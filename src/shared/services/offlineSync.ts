import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';
import { store } from '../store';
import {
  addToOfflineQueue,
  bumpOfflineQueueRetry,
  moveOfflineItemToConflicts,
  removeOfflineQueueItems,
} from '../store/settingsSlice';
import { apiPost } from './api';
import { queryClient } from './queryClient';
import { invalidateMoneyQueries } from './queryInvalidation';
import { queuePendingReceiptUpload, takePendingReceiptUpload } from './pendingReceipts';
import { uploadReceipt } from '@/features/expenses/api/receipts.api';

interface SyncItemResult {
  id: string;
  status: 'applied' | 'conflict_server_kept' | 'error' | 'success';
  resource: string;
  action: string;
  serverId?: string;
  error?: string;
}

const MAX_OFFLINE_RETRIES = 5;

let syncInProgress = false;

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export type OfflineAction = 'create' | 'update' | 'delete';
export type OfflineResource = 'transaction' | 'income' | 'budget' | 'goal';

export function initOfflineSync() {
  return NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable !== false) {
      processOfflineQueue();
    }
  });
}

export function queueOfflineAction(
  action: OfflineAction,
  payload: Record<string, unknown>,
  resource: OfflineResource = 'transaction'
): string {
  const id = generateId();
  store.dispatch(
    addToOfflineQueue({
      id,
      action,
      resource,
      payload,
    })
  );
  return id;
}

export async function processOfflineQueue(): Promise<void> {
  if (syncInProgress) return;

  const queue = store.getState().settings.offlineQueue;
  if (!queue.length) return;

  syncInProgress = true;
  try {
    const items = queue.map((item) => ({
      id: item.id,
      action: item.action as OfflineAction,
      resource: (item.resource ?? 'transaction') as OfflineResource,
      payload: item.payload as Record<string, unknown>,
      timestamp: item.timestamp,
    }));

    const response = await apiPost<{ results: SyncItemResult[] }>('/sync/batch', { items });
    const results = response?.results ?? [];
    const resultsById = new Map(results.map((result) => [result.id, result]));

    const succeededIds: string[] = [];
    let failedCount = 0;

    for (const item of items) {
      const result = resultsById.get(item.id);
      const status = result?.status;
      if (status === 'applied' || status === 'success') {
        succeededIds.push(item.id);
        continue;
      }

      failedCount += 1;
      const errorMessage = result?.error || (status === 'conflict_server_kept' ? 'Server kept a conflicting version' : 'Sync failed');
      const current = store.getState().settings.offlineQueue.find((entry) => entry.id === item.id);
      const retries = (current?.retryCount ?? 0) + 1;
      if (status === 'conflict_server_kept' || retries >= MAX_OFFLINE_RETRIES) {
        store.dispatch(moveOfflineItemToConflicts({ id: item.id, error: errorMessage }));
      } else {
        store.dispatch(bumpOfflineQueueRetry({ id: item.id, error: errorMessage }));
      }
    }

    if (succeededIds.length) {
      store.dispatch(removeOfflineQueueItems(succeededIds));
    }

    if (failedCount > 0) {
      Alert.alert(
        'Sync issue',
        `${failedCount} change${failedCount === 1 ? '' : 's'} couldn't be synced. Open Settings to review, or they'll retry on the next reconnect.`
      );
    }

    // A queued transaction created while offline may have had a receipt image queued
    // alongside it (see pendingReceipts.ts) — now that the create has synced and we know
    // the real server-assigned id, upload any matching pending receipt against it. Failures
    // here are non-fatal to the sync itself (the transaction is already saved); the receipt
    // simply stays queued for the next successful reconnect attempt.
    for (const result of response?.results ?? []) {
      if (result.action !== 'create' || result.status !== 'applied' || !result.serverId) continue;
      const pending = await takePendingReceiptUpload(result.id);
      if (!pending) continue;
      try {
        await uploadReceipt(result.serverId, pending.localUri, pending.name, pending.type);
      } catch {
        // Re-queue for the next reconnect attempt rather than losing it silently. The file
        // is already at its persistent uri, so this just re-records the pointer.
        await queuePendingReceiptUpload(result.id, {
          uri: pending.localUri,
          name: pending.name,
          type: pending.type,
        });
      }
    }

    invalidateMoneyQueries(queryClient);
    void queryClient.invalidateQueries({ queryKey: ['expense'] });
    void queryClient.invalidateQueries({ queryKey: ['income'] });
    void queryClient.invalidateQueries({ queryKey: ['budgets'] });
    void queryClient.invalidateQueries({ queryKey: ['goals'] });
  } catch {
    // Will retry on next reconnect
  } finally {
    syncInProgress = false;
  }
}

export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return !!(state.isConnected && state.isInternetReachable !== false);
}
