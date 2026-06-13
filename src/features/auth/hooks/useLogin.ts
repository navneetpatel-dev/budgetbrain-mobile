import { useState } from 'react';
import { apiPost, setTokens, getApiErrorMessage } from '@/src/shared/services/api';
import { setUser } from '@/src/shared/store/authSlice';
import { useAppDispatch } from '@/src/shared/store/hooks';
import type { User } from '@/src/shared/types';

interface LoginData {
  email: string;
  password: string;
}

export function useLogin() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const login = async (data: LoginData) => {
    setLoading(true);
    try {
      const result = await apiPost<{ accessToken: string; refreshToken: string; user: User }>(
        '/auth/login',
        data
      );
      await setTokens(result.accessToken, result.refreshToken);
      dispatch(setUser(result.user));
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}
