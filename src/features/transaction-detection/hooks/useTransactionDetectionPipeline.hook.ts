import { useEffect } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useSelector } from 'react-redux';
import type { RootState } from '@/shared/store';
import { addSmsCandidateListener, setSmsDetectorEnabled } from '@/shared/services/sms/smsDetector.service';
import {
  cancelScheduledFlush,
  flushDetectedQueue,
  persistDetectionContext,
  prepareForegroundDetection,
  scheduleFlush,
} from '../services/detectionSync.service';

/**
 * Foreground half of detection. The native receiver queues bank SMS even with the app closed;
 * while the app is open this drains that queue shortly after each SMS, and whenever the app
 * becomes active or the network comes back. Takes no arguments, so it subscribes once (gap A5).
 */
export function useTransactionDetectionPipeline() {
  const detection = useSelector((state: RootState) => state.transactionDetection);
  const userId = useSelector((state: RootState) => state.auth.user?.id ?? null);
  const isActive = detection.isAutoTrackingEnabled && userId !== null;

  // The headless drain reads these settings from the detection store, not from Redux.
  useEffect(() => {
    void persistDetectionContext().catch(() => {});
  }, [
    userId,
    detection.isAutoTrackingEnabled,
    detection.selectedSimSlot,
    detection.excludedMerchants,
    detection.excludedAccountTails,
    detection.learnedRules,
    detection.notificationPreference,
    detection.ownAccountTails,
    detection.ownVpas,
    detection.linkedAccountTails,
  ]);

  useEffect(() => {
    void setSmsDetectorEnabled(isActive).catch(() => {});
    if (!isActive) return;

    void prepareForegroundDetection().then(() => flushDetectedQueue());
    const candidateSub = addSmsCandidateListener(() => scheduleFlush());
    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void flushDetectedQueue();
    });
    const unsubscribeNet = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) void flushDetectedQueue({ resetBackoff: true });
    });

    return () => {
      candidateSub.remove();
      appStateSub.remove();
      unsubscribeNet();
      cancelScheduledFlush();
    };
  }, [isActive]);
}
