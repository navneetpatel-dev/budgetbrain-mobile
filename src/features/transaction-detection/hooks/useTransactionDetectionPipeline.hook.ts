import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/shared/store';
import { startSmsListener } from '@/shared/services/sms/smsListener.service';
import { processIncomingMessage } from '../services/transactionPipeline.service';

export function useTransactionDetectionPipeline(
  availableCategories: Array<{ id: string; name: string }> = []
) {
  const isEnabled = useSelector(
    (state: RootState) => state.transactionDetection.isAutoTrackingEnabled
  );

  useEffect(() => {
    if (!isEnabled) return;

    // Start background SMS event listener
    const unsubscribe = startSmsListener((msg) => {
      processIncomingMessage(msg, availableCategories).catch(() => {});
    });

    return () => {
      unsubscribe();
    };
  }, [isEnabled, availableCategories]);
}
