import { useState, useCallback } from 'react';
import { setUser } from '@/shared/store/authSlice';
import { useAppDispatch } from '@/shared/store/hooks';
import { getApiErrorMessage } from '@/shared/services/api';
import { loginWithPassword, persistAuthSession } from '@/features/auth/api/auth.api';
import type { LoginCredentials } from '@/features/auth/types/auth.types';

export function useLogin() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    try {
      const session = await loginWithPassword(credentials);
      await persistAuthSession(session);
      dispatch(setUser(session.user));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error, clearError };
}
