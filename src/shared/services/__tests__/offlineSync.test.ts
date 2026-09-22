import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

type AnyFn = (...args: any[]) => any;

const mockAddEventListener = jest.fn<AnyFn>();
const mockFetch = jest.fn<AnyFn>();
jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    addEventListener: (...args: unknown[]) => mockAddEventListener(...args),
    fetch: (...args: unknown[]) => mockFetch(...args),
  },
}));

const mockApiPost = jest.fn<AnyFn>();
jest.mock('../api', () => ({
  apiPost: (...args: unknown[]) => mockApiPost(...args),
}));

const mockUploadReceipt = jest.fn<AnyFn>();
jest.mock('@/features/expenses/api/receipts.api', () => ({
  uploadReceipt: (...args: unknown[]) => mockUploadReceipt(...args),
}));

const mockTakePendingReceiptUpload = jest.fn<AnyFn>();
const mockQueuePendingReceiptUpload = jest.fn<AnyFn>();
jest.mock('../pendingReceipts', () => ({
  takePendingReceiptUpload: (...args: unknown[]) => mockTakePendingReceiptUpload(...args),
  queuePendingReceiptUpload: (...args: unknown[]) => mockQueuePendingReceiptUpload(...args),
}));

// The real store pulls in @reduxjs/toolkit -> immer's ESM build, which jest-expo's default
// transformIgnorePatterns doesn't cover — mock a minimal store whose dispatch/getState mirror
// settingsSlice's real addToOfflineQueue/clearOfflineQueue reducer behavior, so offlineSync.ts's
// actual logic (not a re-implementation of it) is what's under test.
interface MockQueueItem {
  id: string;
  action: string;
  resource?: string;
  payload: unknown;
  timestamp: string;
  retryCount?: number;
  lastError?: string;
}

jest.mock('../../store', () => {
  let queue: MockQueueItem[] = [];
  let conflicts: MockQueueItem[] = [];
  return {
    store: {
      dispatch: (action: { type: string; payload?: unknown }) => {
        if (action.type === 'settings/addToOfflineQueue') {
          queue.push({ ...(action.payload as object), timestamp: new Date().toISOString(), retryCount: 0 } as MockQueueItem);
        } else if (action.type === 'settings/clearOfflineQueue') {
          queue = [];
        } else if (action.type === 'settings/removeOfflineQueueItems') {
          const ids = new Set(action.payload as string[]);
          queue = queue.filter((item) => !ids.has(item.id));
        } else if (action.type === 'settings/bumpOfflineQueueRetry') {
          const { id, error } = action.payload as { id: string; error: string };
          const item = queue.find((entry) => entry.id === id);
          if (item) {
            item.retryCount = (item.retryCount ?? 0) + 1;
            item.lastError = error;
          }
        } else if (action.type === 'settings/moveOfflineItemToConflicts') {
          const { id } = action.payload as { id: string };
          const index = queue.findIndex((entry) => entry.id === id);
          if (index >= 0) {
            const [item] = queue.splice(index, 1);
            conflicts.push(item);
          }
        }
      },
      getState: () => ({ settings: { offlineQueue: queue, syncConflicts: conflicts } }),
    },
  };
});

jest.mock('../../store/settingsSlice', () => ({
  addToOfflineQueue: (payload: unknown) => ({ type: 'settings/addToOfflineQueue', payload }),
  clearOfflineQueue: () => ({ type: 'settings/clearOfflineQueue' }),
  removeOfflineQueueItems: (payload: unknown) => ({ type: 'settings/removeOfflineQueueItems', payload }),
  bumpOfflineQueueRetry: (payload: unknown) => ({ type: 'settings/bumpOfflineQueueRetry', payload }),
  moveOfflineItemToConflicts: (payload: unknown) => ({ type: 'settings/moveOfflineItemToConflicts', payload }),
}));

import { store } from '../../store';
import { clearOfflineQueue } from '../../store/settingsSlice';
import { queryClient } from '../queryClient';
import {
  queueOfflineAction,
  processOfflineQueue,
  initOfflineSync,
  isOnline,
} from '../offlineSync';

describe('offlineSync', () => {
  beforeEach(() => {
    store.dispatch(clearOfflineQueue());
    mockAddEventListener.mockReset();
    mockFetch.mockReset();
    mockApiPost.mockReset();
    mockUploadReceipt.mockReset();
    mockTakePendingReceiptUpload.mockReset();
    mockQueuePendingReceiptUpload.mockReset();
  });

  describe('queueOfflineAction', () => {
    it('dispatches the queued action with a generated id, action, resource, and payload', () => {
      const id = queueOfflineAction('create', { amount: 500 }, 'income');
      const queue = store.getState().settings.offlineQueue;

      expect(queue).toHaveLength(1);
      expect(queue[0].id).toBe(id);
      expect(queue[0].action).toBe('create');
      expect(queue[0].resource).toBe('income');
      expect(queue[0].payload).toEqual({ amount: 500 });
    });

    it('defaults resource to "transaction" when not specified', () => {
      queueOfflineAction('update', { id: 'tx-1' });
      const queue = store.getState().settings.offlineQueue;
      expect(queue[0].resource).toBe('transaction');
    });
  });

  describe('processOfflineQueue', () => {
    it('is a no-op when the queue is empty', async () => {
      await processOfflineQueue();
      expect(mockApiPost).not.toHaveBeenCalled();
    });

    it('does not start a second sync while one is already in flight (reentrancy guard)', async () => {
      queueOfflineAction('create', { amount: 100 });
      let resolveFirst!: (value: unknown) => void;
      mockApiPost.mockReturnValueOnce(new Promise((resolve) => { resolveFirst = resolve; }));

      const first = processOfflineQueue();
      const second = processOfflineQueue(); // should short-circuit immediately, not call apiPost again

      resolveFirst({ results: [] });
      await Promise.all([first, second]);

      expect(mockApiPost).toHaveBeenCalledTimes(1);
    });

    it('clears successful items and invalidates money-related query keys on a successful sync', async () => {
      const id = queueOfflineAction('create', { amount: 100 });
      mockApiPost.mockResolvedValueOnce({
        results: [{ id, status: 'applied', resource: 'transaction', action: 'create' }],
      });
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      await processOfflineQueue();

      expect(store.getState().settings.offlineQueue).toHaveLength(0);
      const invalidatedKeys = invalidateSpy.mock.calls.map(
        (call) => (call[0] as { queryKey?: unknown[] } | undefined)?.queryKey?.[0]
      );
      expect(invalidatedKeys).toEqual(expect.arrayContaining(['expense', 'income', 'budgets', 'goals']));
      invalidateSpy.mockRestore();
    });

    it('does NOT clear the queue when the sync request fails, so items remain for the next reconnect', async () => {
      queueOfflineAction('create', { amount: 100 });
      mockApiPost.mockRejectedValueOnce(new Error('network error mid-flight'));

      await processOfflineQueue();

      expect(store.getState().settings.offlineQueue).toHaveLength(1);
    });

    it('allows a subsequent sync attempt to run again after a failed attempt (guard is released)', async () => {
      queueOfflineAction('create', { amount: 100 });
      mockApiPost.mockRejectedValueOnce(new Error('boom'));
      await processOfflineQueue();
      expect(store.getState().settings.offlineQueue).toHaveLength(1);

      mockApiPost.mockResolvedValueOnce({
        results: [{ id: store.getState().settings.offlineQueue[0].id, status: 'applied', resource: 'transaction', action: 'create' }],
      });
      await processOfflineQueue();

      expect(mockApiPost).toHaveBeenCalledTimes(2);
      expect(store.getState().settings.offlineQueue).toHaveLength(0);
    });

    it('uploads a matching pending receipt once a queued create syncs and returns a serverId', async () => {
      const queueId = queueOfflineAction('create', { amount: 250 });
      mockApiPost.mockResolvedValueOnce({
        results: [{ id: queueId, status: 'applied', resource: 'transaction', action: 'create', serverId: 'tx-server-1' }],
      });
      mockTakePendingReceiptUpload.mockResolvedValueOnce({
        localUri: 'file:///document/pending-receipt-x.jpg',
        name: 'x.jpg',
        type: 'image/jpeg',
      });
      mockUploadReceipt.mockResolvedValueOnce({ id: 'att-1' });

      await processOfflineQueue();

      expect(mockTakePendingReceiptUpload).toHaveBeenCalledWith(queueId);
      expect(mockUploadReceipt).toHaveBeenCalledWith(
        'tx-server-1',
        'file:///document/pending-receipt-x.jpg',
        'x.jpg',
        'image/jpeg'
      );
    });

    it('re-queues the pending receipt for a later retry if the upload itself fails, rather than losing it', async () => {
      const queueId = queueOfflineAction('create', { amount: 250 });
      mockApiPost.mockResolvedValueOnce({
        results: [{ id: queueId, status: 'applied', resource: 'transaction', action: 'create', serverId: 'tx-server-2' }],
      });
      mockTakePendingReceiptUpload.mockResolvedValueOnce({
        localUri: 'file:///document/pending-receipt-y.jpg',
        name: 'y.jpg',
        type: 'image/jpeg',
      });
      mockUploadReceipt.mockRejectedValueOnce(new Error('upload failed'));

      await processOfflineQueue();

      expect(mockQueuePendingReceiptUpload).toHaveBeenCalledWith(queueId, {
        uri: 'file:///document/pending-receipt-y.jpg',
        name: 'y.jpg',
        type: 'image/jpeg',
      });
    });

    it('does not attempt a receipt upload for a create that has no matching pending receipt', async () => {
      const queueId = queueOfflineAction('create', { amount: 250 });
      mockApiPost.mockResolvedValueOnce({
        results: [{ id: queueId, status: 'applied', resource: 'transaction', action: 'create', serverId: 'tx-server-3' }],
      });
      mockTakePendingReceiptUpload.mockResolvedValueOnce(null);

      await processOfflineQueue();

      expect(mockUploadReceipt).not.toHaveBeenCalled();
    });

    it('keeps a failed generic item in the queue instead of dropping it', async () => {
      const id = queueOfflineAction('update', { id: 'budget-1' }, 'budget');
      mockApiPost.mockResolvedValueOnce({
        results: [{ id, status: 'error', resource: 'budget', action: 'update', error: 'category gone' }],
      });

      await processOfflineQueue();

      expect(store.getState().settings.offlineQueue).toHaveLength(1);
      expect(store.getState().settings.offlineQueue[0].retryCount).toBe(1);
    });

    it('does not attempt a receipt upload for a non-create action or a non-applied/error result', async () => {
      const queueId = queueOfflineAction('update', { id: 'tx-1' });
      mockApiPost.mockResolvedValueOnce({
        results: [{ id: queueId, status: 'applied', resource: 'transaction', action: 'update' }],
      });

      await processOfflineQueue();

      expect(mockTakePendingReceiptUpload).not.toHaveBeenCalled();
    });
  });

  describe('initOfflineSync / NetInfo listener', () => {
    it('triggers a sync when connectivity is restored and internet is reachable', () => {
      queueOfflineAction('create', { amount: 100 });
      mockApiPost.mockResolvedValueOnce({ results: [] });

      initOfflineSync();
      expect(mockAddEventListener).toHaveBeenCalledTimes(1);
      const handler = mockAddEventListener.mock.calls[0][0] as (state: unknown) => void;

      handler({ isConnected: true, isInternetReachable: true });

      expect(mockApiPost).toHaveBeenCalledTimes(1);
    });

    it('does NOT trigger a sync for a connected-but-unreachable network (e.g. a captive portal)', () => {
      queueOfflineAction('create', { amount: 100 });

      initOfflineSync();
      const handler = mockAddEventListener.mock.calls[0][0] as (state: unknown) => void;

      handler({ isConnected: true, isInternetReachable: false });

      expect(mockApiPost).not.toHaveBeenCalled();
    });

    it('does NOT trigger a sync when not connected at all', () => {
      queueOfflineAction('create', { amount: 100 });

      initOfflineSync();
      const handler = mockAddEventListener.mock.calls[0][0] as (state: unknown) => void;

      handler({ isConnected: false, isInternetReachable: null });

      expect(mockApiPost).not.toHaveBeenCalled();
    });
  });

  describe('isOnline', () => {
    it('resolves true when connected and reachable', async () => {
      mockFetch.mockResolvedValueOnce({ isConnected: true, isInternetReachable: true });
      await expect(isOnline()).resolves.toBe(true);
    });

    it('resolves false when connected but explicitly unreachable', async () => {
      mockFetch.mockResolvedValueOnce({ isConnected: true, isInternetReachable: false });
      await expect(isOnline()).resolves.toBe(false);
    });

    it('resolves true when reachability is unknown (null) but connected — mirrors the listener\'s own check', async () => {
      mockFetch.mockResolvedValueOnce({ isConnected: true, isInternetReachable: null });
      await expect(isOnline()).resolves.toBe(true);
    });

    it('resolves false when not connected', async () => {
      mockFetch.mockResolvedValueOnce({ isConnected: false, isInternetReachable: null });
      await expect(isOnline()).resolves.toBe(false);
    });
  });
});
