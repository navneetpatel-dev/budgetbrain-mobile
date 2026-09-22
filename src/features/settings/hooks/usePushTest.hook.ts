import { Alert } from 'react-native';
import { apiPost } from '@/shared/services/api';

export function usePushTest() {
  return async () => {
    try {
      const result = await apiPost<{ sent: number }>('/notifications/test', {});
      Alert.alert('Push', result.sent > 0 ? 'Sent!' : 'No token registered.');
    } catch {
      Alert.alert('Error', 'Failed to send');
    }
  };
}
