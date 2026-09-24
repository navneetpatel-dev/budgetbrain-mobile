import { queryHistoricalSms } from '@/shared/services/sms/smsReader.service';
import type { HistoricalSyncProgress, SyncFlushSummary } from '../types/transactionDetection.types';
import { processAndQueueMessages } from './transactionPipeline.service';
import { flushDetectedQueue } from './syncQueue.service';

const CHUNK_SIZE = 25;

/**
 * Scans the inbox for the chosen window, queues what the pipeline accepts, then sends it in
 * batches of at most 100 (the server's limit, gap S3) and reports the server's real counts.
 */
export async function runHistoricalInboxScan(
  scanDays: number,
  availableCategories: { id: string; name: string }[] = [],
  onProgress?: (progress: HistoricalSyncProgress) => void
): Promise<SyncFlushSummary | null> {
  const cutoffTimestamp = Date.now() - scanDays * 24 * 60 * 60 * 1000;
  const messages = await queryHistoricalSms({ minDateTimestamp: cutoffTimestamp, maxCount: 300 });
  const total = messages.length;
  let queued = 0;

  if (total === 0) {
    onProgress?.({ isScanning: false, totalMessages: 0, processedCount: 0, queuedCount: 0 });
    return null;
  }

  for (let i = 0; i < total; i += CHUNK_SIZE) {
    queued += await processAndQueueMessages(messages.slice(i, i + CHUNK_SIZE), availableCategories, { flush: 'none' });
    onProgress?.({
      isScanning: true,
      totalMessages: total,
      processedCount: Math.min(i + CHUNK_SIZE, total),
      queuedCount: queued,
    });
    // Yield so the progress bar can render between chunks.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  const summary = await flushDetectedQueue();
  onProgress?.({ isScanning: false, totalMessages: total, processedCount: total, queuedCount: queued, summary });
  return summary;
}
