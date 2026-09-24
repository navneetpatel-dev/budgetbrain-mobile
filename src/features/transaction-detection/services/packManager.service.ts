import NetInfo from '@react-native-community/netinfo';
import * as FileSystem from 'expo-file-system/legacy';
import {
  applyPackDelta,
  fromBase64,
  verifyKnowledgePack,
  type KnowledgePackDelta,
  type SignedKnowledgePack,
  type TrustedKeys,
} from '@budgetbrain/detection-core';
import { api } from '@/shared/services/api';
import type { ApiResponse } from '@/shared/types';
import type { KnowledgePackInfo } from '../types/transactionDetection.types';
import {
  ACTIVE_PACK_KEY,
  PACK_DIR,
  ensureActivePack,
  getActivePack,
  getActivePackPointer,
  setActivePack,
  type ActivePackPointer,
} from './detectionPack.service';
import { getKv, setKv } from './store/detectionStore.service';

/**
 * Keeps the knowledge pack current (plan T4.4):
 * - checks at most once a day, and only on an unmetered network or while charging;
 * - asks with the current ETag (304 when unchanged) and the current version (for a delta);
 * - verifies every download against the public keys built into the app, and never activates a
 *   pack that fails, so a corrupted or tampered download leaves the last good pack in use;
 * - writes the new pack to its own file, then switches the pointer, then deletes the old file.
 */

const LAST_CHECK_KEY = 'pack_last_check';
const LAST_ERROR_KEY = 'pack_last_error';
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
const DOWNLOAD_TIMEOUT_MS = 30000;

export type PackUpdateResult = 'updated' | 'unchanged' | 'skipped' | 'failed';

/** Public keys by key id, from `EXPO_PUBLIC_PACK_PUBLIC_KEYS` ({"prod-2026-09": "<base64>"}). */
export function trustedPackKeys(raw: string | undefined = process.env.EXPO_PUBLIC_PACK_PUBLIC_KEYS): TrustedKeys {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return Object.fromEntries(Object.entries(parsed).map(([id, key]) => [id, fromBase64(key)]));
  } catch {
    return {};
  }
}

async function onCheapConnection(): Promise<boolean> {
  const net = await NetInfo.fetch();
  if (!net.isConnected || net.isInternetReachable === false) return false;
  if (net.type === 'wifi' || net.type === 'ethernet') return true;
  if ((net.details as { isConnectionExpensive?: boolean } | null)?.isConnectionExpensive === false) return true;
  try {
    const Battery = await import('expo-battery');
    const state = await Battery.getBatteryStateAsync();
    return state === Battery.BatteryState.CHARGING || state === Battery.BatteryState.FULL;
  } catch {
    return false;
  }
}

async function download(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function writeAndActivate(signed: SignedKnowledgePack, etag: string): Promise<void> {
  const { country, packVersion } = signed.payload.meta;
  const file = `${country}.v${packVersion}.json`;
  await FileSystem.makeDirectoryAsync(PACK_DIR, { intermediates: true }).catch(() => {});
  await FileSystem.writeAsStringAsync(`${PACK_DIR}${file}`, JSON.stringify(signed));
  const previous = getActivePackPointer();
  const pointer: ActivePackPointer = { country, version: packVersion, etag, file };
  await setKv(ACTIVE_PACK_KEY, pointer);
  setActivePack(signed.payload, pointer);
  if (previous && previous.file !== file) {
    await FileSystem.deleteAsync(`${PACK_DIR}${previous.file}`, { idempotent: true }).catch(() => {});
  }
}

/**
 * Checks the server for a newer pack and activates it once verified. `onActivated` runs after a
 * new pack is in use (the caller hands the new sender list to the native pre-filter).
 */
export async function updateKnowledgePack(
  options: { force?: boolean; now?: number; keys?: TrustedKeys; onActivated?: () => Promise<void> | void } = {}
): Promise<PackUpdateResult> {
  const now = options.now ?? Date.now();
  const keys = options.keys ?? trustedPackKeys();
  // Without a public key nothing can be verified, so nothing is downloaded.
  if (Object.keys(keys).length === 0) return 'skipped';
  if (!options.force) {
    const last = (await getKv<number>(LAST_CHECK_KEY)) ?? 0;
    if (now - last < CHECK_INTERVAL_MS) return 'skipped';
    if (!(await onCheapConnection())) return 'skipped';
  }

  await ensureActivePack();
  const current = getActivePack();
  const pointer = getActivePackPointer();
  const country = current.meta.country;
  try {
    const response = await api.get<ApiResponse<KnowledgePackInfo>>('/detected-transactions/knowledge-pack', {
      params: { country, ...(pointer ? { since: pointer.version } : {}) },
      headers: pointer ? { 'If-None-Match': pointer.etag } : {},
      validateStatus: (status) => status === 200 || status === 304,
    });
    await setKv(LAST_CHECK_KEY, now);
    if (response.status === 304) return 'unchanged';
    const info = response.data.data;
    if (info.version <= current.meta.packVersion && pointer) return 'unchanged';

    let signed: SignedKnowledgePack;
    if (info.delta && pointer && info.delta.baseVersion === pointer.version) {
      signed = applyPackDelta(current, (await download(info.delta.url)) as KnowledgePackDelta, keys);
    } else {
      const downloaded = await download(info.url);
      verifyKnowledgePack(downloaded, keys);
      signed = downloaded as SignedKnowledgePack;
    }
    if (signed.payload.meta.country !== country || signed.payload.meta.packVersion !== info.version) {
      throw new Error('Downloaded pack does not match the announced version');
    }
    await writeAndActivate(signed, info.etag);
    await options.onActivated?.();
    return 'updated';
  } catch (error) {
    await setKv(LAST_ERROR_KEY, { at: now, message: error instanceof Error ? error.message : String(error) }).catch(() => {});
    return 'failed';
  }
}
