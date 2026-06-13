import { useState } from 'react';
import { useRouter } from 'expo-router';
import { setUser } from '@/src/shared/store/authSlice';
import { useAppDispatch } from '@/src/shared/store/hooks';
import { persistAuthSession } from '@/src/features/auth/services/auth.service';
import { signInWithApple, signInWithGoogle } from '@/src/features/auth/services/social-auth.service';
import type { SocialAuthProvider } from '@/src/features/auth/types/auth.types';

export function useSocialAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState<SocialAuthProvider | null>(null);

  const authenticate = async (
    provider: SocialAuthProvider,
    signInFn: () => Promise<Awaited<ReturnType<typeof signInWithGoogle>> | null>,
  ) => {
    setLoading(provider);
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
    } finally {
      setLoading(null);
    }
  };

  const signInGoogle = () => authenticate('google', signInWithGoogle);
  const signInApple = () => authenticate('apple', signInWithApple);

  return { loading, signInGoogle, signInApple };
}
