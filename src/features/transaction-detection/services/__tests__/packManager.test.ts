import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  diffPacks,
  generateSigningKeyPair,
  signKnowledgePack,
  type KnowledgePack,
  type SignedKnowledgePack,
} from '@budgetbrain/detection-core';
import { createSqlJsDriver } from '@/shared/testing/sqlJsDriver';
import { __useDetectionDriverForTests, getKv } from '../store/detectionStore.service';
import { __resetActivePackForTests, ensureActivePack, getActivePack, getCompiledPack } from '../detectionPack.service';
import { updateKnowledgePack } from '../packManager.service';
import { evaluateMessage, processMessages } from '../transactionPipeline.service';
import type { DetectionContext } from '../../types/transactionDetection.types';

type AnyFn = (...args: any[]) => any;

const mockFiles = new Map<string, string>();
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///docs/',
  makeDirectoryAsync: async () => {},
  writeAsStringAsync: async (path: string, body: string) => {
    mockFiles.set(path, body);
  },
  readAsStringAsync: async (path: string) => {
    const body = mockFiles.get(path);
    if (body === undefined) throw new Error('missing');
    return body;
  },
  deleteAsync: async (path: string) => {
    mockFiles.delete(path);
  },
}));

const mockNet = jest.fn<AnyFn>();
jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: { fetch: (...a: unknown[]) => mockNet(...a) },
}));
jest.mock('expo-battery', () => ({
  BatteryState: { CHARGING: 2, FULL: 3, UNPLUGGED: 1 },
  getBatteryStateAsync: async () => 1,
}));

const mockGet = jest.fn<AnyFn>();
jest.mock('@/shared/services/api', () => ({ api: { get: (...a: unknown[]) => mockGet(...a) } }));

const mockDownloads = new Map<string, unknown>();
(globalThis as { fetch: unknown }).fetch = async (url: string) => ({
  ok: mockDownloads.has(url),
  status: mockDownloads.has(url) ? 200 : 404,
  json: async () => structuredClone(mockDownloads.get(url)),
});


const baseline = require('@budgetbrain/detection-core/packs/baseline/IN.json') as KnowledgePack;
const { privateKey, publicKey } = generateSigningKeyPair();
const keys = { 'test-app': publicKey };

function version(n: number, extraMerchant = true): SignedKnowledgePack {
  const pack = structuredClone(baseline);
  pack.meta.packVersion = n;
  if (extraMerchant) {
    pack.merchants.push({ id: 'm.croma', name: 'Croma', country: 'IN', taxonomyCode: 'GENERAL_MERCHANDISE' });
    pack.merchantAliases.push({ merchantId: 'm.croma', alias: 'croma', country: 'IN' });
  }
  if (n >= 4) pack.merchantAliases.push({ merchantId: 'm.croma', alias: 'croma retail', country: 'IN' });
  return signKnowledgePack(pack, privateKey, 'test-app');
}

function serve(info: { version: number; etag: string; delta?: { baseVersion: number } }) {
  mockGet.mockResolvedValue({
    status: 200,
    data: {
      data: {
        country: 'IN',
        version: info.version,
        etag: info.etag,
        url: `https://cdn/v${info.version}.json`,
        bytes: 1,
        delta: info.delta ? { ...info.delta, url: `https://cdn/v${info.delta.baseVersion}-v${info.version}.json`, bytes: 1 } : null,
      },
    },
  });
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
const CROMA = {
  sender: 'VM-HDFCBK',
  body: 'Rs 4,999.00 spent on HDFC Bank Card xx1111 at CROMA on 2026-09-20. Ref 123456789012',
  receivedAt: '2026-09-23T10:00:00+05:30',
  source: 'android_sms' as const,
};

beforeEach(async () => {
  jest.clearAllMocks();
  mockFiles.clear();
  mockDownloads.clear();
  __resetActivePackForTests();
  await __useDetectionDriverForTests(await createSqlJsDriver());
  mockNet.mockResolvedValue({ isConnected: true, isInternetReachable: true, type: 'wifi', details: {} });
});

describe('knowledge pack manager (T4.4)', () => {
  it('downloads, verifies and activates a newer pack; the pipeline uses it at once', async () => {
    expect(evaluateMessage(CROMA, context)).toMatchObject({ ok: true, payload: { merchantId: null } });
    mockDownloads.set('https://cdn/v3.json', version(3));
    serve({ version: 3, etag: '"e3"' });
    const onActivated = jest.fn<AnyFn>();

    expect(await updateKnowledgePack({ keys, onActivated })).toBe('updated');
    expect(onActivated).toHaveBeenCalledTimes(1);
    expect(getActivePack().meta.packVersion).toBe(3);
    expect(evaluateMessage(CROMA, context)).toMatchObject({ ok: true, payload: { merchantId: 'm.croma' } });
    expect(await getKv('active_pack')).toEqual({ country: 'IN', version: 3, etag: '"e3"', file: 'IN.v3.json' });
  });

  it('keeps the last good pack when a download is corrupted or tampered with', async () => {
    mockDownloads.set('https://cdn/v3.json', version(3));
    serve({ version: 3, etag: '"e3"' });
    await updateKnowledgePack({ keys });

    const tampered = version(4);
    tampered.payload.merchants[0]!.name = 'Evil';
    mockDownloads.set('https://cdn/v4.json', tampered);
    serve({ version: 4, etag: '"e4"' });
    expect(await updateKnowledgePack({ keys, force: true })).toBe('failed');
    expect(getActivePack().meta.packVersion).toBe(3);
    expect(await getKv<{ message: string }>('pack_last_error')).toMatchObject({ message: expect.stringContaining('Signature') });
    expect(mockFiles.has('file:///docs/detection-packs/IN.v3.json')).toBe(true);
  });

  it('applies a delta from the active version and deletes the old file', async () => {
    const v3 = version(3);
    mockDownloads.set('https://cdn/v3.json', v3);
    serve({ version: 3, etag: '"e3"' });
    await updateKnowledgePack({ keys });

    const v4 = version(4);
    mockDownloads.set('https://cdn/v3-v4.json', diffPacks(v3.payload, v4));
    serve({ version: 4, etag: '"e4"', delta: { baseVersion: 3 } });
    expect(await updateKnowledgePack({ keys, force: true })).toBe('updated');
    expect(getActivePack().merchantAliases.some((a) => a.alias === 'croma retail')).toBe(true);
    expect(mockFiles.has('file:///docs/detection-packs/IN.v3.json')).toBe(false);
    expect(mockGet.mock.calls[1]?.[1]).toMatchObject({ params: { country: 'IN', since: 3 }, headers: { 'If-None-Match': '"e3"' } });
  });

  it('stays put on 304, and checks at most daily, on Wi-Fi or while charging', async () => {
    mockGet.mockResolvedValue({ status: 304, data: null });
    expect(await updateKnowledgePack({ keys, now: 1_000_000_000_000 })).toBe('unchanged');
    expect(await updateKnowledgePack({ keys, now: 1_000_000_000_000 + 60_000 })).toBe('skipped');
    mockNet.mockResolvedValue({ isConnected: true, type: 'cellular', details: { isConnectionExpensive: true } });
    expect(await updateKnowledgePack({ keys, now: 1_000_000_000_000 + 2 * 86_400_000 })).toBe('skipped');
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('downloads nothing without a trusted public key', async () => {
    expect(await updateKnowledgePack({ keys: {} })).toBe('skipped');
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('a new process (e.g. the headless drain) loads the stored pack', async () => {
    mockDownloads.set('https://cdn/v3.json', version(3));
    serve({ version: 3, etag: '"e3"' });
    await updateKnowledgePack({ keys });
    __resetActivePackForTests();
    expect(getActivePack().meta.packVersion).toBe(baseline.meta.packVersion);
    __resetActivePackForTests();
    await ensureActivePack();
    expect(getCompiledPack().packVersions.IN).toBe(3);
  });
});

describe('server kill switches (T4.6)', () => {
  it('are applied by the pipeline from the detection config', async () => {
    const config = {
      enabled: true,
      autoCreateEnabled: true,
      minAppVersion: null,
      autoAddHighConfidence: true,
      killSwitches: [{ scope: 'institution' as const, key: 'in.hdfc_bank', action: 'disable_detection' as const }],
    };
    expect(await processMessages([CROMA], context, { config })).toHaveLength(0);
    expect(await processMessages([CROMA], context, { config: { ...config, killSwitches: [] } })).toHaveLength(1);
  });
});
