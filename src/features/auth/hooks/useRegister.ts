import { useState } from 'react';
import { setUser } from '@/src/shared/store/authSlice';
import { useAppDispatch } from '@/src/shared/store/hooks';
import { persistAuthSession, registerAccount } from '@/src/features/auth/services/auth.service';
import type { RegisterCredentials } from '@/src/features/auth/types/auth.types';

export function useRegister() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const register = async (credentials: RegisterCredentials) => {
    setLoading(true);
    try {
      const session = await registerAccount(credentials);
      await persistAuthSession(session);
      dispatch(setUser(session.user));
    } finally {
      setLoading(false);
    }
  };

  return { register, loading };
}
