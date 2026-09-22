import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { setUser } from '@/shared/store/authSlice';
import { useAppDispatch } from '@/shared/store/hooks';
import { persistAuthSession } from '@/features/auth/api/auth.api';
import { signInWithApple, signInWithGoogle } from '@/features/auth/api/social-auth.api';
import { getSocialAuthErrorMessage } from '@/features/auth/utils/socialAuthErrors';
import type { SocialAuthProvider } from '@/features/auth/types/auth.types';

export function useSocialAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState<SocialAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const authenticate = async (
    provider: SocialAuthProvider,
    signInFn: () => Promise<Awaited<ReturnType<typeof signInWithGoogle>> | null>,
  ) => {
    setLoading(provider);
    setError(null);
    try {
      const session = await signInFn();
      if (!session) return;
      await persistAuthSession(session);
      dispatch(setUser(session.user));
      if (!session.user.onboardingCompleted) {
        router.replace('/(onboarding)');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err) {
      const message = getSocialAuthErrorMessage(provider, err);
      if (message) setError(message);
    } finally {
      setLoading(null);
    }
  };

  const signInGoogle = () => authenticate('google', signInWithGoogle);
  const signInApple = () => authenticate('apple', signInWithApple);

  return { loading, error, clearError, signInGoogle, signInApple };
}
