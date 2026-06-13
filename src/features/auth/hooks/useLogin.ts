import { useState } from 'react';
import { setUser } from '@/shared/store/authSlice';
import { useAppDispatch } from '@/shared/store/hooks';
import { loginWithPassword, persistAuthSession } from '@/features/auth/services/auth.service';
import type { LoginCredentials } from '@/features/auth/types/auth.types';

export function useLogin() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const session = await loginWithPassword(credentials);
      await persistAuthSession(session);
      dispatch(setUser(session.user));
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}
