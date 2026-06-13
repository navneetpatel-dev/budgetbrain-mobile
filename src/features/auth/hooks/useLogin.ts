import { useState } from 'react';
import { setUser } from '@/src/shared/store/authSlice';
import { useAppDispatch } from '@/src/shared/store/hooks';
import { loginWithPassword, persistAuthSession } from '@/src/features/auth/services/auth.service';
import type { LoginCredentials } from '@/src/features/auth/types/auth.types';

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
