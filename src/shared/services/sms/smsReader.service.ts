import { Platform, NativeModules } from 'react-native';
import type { RawIncomingMessage } from '@/features/transaction-detection/types/transactionDetection.types';
import { isFinancialSender } from '@/features/transaction-detection/constants/institutionKeywords';

export interface QuerySmsOptions {
  minDateTimestamp: number;
  maxCount?: number;
}

/**
 * Queries Android SMS inbox for messages received since minDateTimestamp.
 * Uses native content resolver bridge if available, with safe error handling and fallback.
 */
export async function queryHistoricalSms(
  options: QuerySmsOptions
): Promise<RawIncomingMessage[]> {
  if (Platform.OS !== 'android') {
    return [];
  }

  const { minDateTimestamp, maxCount = 200 } = options;

  try {
    const SmsModule = NativeModules.SmsReaderModule || NativeModules.RNSmsAndroid;
    if (SmsModule && typeof SmsModule.list === 'function') {
      return new Promise((resolve) => {
        const filter = {
          box: 'inbox',
          minDate: minDateTimestamp,
          maxCount,
        };

        SmsModule.list(
          JSON.stringify(filter),
          () => resolve([]),
          (count: number, smsList: string) => {
            try {
              const parsed: Array<{ address: string; body: string; date: number; _id?: string }> =
                JSON.parse(smsList);
              const financialMessages: RawIncomingMessage[] = parsed
                .filter((sms) => isFinancialSender(sms.address))
                .map((sms) => ({
                  id: String(sms._id || sms.date),
                  sender: sms.address,
                  content: sms.body,
                  receivedAt: new Date(sms.date).toISOString(),
                  source: 'android_sms',
                }));
              resolve(financialMessages);
            } catch {
              resolve([]);
            }
          }
        );
      });
    }

    return [];
  } catch {
    return [];
  }
}
