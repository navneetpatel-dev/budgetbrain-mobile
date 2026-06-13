import { useState } from 'react';
import { apiPost, getApiErrorMessage } from '@/src/shared/services/api';

interface ForgotPasswordData {
  email: string;
}

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const forgotPassword = async (data: ForgotPasswordData) => {
    setLoading(true);
    try {
      await apiPost('/auth/forgot-password', data);
      setSent(true);
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, 'Could not send reset email'));
    } finally {
      setLoading(false);
    }
  };

  return { forgotPassword, loading, sent };
}
