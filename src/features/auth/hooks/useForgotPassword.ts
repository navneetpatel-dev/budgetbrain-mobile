import { useState } from 'react';
import { requestPasswordReset } from '@/src/features/auth/services/auth.service';
import type { ForgotPasswordInput } from '@/src/features/auth/types/auth.types';

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const forgotPassword = async (input: ForgotPasswordInput) => {
    setLoading(true);
    try {
      await requestPasswordReset(input);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return { forgotPassword, loading, sent };
}
