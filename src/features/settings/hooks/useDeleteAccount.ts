import { apiDelete } from '@/shared/services/api';
import { CONFIRM } from '@/shared/constants/confirmations';
import { showConfirmation } from '@/shared/utils/confirmations';
import { useLogoutAction } from '@/features/settings/hooks/useLogout';

export function useDeleteAccount() {
  const logout = useLogoutAction();

  return () => {
    showConfirmation(CONFIRM.deleteAccount, async () => {
      await apiDelete('/users/me');
      await logout();
    });
  };
}
