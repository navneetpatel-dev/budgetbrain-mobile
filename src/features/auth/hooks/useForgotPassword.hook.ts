import { useState, useCallback } from 'react';
import { getApiErrorMessage } from '@/shared/services/api';
import { requestPasswordReset } from '@/features/auth/api/auth.api';
import type { ForgotPasswordInput } from '@/features/auth/types/auth.types';

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const forgotPassword = async (input: ForgotPasswordInput) => {
    setLoading(true);
    setError(null);
    try {
      await requestPasswordReset(input);
      setSent(true);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not send reset email'));
    } finally {
      setLoading(false);
    }
  };

  return { forgotPassword, loading, sent, error, clearError };
}
