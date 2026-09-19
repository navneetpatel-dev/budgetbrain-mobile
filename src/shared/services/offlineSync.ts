import NetInfo from '@react-native-community/netinfo';
import { store } from '../store';
import { addToOfflineQueue, clearOfflineQueue } from '../store/settingsSlice';
import { apiPost } from './api';
import { queryClient } from './queryClient';
import { invalidateMoneyQueries } from './queryInvalidation';
import { queuePendingReceiptUpload, takePendingReceiptUpload } from './pendingReceipts';
import { uploadReceipt } from '@/features/expenses/services/receipts';

interface SyncItemResult {
  id: string;
  status: 'applied' | 'conflict_server_kept' | 'error';
  resource: string;
  action: string;
  serverId?: string;
}

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
    store.dispatch(clearOfflineQueue());

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
