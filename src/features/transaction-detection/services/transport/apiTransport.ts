import NetInfo from '@react-native-community/netinfo';
import { fetchDetectionConfig, syncDetectedBatch } from '../../api/detectedTransactions.api';
import type { DetectionTransport } from '../../types/transactionDetection.types';

/** Foreground transport: the app's axios client, with token refresh. */
export const apiTransport: DetectionTransport = {
  async isOnline() {
    const net = await NetInfo.fetch();
    return Boolean(net.isConnected) && net.isInternetReachable !== false;
  },
  syncBatch: (items, idempotencyKey) => syncDetectedBatch(items, idempotencyKey),
  fetchConfig: () => fetchDetectionConfig(),
};
