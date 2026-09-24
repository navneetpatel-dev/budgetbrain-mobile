import { fetchDetectionConfig } from '../api/detectedTransactions.api';
import type { DetectionConfig } from '../types/transactionDetection.types';

/**
 * Server kill switches (plan task T1.16), cached briefly so a burst of messages doesn't make a
 * request each. When the server can't be reached, the last known config is used; with none at
 * all, detection keeps queuing locally and the server decides when the queue is sent.
 */
const TTL_MS = 5 * 60 * 1000;

let cached: { config: DetectionConfig; at: number } | null = null;

export async function getDetectionConfig(options: { force?: boolean } = {}): Promise<DetectionConfig | null> {
  if (!options.force && cached && Date.now() - cached.at < TTL_MS) return cached.config;
  try {
    const config = await fetchDetectionConfig();
    cached = { config, at: Date.now() };
    return config;
  } catch {
    return cached?.config ?? null;
  }
}

export function setCachedDetectionConfig(config: DetectionConfig) {
  cached = { config, at: Date.now() };
}

/** Test helper. */
export function __resetDetectionConfigForTests() {
  cached = null;
}
