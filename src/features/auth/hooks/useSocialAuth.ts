import { useState } from 'react';
import { useRouter } from 'expo-router';
import { signInWithGoogle, signInWithApple } from '@/src/shared/services/socialAuth';
import { setTokens } from '@/src/shared/services/api';
import { setUser } from '@/src/shared/store/authSlice';
import { useAppDispatch } from '@/src/shared/store/hooks';

export function useSocialAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null);

  const authenticate = async (
    provider: 'google' | 'apple',
    signInFn: () => Promise<Awaited<ReturnType<typeof signInWithGoogle>> | null>
  ) => {
    setLoading(provider);
    try {
      const result = await signInFn();
      if (!result) return;
      await setTokens(result.accessToken, result.refreshToken);
      dispatch(setUser(result.user));
      if (!result.user.onboardingCompleted) {
        router.replace('/(onboarding)');
      } else {
        router.replace('/(tabs)');
      }
    } catch (err) {
      throw err;
    } finally {
      setLoading(null);
    }
  };

  const signInGoogle = () => authenticate('google', signInWithGoogle);
  const signInApple = () => authenticate('apple', signInWithApple);

  return { loading, signInGoogle, signInApple };
}
