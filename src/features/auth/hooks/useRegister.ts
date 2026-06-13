import { useState } from 'react';
import { apiPost, setTokens, getApiErrorMessage } from '@/src/shared/services/api';
import { setUser } from '@/src/shared/store/authSlice';
import { useAppDispatch } from '@/src/shared/store/hooks';
import type { User } from '@/src/shared/types';

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export function useRegister() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      const result = await apiPost<{ accessToken: string; refreshToken: string; user: User }>(
        '/auth/register',
        data
      );
      await setTokens(result.accessToken, result.refreshToken);
      dispatch(setUser(result.user));
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, 'Could not create account'));
    } finally {
      setLoading(false);
    }
  };

  return { register, loading };
}
