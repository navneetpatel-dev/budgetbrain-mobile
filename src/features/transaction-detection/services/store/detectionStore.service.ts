import { lifecycleForSyncResult, type LifecycleState, type ReasonCode } from '@budgetbrain/detection-core';
import type { CorrectedField, SyncItemPayload, SyncItemResult } from '../../types/transactionDetection.types';
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
 * - `skeleton_queue` holds masked message shapes waiting for upload, only while the user has
 *   opted in to template learning (plan T7.4, D-5). A skeleton has no digits and no names.
 *   While opted in, `detected_local.skeleton` keeps each item's shape for 30 days, so a later
 *   correction can be sent with the field the user fixed.
 */

const SCHEMA_VERSION = 3;
const DAY_MS = 24 * 60 * 60 * 1000;
/** A fingerprint is remembered this long after the server answered (plan §3.1 TTL). */
const ANSWERED_TTL_MS = 180 * DAY_MS;
const COUNTER_TTL_DAYS = 30;
const SKELETON_TTL_MS = 30 * DAY_MS;
/** Queued shapes beyond this are dropped; the same shape from other users fills the gap. */
const MAX_QUEUED_SKELETONS = 200;
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
  skeleton TEXT,
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
CREATE TABLE IF NOT EXISTS skeleton_queue (
  hash TEXT PRIMARY KEY,
  skeleton TEXT NOT NULL,
  institution_id TEXT,
  sender_key TEXT NOT NULL,
  country TEXT,
  corrected_field TEXT,
  created_at INTEGER NOT NULL
);
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

/** Columns added after a table first shipped; CREATE TABLE IF NOT EXISTS doesn't add them. */
const ADDED_COLUMNS: { table: string; column: string; type: string }[] = [
  { table: 'detected_local', column: 'skeleton', type: 'TEXT' },
  { table: 'skeleton_queue', column: 'corrected_field', type: 'TEXT' },
];

async function prepare(driver: SqlDriver): Promise<void> {
  await driver.exec(SCHEMA);
  for (const { table, column, type } of ADDED_COLUMNS) {
    const columns = await driver.all<{ name: string }>(`PRAGMA table_info(${table})`);
    if (!columns.some((c) => c.name === column)) await driver.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  }
}

function db(): Promise<SqlDriver> {
  if (!driverPromise) {
    driverPromise = openExpoDriver().then(async (driver) => {
      await prepare(driver);
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
  /** Masked shapes by client id, kept only while template learning is on. */
  skeletons?: Map<string, QueuedSkeleton>;
  now?: number;
}): Promise<SyncItemPayload[]> {
  const now = params.now ?? Date.now();
  const driver = await db();
  const inserted: SyncItemPayload[] = [];
  const outcomes = [...params.outcomes];
  await driver.transaction(async () => {
    for (const payload of params.payloads) {
      const { changes } = await driver.run(
        `INSERT INTO detected_local (client_id, user_id, fingerprint, payload, lifecycle, skeleton, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'SYNC_PENDING', ?, ?, ?) ON CONFLICT DO NOTHING`,
        [
          payload.clientId,
          params.userId,
          payload.dedupFingerprint,
          JSON.stringify(payload),
          skeletonJson(params.skeletons?.get(payload.clientId)),
          now,
          now,
        ]
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

/** An item detected on this device that hasn't reached the server yet (plan T5.1, offline review). */
export interface LocalPendingItem {
  payload: SyncItemPayload;
  createdAt: number;
}

export async function listLocalPending(userId: string, limit = 100): Promise<LocalPendingItem[]> {
  const driver = await db();
  const rows = await driver.all<{ payload: string; created_at: number }>(
    `SELECT payload, created_at FROM detected_local
     WHERE user_id = ? AND lifecycle = 'SYNC_PENDING' AND payload IS NOT NULL
     ORDER BY created_at DESC LIMIT ?`,
    [userId, limit]
  );
  return rows.map((row) => ({ payload: JSON.parse(row.payload) as SyncItemPayload, createdAt: row.created_at }));
}

/**
 * The user deleted an item before it synced: it is never sent, and its fingerprint stays so the
 * same message isn't detected again.
 */
export async function discardLocal(clientId: string, now = Date.now()): Promise<void> {
  const driver = await db();
  await driver.run(
    `UPDATE detected_local SET lifecycle = 'IGNORED', reason = NULL, payload = NULL, updated_at = ?
     WHERE client_id = ? AND lifecycle = 'SYNC_PENDING'`,
    [now, clientId]
  );
}

/** "Delete my detected data" and turning detection off (plan T5.7): items, fingerprints and counters. */
export async function clearDetectionData(): Promise<void> {
  const driver = await db();
  await driver.transaction(async () => {
    await driver.run(`DELETE FROM detected_local`);
    await driver.run(`DELETE FROM detection_counters`);
    await driver.run(`DELETE FROM skeleton_queue`);
  });
}

function skeletonJson(skeleton: QueuedSkeleton | undefined): string | null {
  return skeleton ? JSON.stringify({ ...skeleton, correctedField: null }) : null;
}

/** Weekly cleanup: forgets answered fingerprints after 180 days and counters after 30. */
export async function purgeOld(now = Date.now()): Promise<void> {
  const driver = await db();
  await driver.run(`DELETE FROM detected_local WHERE lifecycle <> 'SYNC_PENDING' AND updated_at < ?`, [now - ANSWERED_TTL_MS]);
  await driver.run(`DELETE FROM detection_counters WHERE day < ?`, [utcDay(now - COUNTER_TTL_DAYS * DAY_MS)]);
  await driver.run(`DELETE FROM skeleton_queue WHERE created_at < ?`, [now - SKELETON_TTL_MS]);
  await driver.run(`UPDATE detected_local SET skeleton = NULL WHERE skeleton IS NOT NULL AND created_at < ?`, [
    now - SKELETON_TTL_MS,
  ]);
}

export interface DiagnosticsRow {
  day: string;
  stage: LifecycleState;
  reasonCode: ReasonCode;
  institutionId: string | null;
  count: number;
}

/** Counter rows of the finished days after `afterDay` (exclusive) and before today (plan T7.1). */
export async function countersForUpload(afterDay: string | null, now = Date.now()): Promise<DiagnosticsRow[]> {
  const driver = await db();
  const rows = await driver.all<{ day: string; state: string; reason: string; institution_id: string; count: number }>(
    `SELECT day, state, reason, institution_id, count FROM detection_counters
     WHERE day > ? AND day < ? ORDER BY day, state, reason, institution_id`,
    [afterDay ?? '', utcDay(now)]
  );
  return rows.map((row) => ({
    day: row.day,
    stage: row.state as LifecycleState,
    reasonCode: row.reason as ReasonCode,
    institutionId: row.institution_id || null,
    count: row.count,
  }));
}

/** A masked message shape waiting for upload (plan T7.4). */
export interface QueuedSkeleton {
  hash: string;
  skeleton: string;
  institutionId: string | null;
  senderKey: string;
  country: string | null;
  /** What the user fixed in an item parsed from this shape, if anything. */
  correctedField?: CorrectedField | null;
}


/** Queues shapes once each; a shape already queued, or a full queue, is skipped. */
export async function queueSkeletons(skeletons: QueuedSkeleton[], now = Date.now()): Promise<void> {
  if (skeletons.length === 0) return;
  const driver = await db();
  await driver.transaction(async () => {
    const [row] = await driver.all<{ n: number }>(`SELECT COUNT(*) AS n FROM skeleton_queue`);
    let room = MAX_QUEUED_SKELETONS - (row?.n ?? 0);
    for (const item of skeletons) {
      if (room <= 0) break;
      const { changes } = await driver.run(
        `INSERT INTO skeleton_queue (hash, skeleton, institution_id, sender_key, country, corrected_field, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
        [item.hash, item.skeleton, item.institutionId, item.senderKey, item.country, item.correctedField ?? null, now]
      );
      room -= changes;
    }
  });
}

export async function queuedSkeletons(limit: number): Promise<QueuedSkeleton[]> {
  const driver = await db();
  const rows = await driver.all<{
    hash: string;
    skeleton: string;
    institution_id: string | null;
    sender_key: string;
    country: string | null;
    corrected_field: CorrectedField | null;
  }>(
    `SELECT hash, skeleton, institution_id, sender_key, country, corrected_field FROM skeleton_queue ORDER BY created_at LIMIT ?`,
    [limit]
  );
  return rows.map((row) => ({
    hash: row.hash,
    skeleton: row.skeleton,
    institutionId: row.institution_id,
    senderKey: row.sender_key,
    country: row.country,
    correctedField: row.corrected_field,
  }));
}

export async function removeSkeletons(hashes: string[]): Promise<void> {
  if (hashes.length === 0) return;
  const driver = await db();
  await driver.run(`DELETE FROM skeleton_queue WHERE hash IN (${placeholders(hashes.length)})`, hashes);
}

/**
 * The user corrected `field` in the item the server knows as `serverId` (plan T7.4): queues
 * that item's shape again naming the field. Returns false when the item has no stored shape
 * (template learning was off when it was detected, or it came from another device).
 */
export async function queueCorrection(serverId: string, field: CorrectedField, now = Date.now()): Promise<boolean> {
  const driver = await db();
  const [row] = await driver.all<{ skeleton: string }>(
    `SELECT skeleton FROM detected_local WHERE server_id = ? AND skeleton IS NOT NULL LIMIT 1`,
    [serverId]
  );
  if (!row) return false;
  let shape: QueuedSkeleton;
  try {
    shape = JSON.parse(row.skeleton) as QueuedSkeleton;
  } catch {
    return false;
  }
  // A correction replaces a queued plain copy of the shape; it is never dropped for room.
  await driver.run(
    `INSERT INTO skeleton_queue (hash, skeleton, institution_id, sender_key, country, corrected_field, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT (hash) DO UPDATE SET corrected_field = excluded.corrected_field`,
    [shape.hash, shape.skeleton, shape.institutionId, shape.senderKey, shape.country, field, now]
  );
  return true;
}

/** Turning template learning off drops every shape not yet sent, and the ones kept per item. */
export async function clearSkeletons(): Promise<void> {
  const driver = await db();
  await driver.transaction(async () => {
    await driver.run(`DELETE FROM skeleton_queue`);
    await driver.run(`UPDATE detected_local SET skeleton = NULL WHERE skeleton IS NOT NULL`);
  });
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
  await prepare(driver);
  driverPromise = Promise.resolve(driver);
}
