import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { store, persistor } from '@/src/store';
import { queryClient } from '@/src/services/queryClient';
import { useAppSelector, useAppDispatch } from '@/src/store/hooks';
import { getAccessToken, apiGet } from '@/src/services/api';
import { setUser, setLoading } from '@/src/store/authSlice';
import { AppLockGate } from '@/src/components/AppLockGate';
import { initAnalytics, identifyUser, resetAnalytics } from '@/src/services/analytics';
import { initMonitoring } from '@/src/services/monitoring';
import { initPurchases } from '@/src/services/purchases';
import { registerForPushNotifications } from '@/src/services/notifications';
import { initOfflineSync } from '@/src/services/offlineSync';
import type { User } from '@/src/types';
import { COLORS } from '@/src/constants/config';

initAnalytics();
initMonitoring();

function AuthGate({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user } = useAppSelector((s) => s.auth);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = initOfflineSync();
    return unsubscribe;
  }, []);

  useEffect(() => {
    async function bootstrap() {
      try {
        const token = await getAccessToken();
        if (token) {
          const profile = await apiGet<User>('/users/me');
          dispatch(setUser(profile));
          identifyUser(profile.id, { email: profile.email, role: profile.role });
          await initPurchases(profile.id);
          registerForPushNotifications().catch(() => {});
        } else {
          dispatch(setLoading(false));
        }
      } catch {
        dispatch(setLoading(false));
      }
    }
    bootstrap();
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated) {
      resetAnalytics();
    }
  }, [isAuthenticated]);

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

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

function RootNavigator() {
  return (
    <AuthGate>
      <AppLockGate>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="expense/add" options={{ presentation: 'modal', headerShown: true, title: 'Add Expense' }} />
          <Stack.Screen name="subscription" options={{ presentation: 'modal', headerShown: true, title: 'Upgrade' }} />
        </Stack>
        <StatusBar style="auto" />
      </AppLockGate>
    </AuthGate>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={<ActivityIndicator size="large" color={COLORS.primary} />} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <RootNavigator />
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
