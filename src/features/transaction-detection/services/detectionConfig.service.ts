import type { DetectionConfig, DetectionTransport } from '../types/transactionDetection.types';
import { getKv, setKv } from './store/detectionStore.service';

/**
 * Server kill switches (plan task T1.16), cached briefly so a burst of messages doesn't make a
 * request each. The last answer is persisted, so a headless run without network still honours
 * it; with none at all, detection keeps storing locally and the server decides at sync time.
 */
const TTL_MS = 5 * 60 * 1000;
const CONFIG_KEY = 'server_config';

let cached: { config: DetectionConfig; at: number } | null = null;

export async function getDetectionConfig(
  transport: Pick<DetectionTransport, 'fetchConfig'>,
  options: { force?: boolean } = {}
): Promise<DetectionConfig | null> {
  if (!options.force && cached && Date.now() - cached.at < TTL_MS) return cached.config;
  try {
    const config = await transport.fetchConfig();
    await setCachedDetectionConfig(config);
    return config;
  } catch {
    if (cached) return cached.config;
    return getKv<DetectionConfig>(CONFIG_KEY).catch(() => null);
  }
}

/** The last known config without a network request (headless runs make at most one request). */
export async function getStoredDetectionConfig(): Promise<DetectionConfig | null> {
  if (cached) return cached.config;
  return getKv<DetectionConfig>(CONFIG_KEY).catch(() => null);
}

export async function setCachedDetectionConfig(config: DetectionConfig): Promise<void> {
  cached = { config, at: Date.now() };
  await setKv(CONFIG_KEY, config).catch(() => {});
}

/** Test helper. */
export function __resetDetectionConfigForTests() {
  cached = null;
}
