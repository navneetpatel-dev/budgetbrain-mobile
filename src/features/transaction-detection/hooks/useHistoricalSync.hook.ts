import { useState, useCallback } from 'react';
import type { ProcessedTransaction } from '../types/transactionDetection.types';
import { runHistoricalInboxScan } from '../services/historicalSync.service';

export function useHistoricalSync(availableCategories: Array<{ id: string; name: string }> = []) {
  const [isScanning, setIsScanning] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [foundTransactions, setFoundTransactions] = useState<ProcessedTransaction[]>([]);
  const [hasFinished, setHasFinished] = useState(false);

  const startScan = useCallback(
    async (days: number) => {
      setIsScanning(true);
      setHasFinished(false);
      setFoundTransactions([]);
      setTotalMessages(0);
      setProcessedCount(0);

      try {
        const results = await runHistoricalInboxScan(
          days,
          availableCategories,
          (progress) => {
            setTotalMessages(progress.totalMessages);
            setProcessedCount(progress.processedCount);
            setFoundTransactions(progress.foundTransactions);
            if (!progress.isScanning && progress.totalMessages > 0) {
              setHasFinished(true);
            }
          }
        );
        setFoundTransactions(results);
      } finally {
        setIsScanning(false);
        setHasFinished(true);
      }
    },
    [availableCategories]
  );

  const progressPercent =
    totalMessages > 0 ? Math.min(100, Math.round((processedCount / totalMessages) * 100)) : 0;

  return {
    isScanning,
    hasFinished,
    totalMessages,
    processedCount,
    progressPercent,
    foundTransactions,
    startScan,
    reset: () => {
      setIsScanning(false);
      setHasFinished(false);
      setFoundTransactions([]);
    },
  };
}
