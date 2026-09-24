import type { ConfirmPayload } from '../api/detectedTransactions.api';
import type { DiagnosticsUploadRow, SkeletonUploadItem } from '../types/transactionDetection.types';
import { correctedFieldOf } from '../utils/confirmOverrides';
import { getStoredDetectionConfig } from './detectionConfig.service';
import {
  clearSkeletons,
  countersForUpload,
  getKv,
  queueCorrection,
  queuedSkeletons,
  removeSkeletons,
  setKv,
  type DiagnosticsRow,
} from './store/detectionStore.service';

/**
 * Uploads what the device counted (plan T7.1) and, with template learning on, the queued masked
 * shapes (plan T7.4). Foreground only, after a sync; the headless drain keeps to one request.
 *
 * Diagnostics go once a day: every finished day after the last uploaded one. The server
 * replaces each day it receives, so a day is never split across two requests and a retry after
 * a lost response is harmless.
 */
export interface TelemetryUploader {
  uploadDiagnostics(rows: DiagnosticsUploadRow[]): Promise<unknown>;
  uploadSkeletons(items: SkeletonUploadItem[]): Promise<unknown>;
  /** The API error code of a failed request, if any. */
  errorCode(error: unknown): string | undefined;
}

const UPLOADED_THROUGH_KEY = 'diagnostics_uploaded_through';
/** Server limits (backend DETECTION_LIMITS). */
const MAX_ROWS_PER_UPLOAD = 2000;
const MAX_SKELETONS_PER_UPLOAD = 50;
const MAX_SKELETON_UPLOADS_PER_RUN = 4;

/** Groups rows into requests of whole days, each at most `max` rows (a larger day is cut). */
export function diagnosticsBatches(rows: DiagnosticsRow[], max = MAX_ROWS_PER_UPLOAD): DiagnosticsRow[][] {
  const byDay = new Map<string, DiagnosticsRow[]>();
  for (const row of rows) {
    const day = byDay.get(row.day);
    if (day) day.push(row);
    else byDay.set(row.day, [row]);
  }
  const batches: DiagnosticsRow[][] = [];
  let current: DiagnosticsRow[] = [];
  for (const dayRows of byDay.values()) {
    const rowsOfDay = dayRows.slice(0, max);
    if (current.length + rowsOfDay.length > max) {
      batches.push(current);
      current = [];
    }
    current.push(...rowsOfDay);
  }
  if (current.length > 0) batches.push(current);
  return batches;
}

export async function uploadDiagnostics(uploader: TelemetryUploader, now = Date.now()): Promise<number> {
  const uploadedThrough = await getKv<string>(UPLOADED_THROUGH_KEY);
  const rows = await countersForUpload(uploadedThrough, now);
  let sent = 0;
  for (const batch of diagnosticsBatches(rows)) {
    await uploader.uploadDiagnostics(batch);
    sent += batch.length;
    await setKv(UPLOADED_THROUGH_KEY, batch[batch.length - 1].day);
  }
  return sent;
}

export async function uploadSkeletons(uploader: TelemetryUploader, enabled: boolean): Promise<number> {
  if (!enabled) {
    await clearSkeletons();
    return 0;
  }
  let sent = 0;
  for (let i = 0; i < MAX_SKELETON_UPLOADS_PER_RUN; i += 1) {
    const queued = await queuedSkeletons(MAX_SKELETONS_PER_UPLOAD);
    if (queued.length === 0) break;
    try {
      await uploader.uploadSkeletons(
        queued.map((item) => ({
          skeletonHash: item.hash,
          skeleton: item.skeleton,
          institutionId: item.institutionId,
          senderKey: item.senderKey,
          country: item.country,
          language: null,
          correctedField: item.correctedField ?? null,
        }))
      );
    } catch (error) {
      // Turned off on another device: nothing queued here may be sent.
      if (uploader.errorCode(error) === 'TEMPLATE_LEARNING_OFF') await clearSkeletons();
      throw error;
    }
    await removeSkeletons(queued.map((item) => item.hash));
    sent += queued.length;
  }
  return sent;
}

/** Both uploads, each best effort. `templateLearning: null` (setting unknown) leaves the queue alone. */
export async function uploadDetectionTelemetry(
  uploader: TelemetryUploader,
  options: { templateLearning: boolean | null; now?: number }
): Promise<void> {
  await uploadDiagnostics(uploader, options.now).catch(() => {});
  if (options.templateLearning !== null) await uploadSkeletons(uploader, options.templateLearning).catch(() => {});
}

/**
 * After the user confirms an item with changes (plan T7.4): if template learning is on and the
 * change fixed something the parser read, queue that item's shape naming the field. It goes out
 * with the next upload. Returns whether anything was queued.
 */
export async function reportCorrection(serverId: string, overrides: ConfirmPayload): Promise<boolean> {
  const field = correctedFieldOf(overrides);
  if (!field) return false;
  const config = await getStoredDetectionConfig();
  if (config?.templateLearning !== true) return false;
  return queueCorrection(serverId, field);
}
