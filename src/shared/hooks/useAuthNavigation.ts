import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import type { User } from '@/shared/types';

export function useAuthNavigation(
  isAuthenticated: boolean,
  isLoading: boolean,
  user: User | null
) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';

    if (!isAuthenticated && !inAuth) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && user && !user.onboardingCompleted && !inOnboarding) {
      router.replace('/(onboarding)');
    } else if (isAuthenticated && user?.onboardingCompleted && (inAuth || inOnboarding)) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, user, segments, router]);
}
