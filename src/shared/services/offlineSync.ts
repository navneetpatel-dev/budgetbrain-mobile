import NetInfo from '@react-native-community/netinfo';
import { store } from '../store';
import { addToOfflineQueue, clearOfflineQueue } from '../store/settingsSlice';
import { apiPost } from './api';
import { queryClient } from './queryClient';
import { invalidateMoneyQueries } from './queryInvalidation';

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
) {
  store.dispatch(
    addToOfflineQueue({
      id: generateId(),
      action,
      resource,
      payload,
    })
  );
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

    await apiPost('/sync/batch', { items });
    store.dispatch(clearOfflineQueue());
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
