import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { createSqlJsDriver } from '@/shared/testing/sqlJsDriver';
import { __useDetectionDriverForTests, pendingCount } from '../store/detectionStore.service';
import { __resetDrainForTests, drainAndSync } from '../detectionDrain.service';
import { __resetSyncManagerForTests } from '../syncManager.service';
import { __resetDetectionContextForTests, saveDetectionContext } from '../detectionContext.service';
import { buildDetectionNotification } from '../detectionNotifier.service';
import type { DetectionContext, DetectionTransport } from '../../types/transactionDetection.types';

type AnyFn = (...args: any[]) => any;
const mockDrainQueue = jest.fn<AnyFn>();
const mockAck = jest.fn<AnyFn>(async () => {});
jest.mock('../../../../../modules/sms-detector', () => ({
  drainQueue: (...a: unknown[]) => mockDrainQueue(...a),
  ackMessages: (...a: unknown[]) => mockAck(...a),
}));

const DEBIT = 'Rs.1,250.00 debited from a/c **1234 on 23-09-26 to VPA swiggy@icici Ref 425612345678. Avl Bal Rs 20,500.00';

function candidate(i: number, body = DEBIT) {
  return { queueId: String(i), messageId: null, sender: 'VM-HDFCBK', body, receivedAt: Date.parse('2026-09-23T04:30:00Z') + i, simSlot: 1 };
}

const context: DetectionContext = {
  userId: 'user-1',
  isAutoTrackingEnabled: true,
  selectedSimSlot: 'all',
  excludedMerchants: [],
  excludedAccountTails: [],
  learnedRules: {},
  notificationPreference: 'all',
};

const syncBatch = jest.fn<DetectionTransport['syncBatch']>(async (items) => ({
  results: items.map((item) => ({ clientId: item.clientId, fingerprint: item.dedupFingerprint, status: 'created' as const })),
}));
const transport: DetectionTransport = {
  isOnline: async () => true,
  syncBatch,
  fetchConfig: async () => ({ enabled: true, autoCreateEnabled: true, minAppVersion: null, autoAddHighConfidence: true }),
};

beforeEach(async () => {
  jest.clearAllMocks();
  __resetDrainForTests();
  __resetSyncManagerForTests();
  __resetDetectionContextForTests();
  await __useDetectionDriverForTests(await createSqlJsDriver());
});

describe('drainAndSync (T2.4)', () => {
  it('stores candidates, then acknowledges them, then makes one sync request', async () => {
    await saveDetectionContext(context);
    // A burst: the same SMS delivered twice plus an OTP, all in one run.
    mockDrainQueue
      .mockResolvedValueOnce([candidate(1), candidate(1), candidate(2, 'Your OTP is 123456. Do not share. Rs 10 debited')])
      .mockResolvedValue([]);
    const result = await drainAndSync({ transport, config: null, maxRequests: 1 });
    expect(result).toMatchObject({ drained: 3, stored: 1 });
    expect(mockAck).toHaveBeenCalledWith(['1', '1', '2']);
    expect(syncBatch).toHaveBeenCalledTimes(1);
    expect(result.sync).toMatchObject({ created: 1, remaining: 0 });
  });

  it('does not acknowledge candidates when storing them fails, so the next run retries', async () => {
    mockDrainQueue.mockResolvedValueOnce([candidate(1)]);
    const driver = await createSqlJsDriver();
    await __useDetectionDriverForTests({
      ...driver,
      transaction: async () => {
        throw new Error('disk full');
      },
    });
    await saveDetectionContext(context);
    await expect(drainAndSync({ transport, config: null })).rejects.toThrow('disk full');
    expect(mockAck).not.toHaveBeenCalled();
  });

  it('drops candidates without processing them when signed out', async () => {
    await saveDetectionContext({ ...context, userId: null });
    mockDrainQueue.mockResolvedValueOnce([candidate(1)]).mockResolvedValue([]);
    const result = await drainAndSync({ transport, config: null });
    expect(result).toMatchObject({ drained: 1, stored: 0, sync: null });
    expect(mockAck).toHaveBeenCalledWith(['1']);
    expect(await pendingCount('user-1')).toBe(0);
  });
});

describe('detection notification (T2.12)', () => {
  it('shows counts only and deep-links a single review item', () => {
    const content = buildDetectionNotification({ created: 1, needsReview: 1, reviewIds: ['d9'] }, 'all');
    expect(content?.body).toBe('Detected from your bank messages: 1 added, 1 to review.');
    expect(content?.body).not.toMatch(/₹|Rs|\d+\.\d{2}/);
    expect(content?.data).toEqual({ detectedId: 'd9', status: 'pending_review' });
  });

  it('respects the preference and stays quiet when nothing changed', () => {
    expect(buildDetectionNotification({ created: 2, needsReview: 0, reviewIds: [] }, 'needs_review')).toBeNull();
    expect(buildDetectionNotification({ created: 2, needsReview: 1, reviewIds: [] }, 'off')).toBeNull();
    expect(buildDetectionNotification({ created: 0, needsReview: 0, reviewIds: [] }, 'all')).toBeNull();
    expect(buildDetectionNotification({ created: 0, needsReview: 3, reviewIds: ['a', 'b', 'c'] }, 'all')?.data).toEqual({
      detectedId: 'batch',
      status: 'pending_review',
    });
  });
});

describe('headless entry import graph (T2.5)', () => {
  const root = path.resolve(__dirname, '../../../../..');
  const FORBIDDEN = [/^react-redux$/, /^@reduxjs\//, /^axios$/, /^expo-router/, /\/src\/app\//, /\/shared\/store\//, /\/shared\/services\/api$/, /\.component$/, /\.screen$/];

  function resolveLocal(from: string, spec: string): string | null {
    let base: string;
    if (spec.startsWith('@/')) base = path.join(root, 'src', spec.slice(2));
    else if (spec.startsWith('.')) base = path.resolve(path.dirname(from), spec);
    else return null;
    for (const candidate of [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts')]) {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    }
    return null;
  }

  it("doesn't reach Redux, the axios client, routes or UI", () => {
    const start = path.join(root, 'src/features/transaction-detection/services/headlessDrain.task.ts');
    const seen = new Set<string>();
    const reached: string[] = [];
    const queue = [start];
    while (queue.length > 0) {
      const file = queue.pop()!;
      if (seen.has(file)) continue;
      seen.add(file);
      const source = fs.readFileSync(file, 'utf8');
      // Value imports only: `import type` is erased and never loads the module.
      const specs = [...source.matchAll(/(?:import(?!\s+type\b)[^'"]*?from\s*|import\(\s*|require\(\s*)['"]([^'"]+)['"]/g)].map((m) => m[1]);
      for (const spec of specs) {
        const local = resolveLocal(file, spec);
        reached.push(local ? path.relative(root, local).replace(/\.tsx?$/, '').replace(/^/, '/') : spec);
        if (local) queue.push(local);
      }
    }
    // The walk really follows the graph.
    expect(reached).toContain('/src/features/transaction-detection/services/store/detectionStore.service');
    const offending = reached.filter((spec) => FORBIDDEN.some((pattern) => pattern.test(spec)));
    expect(offending).toEqual([]);
  });
});
