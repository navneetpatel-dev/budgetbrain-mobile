import { useState } from 'react';
import { useRouter } from 'expo-router';
import { apiPost } from '@/src/shared/services/api';

export function useVerifyEmail(token: string | undefined) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const verify = async () => {
    if (!token) {
      throw new Error('No verification token found.');
    }
    setLoading(true);
    try {
      await apiPost('/auth/verify-email', { token });
      setVerified(true);
    } catch {
      throw new Error('This verification link is invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => router.replace('/(auth)/login');

  return { verify, loading, verified, goToLogin };
}
