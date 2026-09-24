import { useEffect } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useSelector } from 'react-redux';
import type { RootState } from '@/shared/store';
import { startSmsListener } from '@/shared/services/sms/smsListener.service';
import { fetchCategoriesForDetection } from '../api/detectedTransactions.api';
import { processAndQueueMessages } from '../services/transactionPipeline.service';
import { flushDetectedQueue } from '../services/syncQueue.service';

const CATEGORY_TTL_MS = 10 * 60 * 1000;
let categoryCache: { at: number; categories: { id: string; name: string }[] } | null = null;

/** The user's categories, cached for 10 minutes so each message doesn't fetch them. */
async function categoriesForDetection() {
  if (categoryCache && Date.now() - categoryCache.at < CATEGORY_TTL_MS) return categoryCache.categories;
  try {
    categoryCache = { at: Date.now(), categories: await fetchCategoriesForDetection() };
  } catch {
    // Keep the last list; with none, the server's category rules still apply.
  }
  return categoryCache?.categories ?? [];
}

/**
 * Listens for SMS while detection is on, queues what the pipeline accepts, and flushes the
 * queue when the app becomes active or the network comes back. Takes no arguments, so the
 * listener subscribes once instead of on every render (gap A5).
 */
export function useTransactionDetectionPipeline() {
  const isEnabled = useSelector((state: RootState) => state.transactionDetection.isAutoTrackingEnabled);
  const isSignedIn = useSelector((state: RootState) => Boolean(state.auth.user?.id));

  useEffect(() => {
    if (!isEnabled || !isSignedIn) return;

    const unsubscribeSms = startSmsListener((message) => {
      void categoriesForDetection().then((categories) => processAndQueueMessages([message], categories));
    });
    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void flushDetectedQueue();
    });
    const unsubscribeNet = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) void flushDetectedQueue();
    });
    void flushDetectedQueue();

    return () => {
      unsubscribeSms();
      appStateSub.remove();
      unsubscribeNet();
    };
  }, [isEnabled, isSignedIn]);
}
