import { useState } from 'react';
import { apiPost, getApiErrorMessage } from '@/src/shared/services/api';

export function useResetPassword(token: string | undefined) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const resetPassword = async (password: string) => {
    if (!token) {
      throw new Error('Reset token is missing. Open the link from your email.');
    }
    setLoading(true);
    try {
      await apiPost('/auth/reset-password', { token, password });
      setDone(true);
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, 'Could not reset password'));
    } finally {
      setLoading(false);
    }
  };

  return { resetPassword, loading, done };
}
