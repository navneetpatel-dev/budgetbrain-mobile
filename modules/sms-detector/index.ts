import { requireOptionalNativeModule, type NativeModule } from 'expo';
import type { NativeSmsCandidate, ScanInboxOptions, SenderFilter, SmsDetectorEvents } from './src/SmsDetector.types';

export type { NativeSmsCandidate, ScanInboxOptions, SenderFilter } from './src/SmsDetector.types';

/**
 * JS side of the `SmsDetector` Expo module (plan T2.1). Android only; every call is a no-op
 * where the native module isn't linked (iOS, web, Expo Go, tests).
 */
declare class SmsDetectorModule extends NativeModule<SmsDetectorEvents> {
  setEnabled(enabled: boolean): Promise<void>;
  setSenderFilter(filter: SenderFilter): Promise<void>;
  drainQueue(limit: number): Promise<NativeSmsCandidate[]>;
  ackMessages(queueIds: string[]): Promise<void>;
  scanInbox(options: ScanInboxOptions): Promise<NativeSmsCandidate[]>;
  initWatermark(floorMs: number): Promise<void>;
  scheduleCatchUp(): Promise<void>;
}

const native = requireOptionalNativeModule<SmsDetectorModule>('SmsDetector');

export function isSmsDetectorAvailable(): boolean {
  return native !== null;
}

/** Turns the receiver and the periodic catch-up on or off. Off also clears the native queue. */
export async function setEnabled(enabled: boolean): Promise<void> {
  await native?.setEnabled(enabled);
}

/**
 * What the native pre-filter keeps: exact headers (`HDFCBK`, after the `VM-` route prefix is
 * stripped) and header keywords (`HDFC`). Stored natively, so it applies with the app closed.
 */
export async function setSenderFilter(filter: SenderFilter): Promise<void> {
  await native?.setSenderFilter(filter);
}

export async function drainQueue(limit: number): Promise<NativeSmsCandidate[]> {
  return (await native?.drainQueue(limit)) ?? [];
}

/** Deletes candidates from the native queue; call only after they are stored in the JS store. */
export async function ackMessages(queueIds: string[]): Promise<void> {
  if (queueIds.length > 0) await native?.ackMessages(queueIds);
}

/** Reads the inbox (pre-filtered natively, oldest first). Doesn't move the catch-up watermark. */
export async function scanInbox(options: ScanInboxOptions): Promise<NativeSmsCandidate[]> {
  return (await native?.scanInbox(options)) ?? [];
}

/** Sets the catch-up starting point on a fresh install; ignored once a watermark exists. */
export async function initWatermark(floorMs: number): Promise<void> {
  await native?.initWatermark(floorMs);
}

export async function scheduleCatchUp(): Promise<void> {
  await native?.scheduleCatchUp();
}

export function addCandidateListener(listener: () => void): { remove: () => void } {
  if (!native) return { remove: () => {} };
  return native.addListener('onCandidateQueued', listener);
}
