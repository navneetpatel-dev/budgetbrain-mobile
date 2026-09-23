import { queryHistoricalSms } from '@/shared/services/sms/smsReader.service';
import type {
  HistoricalSyncProgress,
  ProcessedTransaction,
} from '../types/transactionDetection.types';
import { store } from '@/shared/store';
import { setSyncStatus } from '@/shared/store/transactionDetectionSlice';
import { queryClient } from '@/shared/services/queryClient';
import { invalidateMoneyQueries } from '@/shared/services/queryInvalidation';
import { processIncomingMessage } from './transactionPipeline.service';
import { syncDetectedBatch } from '../api/detectedTransactions.api';

export async function runHistoricalInboxScan(
  scanDays: number,
  availableCategories: Array<{ id: string; name: string }> = [],
  onProgress?: (progress: HistoricalSyncProgress) => void
): Promise<ProcessedTransaction[]> {
  const cutoffTimestamp = Date.now() - scanDays * 24 * 60 * 60 * 1000;

  // 1. Query Android SMS inbox
  const rawMessages = await queryHistoricalSms({
    minDateTimestamp: cutoffTimestamp,
    maxCount: 300,
  });

  const total = rawMessages.length;
  const found: ProcessedTransaction[] = [];

  if (total === 0) {
    onProgress?.({
      isScanning: false,
      totalMessages: 0,
      processedCount: 0,
      foundTransactions: [],
    });
    return [];
  }

  // 2. Process in chunks of 25 to ensure smooth 60fps UI
  const chunkSize = 25;
  for (let i = 0; i < total; i += chunkSize) {
    const chunk = rawMessages.slice(i, i + chunkSize);

    for (const msg of chunk) {
      try {
        const tx = await processIncomingMessage(msg, availableCategories);
        if (tx) {
          found.push(tx);
        }
      } catch {
        // Individual message failure never stops the batch
      }
    }

    onProgress?.({
      isScanning: i + chunkSize < total,
      totalMessages: total,
      processedCount: Math.min(i + chunkSize, total),
      foundTransactions: [...found],
    });

    // Yield control to the event loop so React Native renders progress updates smoothly
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  // 3. Batch sync newly found transactions to backend in one single network roundtrip
  if (found.length > 0) {
    try {
      const itemsToSync = found.map((item) => ({
        amount: item.amount,
        currency: item.currency,
        direction: item.direction,
        transactionType: item.transactionType,
        merchant: item.merchant,
        normalizedMerchant: item.normalizedMerchant,
        categoryId: item.categoryId,
        financialAccountId: item.financialAccountId,
        accountTail: item.accountTail,
        referenceNumber: item.referenceNumber,
        institutionName: item.institutionName,
        transactionDate: item.transactionDate,
        confidence: item.confidence,
        dedupFingerprint: item.dedupFingerprint,
        source: item.source,
        status: item.status,
      }));

      await syncDetectedBatch({ items: itemsToSync });
      invalidateMoneyQueries(queryClient);
      store.dispatch(
        setSyncStatus({
          status: 'idle',
          timestamp: new Date().toISOString(),
        })
      );
    } catch {
      // Offline fallback
    }
  }

  onProgress?.({
    isScanning: false,
    totalMessages: total,
    processedCount: total,
    foundTransactions: found,
  });

  return found;
}
