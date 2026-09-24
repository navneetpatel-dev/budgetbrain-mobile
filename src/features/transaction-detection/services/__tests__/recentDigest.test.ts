import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { createSqlJsDriver } from '@/shared/testing/sqlJsDriver';
import type { Transaction } from '@/shared/types';
import { __useDetectionDriverForTests, clearDetectionData, getKv } from '../store/detectionStore.service';
import { loadRecentDigest, refreshRecentDigest, RECENT_DIGEST_KEY } from '../recentDigest.service';
import { evaluateMessage, processMessages } from '../transactionPipeline.service';
import type { DetectionContext } from '../../types/transactionDetection.types';

const NOW = Date.parse('2026-09-23T10:00:00.000Z');
const MINUTE = 60 * 1000;
const DEBIT = 'Rs.1,250.00 debited from a/c **1234 on 23-09-26 to VPA swiggy@icici Ref 425612345678. Avl Bal Rs 20,500.00';
const sms = { sender: 'VM-HDFCBK', body: DEBIT, receivedAt: '2026-09-23T04:30:00.000Z', source: 'android_sms' as const };
const context: DetectionContext = {
  userId: 'user-1',
  isAutoTrackingEnabled: true,
  selectedSimSlot: 'all',
  excludedMerchants: [],
  excludedAccountTails: [],
  learnedRules: {},
  notificationPreference: 'all',
};

function manual(id: string, amount: number, date = '2026-09-22'): Transaction {
  return { id, type: 'expense', amount, currency: 'INR', categoryId: null, notes: null, merchant: 'Lunch', date, paymentMethod: null, source: 'manual' };
}

beforeEach(async () => {
  await __useDetectionDriverForTests(await createSqlJsDriver());
});

describe('recent-transaction digest (T3.7, T3.12)', () => {
  it('fetches the last ten days, at most two pages, and refreshes at most every 15 minutes', async () => {
    const fetchPage = jest.fn(async (_start: string, page: number, limit: number) =>
      page === 1 ? Array.from({ length: limit }, (_, i) => manual(`p1-${i}`, 100 + i)) : [manual('p2', 5)]
    );
    expect(await refreshRecentDigest(fetchPage, 'user-1', { now: NOW })).toBe(true);
    expect(fetchPage.mock.calls.map((c) => [c[0], c[1]])).toEqual([
      ['2026-09-13', 1],
      ['2026-09-13', 2],
    ]);
    expect(await loadRecentDigest('user-1', NOW)).toHaveLength(101);

    expect(await refreshRecentDigest(fetchPage, 'user-1', { now: NOW + 10 * MINUTE })).toBe(false);
    expect(await refreshRecentDigest(fetchPage, 'user-2', { now: NOW + 10 * MINUTE })).toBe(true);
  });

  it("never hands one user's digest to another, nor a stale one, and 'delete my data' removes it", async () => {
    await refreshRecentDigest(async () => [manual('m1', 1250)], 'user-1', { now: NOW });
    expect(await loadRecentDigest('user-2', NOW)).toEqual([]);
    expect(await loadRecentDigest('user-1', NOW + 15 * 24 * 60 * MINUTE)).toEqual([]);
    await clearDetectionData();
    expect(await getKv(RECENT_DIGEST_KEY)).toBeNull();
  });

  it('an alert for something entered by hand the day before is held for review, not auto-added', async () => {
    expect(evaluateMessage(sms, context)).toMatchObject({ ok: true, payload: { confidenceTier: 'high' } });

    await refreshRecentDigest(async () => [manual('m1', 1250)], 'user-1', { now: NOW });
    const [payload] = await processMessages([sms], context, { now: NOW });
    expect(payload).toMatchObject({ confidenceTier: 'medium' });

    // A different amount is a different transaction (cleared first so the message isn't a repeat).
    await clearDetectionData();
    await refreshRecentDigest(async () => [manual('m1', 1300)], 'user-1', { now: NOW });
    const [other] = await processMessages([sms], context, { now: NOW });
    expect(other).toMatchObject({ confidenceTier: 'high' });
  });
});
