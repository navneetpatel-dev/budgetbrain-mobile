import { useState, useCallback } from 'react';
import { setUser } from '@/shared/store/authSlice';
import { useAppDispatch } from '@/shared/store/hooks';
import { getApiErrorMessage } from '@/shared/services/api';
import { persistAuthSession, registerAccount } from '@/features/auth/services/auth.service';
import type { RegisterCredentials } from '@/features/auth/types/auth.types';

export function useRegister() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const register = async (credentials: RegisterCredentials) => {
    setLoading(true);
    setError(null);
    try {
      const session = await registerAccount(credentials);
      await persistAuthSession(session);
      dispatch(setUser(session.user));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create account'));
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error, clearError };
}
