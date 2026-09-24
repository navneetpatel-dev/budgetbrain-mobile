import { useState, useCallback } from 'react';
import type { HistoricalSyncProgress, SyncFlushSummary } from '../types/transactionDetection.types';
import { runHistoricalInboxScan } from '../services/historicalSync.service';
import { fetchCategoriesForDetection } from '../api/detectedTransactions.api';

const IDLE: HistoricalSyncProgress = { isScanning: false, totalMessages: 0, processedCount: 0, queuedCount: 0 };

export function useHistoricalSync() {
  const [progress, setProgress] = useState<HistoricalSyncProgress>(IDLE);
  const [isScanning, setIsScanning] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [summary, setSummary] = useState<SyncFlushSummary | null>(null);

  const startScan = useCallback(async (days: number) => {
    setIsScanning(true);
    setHasFinished(false);
    setSummary(null);
    setProgress(IDLE);
    try {
      const categories = await fetchCategoriesForDetection().catch(() => []);
      const result = await runHistoricalInboxScan(days, categories, setProgress);
      setSummary(result);
    } finally {
      setIsScanning(false);
      setHasFinished(true);
    }
  }, []);

  const progressPercent =
    progress.totalMessages > 0 ? Math.min(100, Math.round((progress.processedCount / progress.totalMessages) * 100)) : 0;

  return {
    isScanning,
    hasFinished,
    totalMessages: progress.totalMessages,
    processedCount: progress.processedCount,
    queuedCount: progress.queuedCount,
    progressPercent,
    summary,
    startScan,
    reset: () => {
      setIsScanning(false);
      setHasFinished(false);
      setSummary(null);
      setProgress(IDLE);
    },
  };
}
