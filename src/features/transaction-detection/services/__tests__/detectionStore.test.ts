import { beforeEach, describe, expect, it } from '@jest/globals';
import { createSqlJsDriver, makeSyncPayload } from '@/shared/testing/sqlJsDriver';
import {
  __useDetectionDriverForTests,
  applySyncResults,
  backoffDelayMs,
  countersForDay,
  getKv,
  importLegacyState,
  markAttemptFailed,
  pendingCount,
  pendingForSync,
  purgeOld,
  saveProcessed,
  setKv,
} from '../store/detectionStore.service';

const NOW = Date.parse('2026-09-24T10:00:00.000Z');
const DAY = '2026-09-24';

beforeEach(async () => {
  await __useDetectionDriverForTests(await createSqlJsDriver());
});

describe('detection store (T2.8)', () => {
  it('stores a fingerprint once and counts the repeat as a duplicate', async () => {
    const first = await saveProcessed({ userId: 'u1', payloads: [makeSyncPayload(1)], outcomes: [], now: NOW });
    const again = await saveProcessed({ userId: 'u1', payloads: [makeSyncPayload(1)], outcomes: [], now: NOW });
    expect(first).toHaveLength(1);
    expect(again).toHaveLength(0);
    expect(await pendingCount('u1')).toBe(1);
    expect(await countersForDay(DAY)).toEqual([
      { state: 'DUPLICATE', reason: 'duplicate_fingerprint', institutionId: 'in.hdfc_bank', count: 1 },
    ]);
  });

  it('counts pipeline outcomes by state, reason and institution', async () => {
    await saveProcessed({
      userId: 'u1',
      payloads: [],
      outcomes: [
        { state: 'INELIGIBLE', reason: 'otp_marker', institutionId: 'in.hdfc_bank' },
        { state: 'INELIGIBLE', reason: 'otp_marker', institutionId: 'in.hdfc_bank' },
        { state: 'PARSE_FAILED', reason: 'no_amount', institutionId: null },
      ],
      now: NOW,
    });
    expect(await countersForDay(DAY)).toEqual([
      { state: 'INELIGIBLE', reason: 'otp_marker', institutionId: 'in.hdfc_bank', count: 2 },
      { state: 'PARSE_FAILED', reason: 'no_amount', institutionId: '', count: 1 },
    ]);
  });

  it("returns only this user's due items, oldest first", async () => {
    await saveProcessed({ userId: 'u1', payloads: [makeSyncPayload(1)], outcomes: [], now: NOW });
    await saveProcessed({ userId: 'u1', payloads: [makeSyncPayload(2)], outcomes: [], now: NOW + 1 });
    await saveProcessed({ userId: 'u2', payloads: [makeSyncPayload(3)], outcomes: [], now: NOW });
    expect((await pendingForSync('u1', 10, NOW + 1)).map((p) => p.clientId)).toEqual(['c1', 'c2']);
    expect((await pendingForSync('u2', 10, NOW + 1)).map((p) => p.clientId)).toEqual(['c3']);
  });

  it('applies server results with the core lifecycle mapping and drops the payload', async () => {
    const payloads = [1, 2, 3, 4].map((i) => makeSyncPayload(i));
    await saveProcessed({ userId: 'u1', payloads, outcomes: [], now: NOW });
    const summary = await applySyncResults(
      [
        { clientId: 'c1', fingerprint: 'x', status: 'created', detectedId: 'd1', transactionId: 't1' },
        { clientId: 'c2', fingerprint: 'x', status: 'needs_review', detectedId: 'd2' },
        { clientId: 'c3', fingerprint: 'x', status: 'already_synced' },
        { clientId: 'c4', fingerprint: 'x', status: 'validation_error', error: 'bad' },
      ],
      NOW
    );
    expect(summary).toEqual({ created: 1, needsReview: 1, alreadySynced: 1, rejected: 1, reviewIds: ['d2'] });
    expect(await pendingCount('u1')).toBe(0);
    expect(await pendingForSync('u1', 10, NOW)).toEqual([]);
    const counters = await countersForDay(DAY);
    expect(counters).toContainEqual({ state: 'IGNORED', reason: 'server_rejected', institutionId: '', count: 1 });
    expect(counters).toContainEqual({ state: 'SYNCED', reason: 'auto_created', institutionId: '', count: 1 });
  });

  it('backs off exponentially from 30 s to at most 30 min', async () => {
    expect(backoffDelayMs(1)).toBe(30_000);
    expect(backoffDelayMs(2)).toBe(60_000);
    expect(backoffDelayMs(20)).toBe(30 * 60_000);

    await saveProcessed({ userId: 'u1', payloads: [makeSyncPayload(1)], outcomes: [], now: NOW });
    await markAttemptFailed(['c1'], NOW);
    expect(await pendingForSync('u1', 10, NOW + 29_000)).toHaveLength(0);
    expect(await pendingForSync('u1', 10, NOW + 30_000)).toHaveLength(1);
    await markAttemptFailed(['c1'], NOW);
    expect(await pendingForSync('u1', 10, NOW + 30_000)).toHaveLength(0);
    expect(await pendingForSync('u1', 10, NOW + 60_000)).toHaveLength(1);
  });

  it('forgets answered fingerprints after 180 days but keeps pending items', async () => {
    await saveProcessed({ userId: 'u1', payloads: [makeSyncPayload(1), makeSyncPayload(2)], outcomes: [], now: NOW });
    await applySyncResults([{ clientId: 'c1', fingerprint: 'x', status: 'created' }], NOW);
    await purgeOld(NOW + 181 * 24 * 60 * 60 * 1000);
    // c1 is forgotten, so the same message could be stored again; c2 is still pending.
    expect(await saveProcessed({ userId: 'u1', payloads: [makeSyncPayload(1)], outcomes: [], now: NOW })).toHaveLength(1);
    expect(await pendingCount('u1')).toBe(2);
  });

  it('imports the Phase 1 queue and fingerprints once', async () => {
    const fingerprint = makeSyncPayload(9).dedupFingerprint;
    await importLegacyState({ userId: 'u1', queued: [makeSyncPayload(1)], fingerprints: [fingerprint], now: NOW });
    expect(await pendingCount('u1')).toBe(1);
    // The imported fingerprint still deduplicates.
    expect(await saveProcessed({ userId: 'u1', payloads: [makeSyncPayload(9)], outcomes: [], now: NOW })).toHaveLength(0);
  });

  it('keeps small JSON values in kv', async () => {
    expect(await getKv('missing')).toBeNull();
    await setKv('k', { a: 1 });
    await setKv('k', { a: 2 });
    expect(await getKv('k')).toEqual({ a: 2 });
  });
});
