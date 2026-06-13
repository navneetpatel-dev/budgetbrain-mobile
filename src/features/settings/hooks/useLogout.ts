import { apiPost, clearTokens, getRefreshToken } from '@/src/shared/services/api';
import { trackEvent } from '@/src/shared/services/analytics';
import { queryClient } from '@/src/shared/services/queryClient';
import { logout } from '@/src/shared/store/authSlice';
import { useAppDispatch } from '@/src/shared/store/hooks';

export function useLogout() {
  const dispatch = useAppDispatch();

  return async () => {
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
  };
}
