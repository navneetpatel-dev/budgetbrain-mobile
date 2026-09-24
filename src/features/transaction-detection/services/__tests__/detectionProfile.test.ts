import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { createSqlJsDriver } from '@/shared/testing/sqlJsDriver';
import { __useDetectionDriverForTests, getKv } from '../store/detectionStore.service';
import { resetMerchantRules, syncLinkedAccountTails, syncMerchantRules } from '../detectionProfile.service';

type AnyFn = (...args: any[]) => any;

jest.mock('@/shared/store', () => {
  const { configureStore } = jest.requireActual<typeof import('@reduxjs/toolkit')>('@reduxjs/toolkit');
  const { transactionDetectionSlice } = jest.requireActual<typeof import('@/shared/store/transactionDetectionSlice')>(
    '@/shared/store/transactionDetectionSlice'
  );
  return { store: configureStore({ reducer: { transactionDetection: transactionDetectionSlice.reducer } }) };
});

const mockFetchRules = jest.fn<AnyFn>();
const mockDeleteRules = jest.fn<AnyFn>();
jest.mock('../../api/detectedTransactions.api', () => ({
  fetchLearnedMerchantRules: (...a: unknown[]) => mockFetchRules(...a),
  deleteLearnedMerchantRules: (...a: unknown[]) => mockDeleteRules(...a),
}));
const mockApiGet = jest.fn<AnyFn>();
jest.mock('@/shared/services/api', () => ({ apiGet: (...a: unknown[]) => mockApiGet(...a) }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { store } = require('@/shared/store') as { store: { getState: () => any; dispatch: AnyFn } };
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { resetLearnedRules } = require('@/shared/store/transactionDetectionSlice');

const NOW = Date.parse('2026-09-24T10:00:00.000Z');
const DAY = 24 * 60 * 60 * 1000;
const ZOMATO = { id: 'r1', merchant: 'zomato', categoryId: 'cat-food', categoryName: 'Food', updatedAt: '2026-09-20T00:00:00.000Z' };

beforeEach(async () => {
  jest.clearAllMocks();
  store.dispatch(resetLearnedRules());
  await __useDetectionDriverForTests(await createSqlJsDriver());
});

describe('learned rules sync (T5.3)', () => {
  it("replaces the device's rules with the server's and keeps the ETag", async () => {
    mockFetchRules.mockResolvedValue({ rules: [ZOMATO], etag: '"r1"' });
    expect(await syncMerchantRules({ now: NOW })).toBe('updated');
    expect(store.getState().transactionDetection.learnedRules).toEqual({ zomato: ZOMATO });
    expect(await getKv('rules_etag')).toBe('"r1"');
    // Without stored rules the ETag isn't sent, so a fresh install always gets the list.
    expect(mockFetchRules).toHaveBeenCalledWith(undefined);
  });

  it('checks at most daily unless forced, and sends the ETag once rules are stored', async () => {
    mockFetchRules.mockResolvedValueOnce({ rules: [ZOMATO], etag: '"r1"' }).mockResolvedValue(null);
    await syncMerchantRules({ now: NOW });
    expect(await syncMerchantRules({ now: NOW + 60_000 })).toBe('skipped');
    expect(await syncMerchantRules({ now: NOW + 60_000, force: true })).toBe('unchanged');
    expect(await syncMerchantRules({ now: NOW + 2 * DAY })).toBe('unchanged');
    expect(mockFetchRules).toHaveBeenCalledTimes(3);
    expect(mockFetchRules).toHaveBeenLastCalledWith('"r1"');
    expect(store.getState().transactionDetection.learnedRules).toEqual({ zomato: ZOMATO });
  });

  it('reset clears the rules on the server before the device, so a sync cannot restore them', async () => {
    mockFetchRules.mockResolvedValue({ rules: [ZOMATO], etag: '"r1"' });
    await syncMerchantRules({ now: NOW });
    mockDeleteRules.mockRejectedValueOnce(new Error('offline'));
    await expect(resetMerchantRules()).rejects.toThrow('offline');
    expect(store.getState().transactionDetection.learnedRules).toEqual({ zomato: ZOMATO });

    mockDeleteRules.mockResolvedValue({ deleted: 1 });
    await resetMerchantRules();
    expect(store.getState().transactionDetection.learnedRules).toEqual({});
    expect(await getKv('rules_etag')).toBeNull();
  });
});

describe('linked account tails (T5.7)', () => {
  it('keeps the last 3–4 digits of each account', async () => {
    mockApiGet.mockResolvedValue({
      accounts: [{ accountNumberLast4: '1234' }, { accountNumberLast4: 'xx 987' }, { accountNumberLast4: null }, { accountNumberLast4: '12' }],
    });
    await syncLinkedAccountTails();
    expect(store.getState().transactionDetection.linkedAccountTails).toEqual(['1234', '987']);
  });
});
