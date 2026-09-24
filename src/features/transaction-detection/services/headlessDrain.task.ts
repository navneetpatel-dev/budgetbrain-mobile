/**
 * Headless JS task `TransactionDetectionDrain` (plan T2.4, T2.5), started by the native
 * WorkManager worker after a burst of bank SMS or a catch-up scan.
 *
 * Imports only the detection store, the pipeline, the sync manager and a fetch transport:
 * no React tree, no Redux store and no axios client. It resolves when the run is done, so the
 * worker can let the process go.
 */
export const DETECTION_DRAIN_TASK = 'TransactionDetectionDrain';

export async function runHeadlessDetectionDrain(): Promise<void> {
  try {
    const [{ drainAndSync }, { headlessTransport }, { getStoredDetectionConfig }, { notifyDetectionSummary }] =
      await Promise.all([
        import('./detectionDrain.service'),
        import('./transport/headlessTransport'),
        import('./detectionConfig.service'),
        import('./detectionNotifier.service'),
      ]);
    const config = await getStoredDetectionConfig();
    const result = await drainAndSync({ transport: headlessTransport, config, maxRequests: 1 });
    if (result.sync) await notifyDetectionSummary(result.sync, result.notificationPreference);
  } catch {
    // Never throw out of a headless task; unacknowledged candidates are retried on the next run.
  }
}
