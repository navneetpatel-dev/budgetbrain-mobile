import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { createSqlJsDriver } from '@/shared/testing/sqlJsDriver';
import {
  __useDetectionDriverForTests,
  clearDetectionData,
  getKv,
  purgeOld,
  queueSkeletons,
  queuedSkeletons,
  saveProcessed,
  type QueuedSkeleton,
} from '../store/detectionStore.service';
import {
  diagnosticsBatches,
  uploadDetectionTelemetry,
  uploadDiagnostics,
  uploadSkeletons,
  type TelemetryUploader,
} from '../detectionTelemetry.service';
import type { DiagnosticsUploadRow, SkeletonUploadItem } from '../../types/transactionDetection.types';

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = Date.parse('2026-09-24T10:00:00.000Z');

function uploader(overrides: Partial<TelemetryUploader> = {}) {
  const diagnostics: DiagnosticsUploadRow[][] = [];
  const skeletons: SkeletonUploadItem[][] = [];
  const value: TelemetryUploader = {
    uploadDiagnostics: jest.fn(async (rows: DiagnosticsUploadRow[]) => {
      diagnostics.push(rows);
    }),
    uploadSkeletons: jest.fn(async (items: SkeletonUploadItem[]) => {
      skeletons.push(items);
    }),
    errorCode: (error) => (error as { code?: string }).code,
    ...overrides,
  };
  return { value, diagnostics, skeletons };
}

function shape(n: number): QueuedSkeleton {
  return {
    hash: n.toString(16).padStart(64, '0'),
    skeleton: `Rs.<AMT> debited from a/c <ACCT> shape ${'x'.repeat(n % 5)}`,
    institutionId: 'in.hdfc_bank',
    senderKey: 'HDFCBK',
    country: 'IN',
  };
}

async function count(day: number, reason: 'otp_marker' | 'promo_marker', institutionId: string | null = 'in.hdfc_bank') {
  await saveProcessed({
    userId: 'u1',
    payloads: [],
    outcomes: [{ state: 'INELIGIBLE', reason, institutionId }],
    now: NOW - day * DAY_MS,
  });
}

beforeEach(async () => {
  await __useDetectionDriverForTests(await createSqlJsDriver());
});

describe('diagnostics upload (T7.1)', () => {
  it('sends finished days once, never today, and remembers how far it got', async () => {
    await count(2, 'otp_marker');
    await count(1, 'otp_marker');
    await count(1, 'promo_marker', null);
    await count(0, 'otp_marker');
    const first = uploader();

    expect(await uploadDiagnostics(first.value, NOW)).toBe(3);
    expect(first.diagnostics).toEqual([
      [
        { day: '2026-09-22', stage: 'INELIGIBLE', reasonCode: 'otp_marker', institutionId: 'in.hdfc_bank', count: 1 },
        { day: '2026-09-23', stage: 'INELIGIBLE', reasonCode: 'otp_marker', institutionId: 'in.hdfc_bank', count: 1 },
        { day: '2026-09-23', stage: 'INELIGIBLE', reasonCode: 'promo_marker', institutionId: null, count: 1 },
      ],
    ]);
    expect(await getKv('diagnostics_uploaded_through')).toBe('2026-09-23');

    const again = uploader();
    expect(await uploadDiagnostics(again.value, NOW)).toBe(0);
    expect(again.value.uploadDiagnostics).not.toHaveBeenCalled();

    // The next day, only the day that just finished goes.
    const tomorrow = uploader();
    expect(await uploadDiagnostics(tomorrow.value, NOW + DAY_MS)).toBe(1);
    expect(tomorrow.diagnostics[0][0].day).toBe('2026-09-24');
  });

  it('keeps the watermark when an upload fails, so the day is sent again', async () => {
    await count(1, 'otp_marker');
    const failing = uploader({ uploadDiagnostics: async () => Promise.reject(new Error('offline')) });
    await expect(uploadDiagnostics(failing.value, NOW)).rejects.toThrow('offline');
    expect(await getKv('diagnostics_uploaded_through')).toBeNull();
    expect(await uploadDiagnostics(uploader().value, NOW)).toBe(1);
  });

  it('never splits a day across two requests (the server replaces each day it receives)', () => {
    const rows = ['a', 'a', 'b', 'b', 'b', 'c'].map((day) => ({
      day,
      stage: 'INELIGIBLE' as const,
      reasonCode: 'otp_marker' as const,
      institutionId: null,
      count: 1,
    }));
    expect(diagnosticsBatches(rows, 4).map((batch) => batch.map((row) => row.day).join(''))).toEqual(['aa', 'bbbc']);
    expect(diagnosticsBatches(rows, 2).map((batch) => batch.map((row) => row.day).join(''))).toEqual(['aa', 'bb', 'c']);
  });
});

describe('skeleton upload (T7.4)', () => {
  it('sends queued shapes in batches of 50 and removes what the server took', async () => {
    await queueSkeletons(Array.from({ length: 60 }, (_, i) => shape(i + 1)), NOW);
    const up = uploader();
    expect(await uploadSkeletons(up.value, true)).toBe(60);
    expect(up.skeletons.map((batch) => batch.length)).toEqual([50, 10]);
    expect(up.skeletons[0][0]).toEqual({
      skeletonHash: shape(1).hash,
      skeleton: shape(1).skeleton,
      institutionId: 'in.hdfc_bank',
      senderKey: 'HDFCBK',
      country: 'IN',
      language: null,
      correctedField: null,
    });
    expect(await queuedSkeletons(100)).toEqual([]);
  });

  it('queues a shape once and caps the queue', async () => {
    await queueSkeletons([shape(1), shape(1)], NOW);
    expect(await queuedSkeletons(10)).toHaveLength(1);
    await queueSkeletons(Array.from({ length: 300 }, (_, i) => shape(i + 2)), NOW);
    expect(await queuedSkeletons(1000)).toHaveLength(200);
  });

  it('drops the queue when learning is off, here or on the server', async () => {
    await queueSkeletons([shape(1)], NOW);
    const up = uploader();
    expect(await uploadSkeletons(up.value, false)).toBe(0);
    expect(up.value.uploadSkeletons).not.toHaveBeenCalled();
    expect(await queuedSkeletons(10)).toEqual([]);

    await queueSkeletons([shape(2)], NOW);
    const refused = uploader({ uploadSkeletons: async () => Promise.reject({ code: 'TEMPLATE_LEARNING_OFF' }) });
    await expect(uploadSkeletons(refused.value, true)).rejects.toEqual({ code: 'TEMPLATE_LEARNING_OFF' });
    expect(await queuedSkeletons(10)).toEqual([]);
  });

  it('keeps the queue on a network error and when the setting is unknown', async () => {
    await queueSkeletons([shape(1)], NOW);
    const offline = uploader({ uploadSkeletons: async () => Promise.reject(new Error('offline')) });
    await uploadDetectionTelemetry(offline.value, { templateLearning: true, now: NOW });
    expect(await queuedSkeletons(10)).toHaveLength(1);

    const up = uploader();
    await uploadDetectionTelemetry(up.value, { templateLearning: null, now: NOW });
    expect(up.value.uploadSkeletons).not.toHaveBeenCalled();
    expect(await queuedSkeletons(10)).toHaveLength(1);
  });

  it('is removed by "delete my data" and after 30 days', async () => {
    await queueSkeletons([shape(1)], NOW);
    await clearDetectionData();
    expect(await queuedSkeletons(10)).toEqual([]);

    await queueSkeletons([shape(2)], NOW - 31 * DAY_MS);
    await queueSkeletons([shape(3)], NOW);
    await purgeOld(NOW);
    expect((await queuedSkeletons(10)).map((item) => item.hash)).toEqual([shape(3).hash]);
  });
});
