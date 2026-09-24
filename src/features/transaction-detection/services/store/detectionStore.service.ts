import { lifecycleForSyncResult, type LifecycleState, type ReasonCode } from '@budgetbrain/detection-core';
import type { SyncItemPayload, SyncItemResult } from '../../types/transactionDetection.types';
import { openExpoDriver, type SqlDriver, type SqlValue } from './sqlDriver';

/**
 * On-device store for detected transactions (plan T2.8), shared by the foreground app and the
 * headless drain. It replaces the AsyncStorage queue and the Redux fingerprint ring buffer.
 *
 * - `detected_local` holds one row per fingerprint. The UNIQUE fingerprint is the local
 *   duplicate check, so a message seen twice (live and again by a catch-up scan) is stored once.
 *   The payload is kept only until the server answers, then set to NULL (spec §22).
 * - `detection_counters` counts terminal states and reason codes per day. No message text.
 * - `kv` holds small values: the detection context, the last server config, migration flags.
 */

const SCHEMA_VERSION = 1;
const DAY_MS = 24 * 60 * 60 * 1000;
/** A fingerprint is remembered this long after the server answered (plan §3.1 TTL). */
const ANSWERED_TTL_MS = 180 * DAY_MS;
const COUNTER_TTL_DAYS = 30;
const BACKOFF_BASE_MS = 30 * 1000;
const BACKOFF_MAX_MS = 30 * 60 * 1000;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS detected_local (
  client_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  fingerprint TEXT NOT NULL UNIQUE,
  payload TEXT,
  lifecycle TEXT NOT NULL,
  reason TEXT,
  awaiting_review INTEGER NOT NULL DEFAULT 0,
  server_id TEXT,
  transaction_id TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS detected_local_pending
  ON detected_local (user_id, next_attempt_at) WHERE lifecycle = 'SYNC_PENDING';
CREATE INDEX IF NOT EXISTS detected_local_answered
  ON detected_local (updated_at) WHERE lifecycle <> 'SYNC_PENDING';
CREATE TABLE IF NOT EXISTS detection_counters (
  day TEXT NOT NULL,
  state TEXT NOT NULL,
  reason TEXT NOT NULL,
  institution_id TEXT NOT NULL DEFAULT '',
  count INTEGER NOT NULL,
  PRIMARY KEY (day, state, reason, institution_id)
);
CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL);
PRAGMA user_version = ${SCHEMA_VERSION};
`;

/** Where one message ended in the pipeline; counted, never stored with its text. */
export interface PipelineOutcome {
  state: LifecycleState;
  reason: ReasonCode;
  institutionId: string | null;
}

export interface SyncApplySummary {
  created: number;
  needsReview: number;
  alreadySynced: number;
  rejected: number;
  /** Server ids of items now waiting in the review queue, for the notification deep link. */
  reviewIds: string[];
}

let driverPromise: Promise<SqlDriver> | null = null;

function db(): Promise<SqlDriver> {
  if (!driverPromise) {
    driverPromise = openExpoDriver().then(async (driver) => {
      await driver.exec(SCHEMA);
      return driver;
    });
    // A failed open is retried on the next call instead of being cached.
    driverPromise.catch(() => {
      driverPromise = null;
    });
  }
  return driverPromise;
}

export function backoffDelayMs(attempts: number): number {
  return Math.min(BACKOFF_MAX_MS, BACKOFF_BASE_MS * 2 ** Math.max(0, attempts - 1));
}

function utcDay(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

function placeholders(count: number): string {
  return Array.from({ length: count }, () => '?').join(',');
}

async function bumpCounters(driver: SqlDriver, outcomes: PipelineOutcome[], now: number) {
  if (outcomes.length === 0) return;
  const day = utcDay(now);
  const grouped = new Map<string, { outcome: PipelineOutcome; count: number }>();
  for (const outcome of outcomes) {
    const key = `${outcome.state}|${outcome.reason}|${outcome.institutionId ?? ''}`;
    const entry = grouped.get(key);
    if (entry) entry.count += 1;
    else grouped.set(key, { outcome, count: 1 });
  }
  for (const { outcome, count } of grouped.values()) {
    await driver.run(
      `INSERT INTO detection_counters (day, state, reason, institution_id, count) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (day, state, reason, institution_id) DO UPDATE SET count = count + excluded.count`,
      [day, outcome.state, outcome.reason, outcome.institutionId ?? '', count]
    );
  }
}

/**
 * Stores what one pipeline run produced, in one write transaction: new payloads become
 * SYNC_PENDING, repeats of a known fingerprint are counted as DUPLICATE, and every other
 * outcome is counted. Returns the payloads that were new.
 */
export async function saveProcessed(params: {
  userId: string;
  payloads: SyncItemPayload[];
  outcomes: PipelineOutcome[];
  now?: number;
}): Promise<SyncItemPayload[]> {
  const now = params.now ?? Date.now();
  const driver = await db();
  const inserted: SyncItemPayload[] = [];
  const outcomes = [...params.outcomes];
  await driver.transaction(async () => {
    for (const payload of params.payloads) {
      const { changes } = await driver.run(
        `INSERT INTO detected_local (client_id, user_id, fingerprint, payload, lifecycle, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'SYNC_PENDING', ?, ?) ON CONFLICT DO NOTHING`,
        [payload.clientId, params.userId, payload.dedupFingerprint, JSON.stringify(payload), now, now]
      );
      if (changes > 0) inserted.push(payload);
      else outcomes.push({ state: 'DUPLICATE', reason: 'duplicate_fingerprint', institutionId: payload.institutionId });
    }
    await bumpCounters(driver, outcomes, now);
  });
  return inserted;
}

/** Items of this user that are due for sending, oldest first. */
export async function pendingForSync(userId: string, limit: number, now = Date.now()): Promise<SyncItemPayload[]> {
  const driver = await db();
  const rows = await driver.all<{ payload: string }>(
    `SELECT payload FROM detected_local
     WHERE user_id = ? AND lifecycle = 'SYNC_PENDING' AND next_attempt_at <= ? AND payload IS NOT NULL
     ORDER BY created_at LIMIT ?`,
    [userId, now, limit]
  );
  return rows.map((row) => JSON.parse(row.payload) as SyncItemPayload);
}

export async function pendingCount(userId: string): Promise<number> {
  const driver = await db();
  const [row] = await driver.all<{ n: number }>(
    `SELECT COUNT(*) AS n FROM detected_local WHERE user_id = ? AND lifecycle = 'SYNC_PENDING'`,
    [userId]
  );
  return row?.n ?? 0;
}

/** Applies the server's per-item answers in one transaction (core `lifecycleForSyncResult`). */
export async function applySyncResults(results: SyncItemResult[], now = Date.now()): Promise<SyncApplySummary> {
  const summary: SyncApplySummary = { created: 0, needsReview: 0, alreadySynced: 0, rejected: 0, reviewIds: [] };
  if (results.length === 0) return summary;
  const driver = await db();
  const outcomes: PipelineOutcome[] = [];
  await driver.transaction(async () => {
    for (const result of results) {
      const outcome = lifecycleForSyncResult(result.status);
      await driver.run(
        `UPDATE detected_local SET lifecycle = ?, reason = ?, awaiting_review = ?, server_id = ?, transaction_id = ?,
           payload = NULL, updated_at = ?
         WHERE client_id = ? AND lifecycle = 'SYNC_PENDING'`,
        [
          outcome.state,
          outcome.reason,
          outcome.awaitingReview ? 1 : 0,
          result.detectedId ?? null,
          result.transactionId ?? null,
          now,
          result.clientId,
        ]
      );
      if (result.status === 'created') summary.created += 1;
      else if (result.status === 'needs_review') {
        summary.needsReview += 1;
        if (result.detectedId) summary.reviewIds.push(result.detectedId);
      } else if (result.status === 'already_synced') summary.alreadySynced += 1;
      else summary.rejected += 1;
      if (outcome.reason) outcomes.push({ state: outcome.state, reason: outcome.reason, institutionId: null });
    }
    await bumpCounters(driver, outcomes, now);
  });
  return summary;
}

/** Pushes the next attempt back exponentially (30 s → 30 min) for items the server didn't answer. */
export async function markAttemptFailed(clientIds: string[], now = Date.now()): Promise<void> {
  if (clientIds.length === 0) return;
  const driver = await db();
  const rows = await driver.all<{ client_id: string; attempts: number }>(
    `SELECT client_id, attempts FROM detected_local WHERE client_id IN (${placeholders(clientIds.length)})`,
    clientIds
  );
  await driver.transaction(async () => {
    for (const row of rows) {
      const attempts = row.attempts + 1;
      await driver.run(`UPDATE detected_local SET attempts = ?, next_attempt_at = ?, updated_at = ? WHERE client_id = ?`, [
        attempts,
        now + backoffDelayMs(attempts),
        now,
        row.client_id,
      ]);
    }
  });
}

/** Makes every pending item due now, e.g. when the network comes back or the user pulls to refresh. */
export async function resetBackoff(userId: string): Promise<void> {
  const driver = await db();
  await driver.run(`UPDATE detected_local SET next_attempt_at = 0 WHERE user_id = ? AND lifecycle = 'SYNC_PENDING'`, [userId]);
}

/** Weekly cleanup: forgets answered fingerprints after 180 days and counters after 30. */
export async function purgeOld(now = Date.now()): Promise<void> {
  const driver = await db();
  await driver.run(`DELETE FROM detected_local WHERE lifecycle <> 'SYNC_PENDING' AND updated_at < ?`, [now - ANSWERED_TTL_MS]);
  await driver.run(`DELETE FROM detection_counters WHERE day < ?`, [utcDay(now - COUNTER_TTL_DAYS * DAY_MS)]);
}

export async function countersForDay(day: string): Promise<{ state: string; reason: string; institutionId: string; count: number }[]> {
  const driver = await db();
  return driver.all(
    `SELECT state, reason, institution_id AS institutionId, count FROM detection_counters WHERE day = ? ORDER BY state, reason`,
    [day]
  );
}

export async function getKv<T>(key: string): Promise<T | null> {
  const driver = await db();
  const [row] = await driver.all<{ value: string }>(`SELECT value FROM kv WHERE key = ?`, [key]);
  if (!row) return null;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return null;
  }
}

export async function setKv(key: string, value: unknown): Promise<void> {
  const driver = await db();
  await driver.run(`INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value`, [
    key,
    JSON.stringify(value),
  ]);
}

/**
 * One-time import of the Phase 1 state: the AsyncStorage queue becomes pending rows, and the
 * Redux fingerprint ring buffer becomes answered rows so those messages stay deduplicated.
 */
export async function importLegacyState(params: {
  userId: string;
  queued: SyncItemPayload[];
  fingerprints: string[];
  now?: number;
}): Promise<void> {
  const now = params.now ?? Date.now();
  const driver = await db();
  await driver.transaction(async () => {
    for (const payload of params.queued) {
      await driver.run(
        `INSERT INTO detected_local (client_id, user_id, fingerprint, payload, lifecycle, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'SYNC_PENDING', ?, ?) ON CONFLICT DO NOTHING`,
        [payload.clientId, params.userId, payload.dedupFingerprint, JSON.stringify(payload), now, now]
      );
    }
    for (const fingerprint of params.fingerprints) {
      const values: SqlValue[] = [fingerprint.slice(3, 27), params.userId, fingerprint, now, now];
      await driver.run(
        `INSERT INTO detected_local (client_id, user_id, fingerprint, payload, lifecycle, reason, created_at, updated_at)
         VALUES (?, ?, ?, NULL, 'SYNCED', 'duplicate_fingerprint', ?, ?) ON CONFLICT DO NOTHING`,
        values
      );
    }
  });
}

/** Test helper: use this driver (already open) instead of expo-sqlite. */
export async function __useDetectionDriverForTests(driver: SqlDriver | null): Promise<void> {
  if (!driver) {
    driverPromise = null;
    return;
  }
  await driver.exec(SCHEMA);
  driverPromise = Promise.resolve(driver);
}
