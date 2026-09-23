import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import type { RawIncomingMessage } from '@/features/transaction-detection/types/transactionDetection.types';
import { isFinancialSender } from '@/features/transaction-detection/constants/institutionKeywords';

type MessageHandler = (message: RawIncomingMessage) => void;

let activeSubscription: { remove: () => void } | null = null;

export function startSmsListener(onMessageReceived: MessageHandler): () => void {
  if (Platform.OS !== 'android') {
    return () => {};
  }

  try {
    const SmsListenerModule = NativeModules.SmsListenerModule || NativeModules.SmsReceiver;
    if (SmsListenerModule) {
      const eventEmitter = new NativeEventEmitter(SmsListenerModule);
      const sub = eventEmitter.addListener(
        'onSmsReceived',
        (event: { originatingAddress?: string; body?: string; timestamp?: number }) => {
          const sender = event.originatingAddress || '';
          const content = event.body || '';

          // Native pre-filter check
          if (!isFinancialSender(sender)) {
            return;
          }

          onMessageReceived({
            sender,
            content,
            receivedAt: event.timestamp
              ? new Date(event.timestamp).toISOString()
              : new Date().toISOString(),
            source: 'android_sms',
          });
        }
      );

      activeSubscription = sub;
      return () => {
        sub.remove();
        activeSubscription = null;
      };
    }
  } catch {
    // Graceful fallback if native module is not registered in Expo Go
  }

  return () => {
    if (activeSubscription) {
      activeSubscription.remove();
      activeSubscription = null;
    }
  };
}
