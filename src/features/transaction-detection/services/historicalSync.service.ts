import { store } from '@/shared/store';
import { scanSmsInbox, toNormalizedMessage } from '@/shared/services/sms/smsDetector.service';
import type { DetectionCategory, HistoricalSyncProgress, SyncFlushSummary } from '../types/transactionDetection.types';
import { contextFromState } from './detectionContext.service';
import { getDetectionConfig } from './detectionConfig.service';
import { processMessages } from './transactionPipeline.service';
import { flushDetectedQueue } from './detectionSync.service';
import { apiTransport } from './transport/apiTransport';

const CHUNK_SIZE = 50;
const MAX_MESSAGES = 1000;

/**
 * Scans the inbox for the chosen window (sender pre-filter runs natively), stores what the
 * pipeline accepts in chunks of 50, then sends it in batches of at most 100 (gap S3) and reports
 * the server's real counts. Messages already stored are dropped by their fingerprint.
 */
export async function runHistoricalInboxScan(
  scanDays: number,
  availableCategories: DetectionCategory[] = [],
  onProgress?: (progress: HistoricalSyncProgress) => void
): Promise<SyncFlushSummary | null> {
  const context = contextFromState(store.getState());
  const simSlot = context.selectedSimSlot === 'all' ? null : Number(context.selectedSimSlot);
  const candidates = await scanSmsInbox({
    sinceMs: Date.now() - scanDays * 24 * 60 * 60 * 1000,
    limit: MAX_MESSAGES,
    simSlot,
  });
  const total = candidates.length;
  let queued = 0;

  if (total === 0) {
    onProgress?.({ isScanning: false, totalMessages: 0, processedCount: 0, queuedCount: 0 });
    return null;
  }

  const config = await getDetectionConfig(apiTransport);
  for (let i = 0; i < total; i += CHUNK_SIZE) {
    const chunk = candidates.slice(i, i + CHUNK_SIZE).map(toNormalizedMessage);
    queued += (await processMessages(chunk, context, { categories: availableCategories, config })).length;
    onProgress?.({
      isScanning: true,
      totalMessages: total,
      processedCount: Math.min(i + CHUNK_SIZE, total),
      queuedCount: queued,
    });
    // Yield so the progress bar can render between chunks.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  const summary = await flushDetectedQueue({ resetBackoff: true });
  onProgress?.({ isScanning: false, totalMessages: total, processedCount: total, queuedCount: queued, summary });
  return summary;
}
