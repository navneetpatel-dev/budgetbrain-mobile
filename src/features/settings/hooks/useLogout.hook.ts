import { CONFIRM } from '@/shared/constants/confirmations';
import { showConfirmation } from '@/shared/utils/confirmations';
import { apiPost, clearTokens, getRefreshToken } from '@/shared/services/api';
import { trackEvent } from '@/shared/services/analytics';
import { queryClient } from '@/shared/services/queryClient';
import { logout } from '@/shared/store/authSlice';
import { useAppDispatch } from '@/shared/store/hooks';

async function performLogout(dispatch: ReturnType<typeof useAppDispatch>) {
  try {
    const refreshToken = await getRefreshToken();
    if (refreshToken) await apiPost('/auth/logout', { refreshToken });
  } catch {
    /* proceed */
  }
  await clearTokens();
  dispatch(logout());
  queryClient.clear();
  trackEvent('user_logged_out');
}

export function useLogout() {
  const dispatch = useAppDispatch();

  return () => {
    showConfirmation(CONFIRM.signOut, () => performLogout(dispatch));
  };
}

/** Sign out immediately without confirmation — used after account deletion. */
export function useLogoutAction() {
  const dispatch = useAppDispatch();
  return () => performLogout(dispatch);
}
