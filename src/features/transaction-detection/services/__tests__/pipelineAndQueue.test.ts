import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { computeFingerprint } from '@budgetbrain/detection-core';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

type AnyFn = (...args: any[]) => any;

const mockNetFetch = jest.fn<AnyFn>();
jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: { fetch: (...args: unknown[]) => mockNetFetch(...args), addEventListener: jest.fn() },
}));

// Minimal store: the real one pulls in immer's ESM build, which jest-expo doesn't transform.
const mockState = {
  auth: { user: { id: 'user-1' } as { id: string } | null },
  transactionDetection: {
    isAutoTrackingEnabled: true,
    selectedSimSlot: 'all',
    excludedMerchants: [] as string[],
    excludedAccountTails: [] as string[],
    learnedRules: {},
    recentFingerprints: [] as string[],
    notificationPreference: 'all',
  },
};
const mockDispatch = jest.fn<AnyFn>((action: { type: string; payload?: unknown }) => {
  if (action.type === 'recordFingerprint') mockState.transactionDetection.recentFingerprints.push(action.payload as string);
});
jest.mock('@/shared/store', () => ({ store: { getState: () => mockState, dispatch: (a: unknown) => mockDispatch(a) } }));
jest.mock('@/shared/store/transactionDetectionSlice', () => ({
  recordFingerprint: (payload: string) => ({ type: 'recordFingerprint', payload }),
  setPendingReviewCount: (payload: number) => ({ type: 'setPendingReviewCount', payload }),
  setSyncStatus: (payload: unknown) => ({ type: 'setSyncStatus', payload }),
}));

const mockSyncBatch = jest.fn<AnyFn>();
const mockFetchSyncState = jest.fn<AnyFn>();
const mockFetchConfig = jest.fn<AnyFn>();
jest.mock('../../api/detectedTransactions.api', () => ({
  syncDetectedBatch: (...args: unknown[]) => mockSyncBatch(...args),
  fetchSyncState: (...args: unknown[]) => mockFetchSyncState(...args),
  fetchDetectionConfig: (...args: unknown[]) => mockFetchConfig(...args),
}));
jest.mock('@/shared/services/queryClient', () => ({ queryClient: {} }));
const mockInvalidate = jest.fn<AnyFn>();
jest.mock('@/shared/services/queryInvalidation', () => ({ invalidateMoneyQueries: (...a: unknown[]) => mockInvalidate(...a) }));
const mockNotify = jest.fn<AnyFn>(() => Promise.resolve());
jest.mock('@/shared/services/notifications', () => ({ showLocalDetectionNotification: (...a: unknown[]) => mockNotify(...a) }));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { processIncomingMessage, processAndQueueMessages } from '../transactionPipeline.service';
import { enqueueDetected, flushDetectedQueue, queuedCount, __resetSyncQueueForTests } from '../syncQueue.service';
import { __resetDetectionConfigForTests } from '../detectionConfig.service';
import type { RawIncomingMessage, SyncItemPayload } from '../../types/transactionDetection.types';

const RECEIVED = '2026-09-23T04:30:00.000Z';

function sms(body: string, sender = 'VM-HDFCBK'): RawIncomingMessage {
  return { sender, body, receivedAt: RECEIVED, source: 'android_sms' };
}

beforeEach(async () => {
  jest.clearAllMocks();
  mockState.auth.user = { id: 'user-1' };
  mockState.transactionDetection.isAutoTrackingEnabled = true;
  mockState.transactionDetection.recentFingerprints = [];
  await AsyncStorage.clear();
  __resetSyncQueueForTests();
  __resetDetectionConfigForTests();
  mockNetFetch.mockResolvedValue({ isConnected: true, isInternetReachable: true });
  mockFetchSyncState.mockResolvedValue({ pendingReviewCount: 3, totalDetectedCount: 5, latestSyncedTransactionDate: null });
  mockFetchConfig.mockResolvedValue({ enabled: true, autoCreateEnabled: true, minAppVersion: null, autoAddHighConfidence: true });
});

describe('processIncomingMessage', () => {
  const debit = 'Rs.1,250.00 debited from a/c **1234 on 23-09-26 to VPA swiggy@icici Ref 425612345678. Avl Bal Rs 20,500.00';

  it('builds a server payload with a decimal-string amount and a core fingerprint', () => {
    const payload = processIncomingMessage(sms(debit));
    expect(payload).not.toBeNull();
    expect(payload).toMatchObject({
      amount: '1250.00',
      currency: 'INR',
      direction: 'DEBIT',
      transactionType: 'expense',
      institutionId: 'in.hdfc_bank',
      accountTail: '1234',
      receivedAt: RECEIVED,
      source: 'android_sms',
    });
    expect(payload!.dedupFingerprint).toBe(
      computeFingerprint({
        userId: 'user-1',
        institutionId: 'in.hdfc_bank',
        accountTail: '1234',
        amountMinor: 125000,
        currency: 'INR',
        direction: 'DEBIT',
        referenceNumber: payload!.referenceNumber,
        transactionDate: payload!.transactionDate,
        receivedAt: RECEIVED,
      })
    );
  });

  it('reports honest evidence: the balance is not a second amount candidate', () => {
    const payload = processIncomingMessage(sms(debit))!;
    expect(payload.evidence).toMatchObject({ institutionVerified: true, amountRoleUnique: true, directionUnambiguous: true });
  });

  it('never sends raw message text', () => {
    const payload = processIncomingMessage(sms(debit))!;
    expect(JSON.stringify(payload)).not.toContain('Avl Bal');
  });

  it('marks unknown senders as unverified, so they can only reach review', () => {
    const payload = processIncomingMessage(sms(debit, 'VM-ABCDEF'));
    expect(payload?.evidence.institutionVerified ?? false).toBe(false);
    expect(payload?.confidenceTier ?? 'medium').not.toBe('high');
  });

  it('drops messages with several amounts instead of guessing (low confidence)', () => {
    expect(processIncomingMessage(sms('Rs 500 and Rs 300 debited from a/c XX1234 on 23-09-26'))).toBeNull();
  });

  it('skips a message it has already processed', () => {
    expect(processIncomingMessage(sms(debit))).not.toBeNull();
    expect(processIncomingMessage(sms(debit))).toBeNull();
  });

  it('does nothing without a signed-in user or with tracking off', () => {
    mockState.auth.user = null;
    expect(processIncomingMessage(sms(debit))).toBeNull();
    mockState.auth.user = { id: 'user-1' };
    mockState.transactionDetection.isAutoTrackingEnabled = false;
    expect(processIncomingMessage(sms(debit))).toBeNull();
  });
});

describe('sync queue', () => {
  function payload(i: number): SyncItemPayload {
    return {
      clientId: `c${i}`,
      amount: '10.00',
      currency: 'INR',
      direction: 'DEBIT',
      transactionType: 'expense',
      subtype: null,
      paymentMethod: null,
      institutionId: 'in.hdfc_bank',
      accountTail: '1234',
      referenceNumber: `REF${i}`,
      merchantName: null,
      merchantId: null,
      taxonomyCode: null,
      categoryId: null,
      categorySource: null,
      financialAccountId: null,
      transactionDate: '2026-09-23',
      receivedAt: RECEIVED,
      evidence: {
        templateMatched: false,
        institutionVerified: true,
        amountRoleUnique: true,
        directionUnambiguous: true,
        merchantKnown: false,
        dateExtracted: true,
        referencePresent: true,
        merchantFuzzy: false,
      },
      confidenceTier: 'high',
      dedupFingerprint: `v2_${String(i).padStart(64, '0')}`,
      source: 'android_sms',
    };
  }

  function answerAll(status: string) {
    mockSyncBatch.mockImplementation(async (...args: unknown[]) => {
      const items = args[0] as SyncItemPayload[];
      return { results: items.map((it) => ({ clientId: it.clientId, fingerprint: it.dedupFingerprint, status })) };
    });
  }

  it('sends at most 100 items per request (gap S3)', async () => {
    answerAll('created');
    await enqueueDetected(Array.from({ length: 250 }, (_, i) => payload(i)), { flush: 'none' });
    const summary = await flushDetectedQueue();
    expect(mockSyncBatch).toHaveBeenCalledTimes(3);
    expect((mockSyncBatch.mock.calls as unknown[][]).map((call) => (call[0] as unknown[]).length)).toEqual([100, 100, 50]);
    expect(summary).toMatchObject({ sent: 250, created: 250, remaining: 0 });
    expect(await queuedCount()).toBe(0);
  });

  it('sends a stable idempotency key per batch', async () => {
    mockSyncBatch.mockRejectedValueOnce(new Error('timeout'));
    await enqueueDetected([payload(1), payload(2)], { flush: 'none' });
    await flushDetectedQueue();
    answerAll('created');
    await flushDetectedQueue();
    const keys = (mockSyncBatch.mock.calls as unknown[][]).map((call) => call[1]);
    expect(keys[0]).toBe(keys[1]);
  });

  it('keeps items when the request fails and retries them later (gap P0-3: never falls back to plain transactions)', async () => {
    mockSyncBatch.mockRejectedValue(new Error('network'));
    await enqueueDetected([payload(1)], { flush: 'none' });
    const failed = await flushDetectedQueue();
    expect(failed.remaining).toBe(1);
    expect(await queuedCount()).toBe(1);

    answerAll('needs_review');
    const retried = await flushDetectedQueue();
    expect(retried).toMatchObject({ needsReview: 1, remaining: 0 });
  });

  it('does not send while offline', async () => {
    mockNetFetch.mockResolvedValue({ isConnected: false });
    await enqueueDetected([payload(1)], { flush: 'none' });
    const summary = await flushDetectedQueue();
    expect(mockSyncBatch).not.toHaveBeenCalled();
    expect(summary.remaining).toBe(1);
  });

  it('drops items the server rejected as invalid instead of retrying them forever', async () => {
    answerAll('validation_error');
    await enqueueDetected([payload(1)], { flush: 'none' });
    const summary = await flushDetectedQueue();
    expect(summary).toMatchObject({ rejected: 1, remaining: 0 });
  });

  it('shows one grouped notification without amounts and refreshes the review count', async () => {
    answerAll('needs_review');
    await enqueueDetected([payload(1), payload(2)], { flush: 'none' });
    await flushDetectedQueue();
    expect(mockNotify).toHaveBeenCalledTimes(1);
    const body = (mockNotify.mock.calls[0][0] as { body: string }).body;
    expect(body).toContain('2 to review');
    expect(body).not.toMatch(/₹|Rs|10\.00/);
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'setPendingReviewCount', payload: 3 });
  });

  it('does not queue the same fingerprint twice', async () => {
    await enqueueDetected([payload(1)], { flush: 'none' });
    await enqueueDetected([payload(1)], { flush: 'none' });
    expect(await queuedCount()).toBe(1);
  });
});

describe('processAndQueueMessages', () => {
  it('respects the server kill switch (T1.16)', async () => {
    mockFetchConfig.mockResolvedValue({ enabled: false, autoCreateEnabled: false, minAppVersion: null, autoAddHighConfidence: true });
    const queued = await processAndQueueMessages(
      [sms('Rs.99.00 debited from a/c **1234 on 23-09-26 Ref 425612349999. Avl Bal Rs 500.00')],
      [],
      { flush: 'none' }
    );
    expect(queued).toBe(0);
    expect(await queuedCount()).toBe(0);
  });
});
