import { useState } from 'react';
import { resetPassword } from '@/src/features/auth/services/auth.service';

export function useResetPassword(token: string | undefined) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const reset = async (password: string) => {
    setLoading(true);
    try {
      await resetPassword({ token: token ?? '', password });
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  return { resetPassword: reset, loading, done };
}
