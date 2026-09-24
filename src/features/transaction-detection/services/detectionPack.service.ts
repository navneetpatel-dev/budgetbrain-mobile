import * as FileSystem from 'expo-file-system/legacy';
import { compilePack, type CompiledPack, type KnowledgePack, type SignedKnowledgePack } from '@budgetbrain/detection-core';
import { getKv } from './store/detectionStore.service';

/**
 * The knowledge pack the pipeline runs on (plan T4.4): the newest downloaded pack when there is
 * one, otherwise core's India baseline pack bundled with the app. Compiled once per process
 * (plan T3.14). Used by the foreground app and the headless drain, so it imports nothing but core,
 * the file system and the detection store.
 */
export const PACK_DIR = `${FileSystem.documentDirectory ?? ''}detection-packs/`;
export const ACTIVE_PACK_KEY = 'active_pack';

/** Pointer to the active downloaded pack. Switching it is one SQLite write, so the swap is atomic. */
export interface ActivePackPointer {
  country: string;
  version: number;
  etag: string;
  file: string;
}

let active: { pack: KnowledgePack; compiled: CompiledPack; pointer: ActivePackPointer | null } | null = null;
let loading: Promise<void> | null = null;
/** The stored pointer was read once this process; a new download calls setActivePack directly. */
let checked = false;

function baselinePack(): KnowledgePack {
  return require('@budgetbrain/detection-core/packs/baseline/IN.json') as KnowledgePack;
}

/** Makes `pack` the one the pipeline uses from now on. */
export function setActivePack(pack: KnowledgePack, pointer: ActivePackPointer | null): void {
  active = { pack, compiled: compilePack(pack), pointer };
}

/**
 * Loads the downloaded pack once per process. The file was signature-checked before it was
 * written, so it is only parsed here; if it is missing or unreadable, the baseline stays in use.
 */
export function ensureActivePack(): Promise<void> {
  if (loading) return loading;
  if (checked) return Promise.resolve();
  loading = (async () => {
    try {
      const pointer = await getKv<ActivePackPointer>(ACTIVE_PACK_KEY);
      if (!pointer) return;
      const signed = JSON.parse(await FileSystem.readAsStringAsync(`${PACK_DIR}${pointer.file}`)) as SignedKnowledgePack;
      if (signed.payload.meta.packVersion === pointer.version) setActivePack(signed.payload, pointer);
    } catch {
      // Keep the baseline.
    }
  })().finally(() => {
    checked = true;
    loading = null;
  });
  return loading;
}

export function getActivePack(): KnowledgePack {
  if (!active) setActivePack(baselinePack(), null);
  return active!.pack;
}

export function getActivePackPointer(): ActivePackPointer | null {
  return active?.pointer ?? null;
}

export function getCompiledPack(): CompiledPack {
  if (!active) setActivePack(baselinePack(), null);
  return active!.compiled;
}

/**
 * What the native pre-filter keeps (plan T2.2): the SMS headers of every institution in the
 * active pack. Unknown senders are ignored by the pipeline anyway, so nothing else needs to reach JS.
 */
export function nativeSenderFilter(): { headers: string[]; keywords: string[] } {
  const headers = getActivePack()
    .senders.filter((sender) => sender.channel === 'sms' && sender.match === 'header')
    .map((sender) => sender.key.toUpperCase());
  return { headers: [...new Set(headers)], keywords: [] };
}

/** The bank and UPI app packages whose notifications the native listener keeps (plan T8.1). */
export function nativeNotificationFilter(): { packages: string[] } {
  const packages = getActivePack()
    .senders.filter((sender) => sender.channel === 'notification')
    .map((sender) => sender.key.trim().toLowerCase());
  return { packages: [...new Set(packages)] };
}

/** Test helper. */
export function __resetActivePackForTests() {
  active = null;
  loading = null;
  checked = false;
}
