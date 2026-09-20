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
    // A family invite may create a brand-new account on accept — the accept screen must be
    // reachable while unauthenticated, the same way (auth) routes are, or a first-time
    // invitee gets redirected to /login before the accept call ever runs.
    // Cast to a plain string array: Expo Router's typed-routes tuple type for `segments` is
    // generated from known routes and doesn't always include a second segment for every
    // first-segment literal, even though more segments genuinely exist at runtime.
    const segmentList = segments as readonly string[];
    const inFamilyInviteAccept = segmentList[0] === 'family' && segmentList[1] === 'accept-invite';

    if (!isAuthenticated && !inAuth && !inFamilyInviteAccept) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && user && !user.onboardingCompleted && !inOnboarding) {
      router.replace('/(onboarding)');
    } else if (isAuthenticated && user?.onboardingCompleted && (inAuth || inOnboarding)) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, user, segments, router]);
}
