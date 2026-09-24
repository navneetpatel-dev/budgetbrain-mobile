import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { createSqlJsDriver, makeSyncPayload } from '@/shared/testing/sqlJsDriver';
import { __useDetectionDriverForTests, pendingCount, saveProcessed } from '../store/detectionStore.service';
import { __resetSyncManagerForTests, runDetectionSync } from '../syncManager.service';
import type { DetectionTransport, SyncItemPayload, SyncItemResult } from '../../types/transactionDetection.types';

type SyncFn = DetectionTransport['syncBatch'];

let clock = Date.parse('2026-09-24T10:00:00.000Z');
const now = () => clock;

function transport(syncBatch: SyncFn, online = true): DetectionTransport {
  return {
    isOnline: async () => online,
    syncBatch,
    fetchConfig: async () => ({ enabled: true, autoCreateEnabled: true, minAppVersion: null, autoAddHighConfidence: true }),
  };
}

function answerAll(status: SyncItemResult['status']) {
  return jest.fn<SyncFn>(async (items: SyncItemPayload[]) => ({
    results: items.map((item, i) => ({
      clientId: item.clientId,
      fingerprint: item.dedupFingerprint,
      status,
      detectedId: `d-${item.clientId}-${i}`,
    })),
  }));
}

async function store(count: number, userId = 'u1') {
  const payloads = Array.from({ length: count }, (_, i) => makeSyncPayload(i + (userId === 'u1' ? 0 : 10_000)));
  await saveProcessed({ userId, payloads, outcomes: [], now: clock });
}

beforeEach(async () => {
  clock = Date.parse('2026-09-24T10:00:00.000Z');
  __resetSyncManagerForTests();
  await __useDetectionDriverForTests(await createSqlJsDriver());
});

describe('sync manager (T2.9)', () => {
  it('sends at most 100 items per request (gap S3)', async () => {
    await store(250);
    const sync = answerAll('created');
    const summary = await runDetectionSync(transport(sync), 'u1', { now });
    expect(sync.mock.calls.map(([items]) => items.length)).toEqual([100, 100, 50]);
    expect(summary).toMatchObject({ sent: 250, created: 250, remaining: 0, failed: false });
  });

  it('stops after maxRequests so a headless run makes one request', async () => {
    await store(150);
    const sync = answerAll('created');
    const summary = await runDetectionSync(transport(sync), 'u1', { now, maxRequests: 1 });
    expect(sync).toHaveBeenCalledTimes(1);
    expect(summary.remaining).toBe(50);
  });

  it('keeps items when the request fails, backs off, then sends them with the same key', async () => {
    await store(2);
    const failing = jest.fn<SyncFn>(async () => {
      throw new Error('timeout');
    });
    const failed = await runDetectionSync(transport(failing), 'u1', { now });
    expect(failed).toMatchObject({ failed: true, remaining: 2 });

    const sync = answerAll('needs_review');
    // Still backing off: nothing is sent.
    await runDetectionSync(transport(sync), 'u1', { now });
    expect(sync).not.toHaveBeenCalled();

    clock += 30_000;
    const retried = await runDetectionSync(transport(sync), 'u1', { now });
    expect(retried).toMatchObject({ needsReview: 2, remaining: 0 });
    expect(retried.reviewIds).toHaveLength(2);
    expect(sync.mock.calls[0][1]).toBe(failing.mock.calls[0][1]);
  });

  it('does not send while offline', async () => {
    await store(1);
    const sync = answerAll('created');
    const summary = await runDetectionSync(transport(sync, false), 'u1', { now });
    expect(sync).not.toHaveBeenCalled();
    expect(summary.remaining).toBe(1);
  });

  it('drops items the server rejected as invalid instead of retrying them forever', async () => {
    await store(1);
    const summary = await runDetectionSync(transport(answerAll('validation_error')), 'u1', { now });
    expect(summary).toMatchObject({ rejected: 1, remaining: 0 });
  });

  it('counts already-synced items as done', async () => {
    await store(1);
    const summary = await runDetectionSync(transport(answerAll('already_synced')), 'u1', { now });
    expect(summary).toMatchObject({ alreadySynced: 1, remaining: 0 });
  });

  it('retries items the server left out of its answer', async () => {
    await store(2);
    const partial = jest.fn<SyncFn>(async (items: SyncItemPayload[]) => ({
      results: [{ clientId: items[0].clientId, fingerprint: items[0].dedupFingerprint, status: 'created' as const }],
    }));
    const summary = await runDetectionSync(transport(partial), 'u1', { now });
    expect(summary).toMatchObject({ created: 1, remaining: 1, failed: true });
  });

  it("never sends another user's items", async () => {
    await store(1, 'u1');
    await store(1, 'u2');
    const sync = answerAll('created');
    await runDetectionSync(transport(sync), 'u2', { now });
    expect(sync.mock.calls[0][0].map((item) => item.clientId)).toEqual(['c10000']);
    expect(await pendingCount('u1')).toBe(1);
  });
});
