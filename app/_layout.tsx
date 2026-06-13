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
          <Stack.Screen name="expense/[id]" options={{ headerShown: true, title: 'Expense' }} />
          <Stack.Screen name="income/add" options={{ presentation: 'modal', headerShown: true, title: 'Add Income' }} />
          <Stack.Screen name="budget/add" options={{ presentation: 'modal', headerShown: true, title: 'Create Budget' }} />
          <Stack.Screen name="goal/add" options={{ presentation: 'modal', headerShown: true, title: 'Create Goal' }} />
          <Stack.Screen name="goal/[id]/contribute" options={{ presentation: 'modal', headerShown: true, title: 'Contribute' }} />
          <Stack.Screen name="categories/index" options={{ headerShown: true, title: 'Categories' }} />
          <Stack.Screen name="accounts/index" options={{ headerShown: true, title: 'Accounts' }} />
          <Stack.Screen name="investments/index" options={{ headerShown: true, title: 'Investments' }} />
          <Stack.Screen name="search" options={{ headerShown: true, title: 'Search' }} />
          <Stack.Screen name="reports" options={{ headerShown: true, title: 'Reports' }} />
          <Stack.Screen name="family/index" options={{ headerShown: true, title: 'Family' }} />
          <Stack.Screen name="notifications" options={{ headerShown: true, title: 'Notifications' }} />
          <Stack.Screen name="integrations/index" options={{ headerShown: true, title: 'Integrations' }} />
          <Stack.Screen name="legal/privacy" options={{ headerShown: true, title: 'Privacy Policy' }} />
          <Stack.Screen name="legal/terms" options={{ headerShown: true, title: 'Terms of Service' }} />
          <Stack.Screen name="support/index" options={{ headerShown: true, title: 'Support' }} />
          <Stack.Screen name="income/[id]" options={{ headerShown: true, title: 'Edit Income' }} />
          <Stack.Screen name="budget/[id]" options={{ headerShown: true, title: 'Edit Budget' }} />
          <Stack.Screen name="goal/[id]/index" options={{ headerShown: true, title: 'Edit Goal' }} />
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
