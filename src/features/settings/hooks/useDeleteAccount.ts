import { Alert } from 'react-native';
import { apiDelete } from '@/src/shared/services/api';
import { useLogout } from '@/src/features/settings/hooks/useLogout';

export function useDeleteAccount() {
  const logout = useLogout();

  return () => {
    Alert.alert('Delete Account', 'This action is permanent and cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await apiDelete('/users/me');
          await logout();
        },
      },
    ]);
  };
}
