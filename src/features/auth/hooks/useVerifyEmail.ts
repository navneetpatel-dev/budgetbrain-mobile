import { useState } from 'react';
import { useRouter } from 'expo-router';
import { verifyEmailToken } from '@/src/features/auth/services/auth.service';

export function useVerifyEmail(token: string | undefined) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const verify = async () => {
    setLoading(true);
    try {
      await verifyEmailToken(token ?? '');
      setVerified(true);
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => router.replace('/(auth)/login');

  return { verify, loading, verified, goToLogin };
}
