import { useState, useCallback } from 'react';
import { getApiErrorMessage } from '@/shared/services/api';
import { resetPassword } from '@/features/auth/api/auth.api';

export function useResetPassword(token: string | undefined) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const resetPasswordFn = async (password: string) => {
    setLoading(true);
    setError(null);
    try {
      await resetPassword({ token: token ?? '', password });
      setDone(true);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not reset password'));
    } finally {
      setLoading(false);
    }
  };

  return { resetPassword: resetPasswordFn, loading, done, error, clearError };
}
