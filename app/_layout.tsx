import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
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
import { ThemeProvider, useTheme } from '@/src/theme';
import type { User } from '@/src/types';

initAnalytics();
initMonitoring();
SplashScreen.preventAutoHideAsync().catch(() => {});

function FontGate({ children }: { children: React.ReactNode }) {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);

  if (!loaded) return <ActivityIndicator style={{ flex: 1 }} />;
  return <>{children}</>;
}

function ThemedStatusBar() {
  const theme = useTheme();
  return <StatusBar style={theme.isDark ? 'light' : 'dark'} />;
}

function LoadingScreen() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

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

  if (isLoading) return <LoadingScreen />;

  return <>{children}</>;
}

function RootNavigator() {
  const theme = useTheme();
  const stackOptions = {
    headerStyle: { backgroundColor: theme.colors.background },
    headerTintColor: theme.colors.primary,
    headerTitleStyle: { fontWeight: '700' as const, color: theme.colors.text },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: theme.colors.background },
  };

  return (
    <AuthGate>
      <AppLockGate>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="expense/add" options={{ presentation: 'modal', headerShown: true, title: 'Add Expense', ...stackOptions }} />
          <Stack.Screen name="expense/[id]" options={{ headerShown: true, title: 'Expense', ...stackOptions }} />
          <Stack.Screen name="income/add" options={{ presentation: 'modal', headerShown: true, title: 'Add Income', ...stackOptions }} />
          <Stack.Screen name="budget/add" options={{ presentation: 'modal', headerShown: true, title: 'Create Budget', ...stackOptions }} />
          <Stack.Screen name="goal/add" options={{ presentation: 'modal', headerShown: true, title: 'Create Goal', ...stackOptions }} />
          <Stack.Screen name="goal/[id]/contribute" options={{ presentation: 'modal', headerShown: true, title: 'Contribute', ...stackOptions }} />
          <Stack.Screen name="categories/index" options={{ headerShown: true, title: 'Categories', ...stackOptions }} />
          <Stack.Screen name="accounts/index" options={{ headerShown: true, title: 'Accounts', ...stackOptions }} />
          <Stack.Screen name="investments/index" options={{ headerShown: true, title: 'Investments', ...stackOptions }} />
          <Stack.Screen name="search" options={{ headerShown: true, title: 'Search', ...stackOptions }} />
          <Stack.Screen name="reports" options={{ headerShown: true, title: 'Reports', ...stackOptions }} />
          <Stack.Screen name="family/index" options={{ headerShown: true, title: 'Family', ...stackOptions }} />
          <Stack.Screen name="notifications" options={{ headerShown: true, title: 'Notifications', ...stackOptions }} />
          <Stack.Screen name="integrations/index" options={{ headerShown: true, title: 'Integrations', ...stackOptions }} />
          <Stack.Screen name="legal/privacy" options={{ headerShown: true, title: 'Privacy Policy', ...stackOptions }} />
          <Stack.Screen name="legal/terms" options={{ headerShown: true, title: 'Terms of Service', ...stackOptions }} />
          <Stack.Screen name="support/index" options={{ headerShown: true, title: 'Support', ...stackOptions }} />
          <Stack.Screen name="income/[id]" options={{ headerShown: true, title: 'Edit Income', ...stackOptions }} />
          <Stack.Screen name="budget/[id]" options={{ headerShown: true, title: 'Edit Budget', ...stackOptions }} />
          <Stack.Screen name="goal/[id]/index" options={{ headerShown: true, title: 'Edit Goal', ...stackOptions }} />
          <Stack.Screen name="subscription" options={{ presentation: 'modal', headerShown: true, title: 'Upgrade', ...stackOptions }} />
        </Stack>
        <ThemedStatusBar />
      </AppLockGate>
    </AuthGate>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={<ActivityIndicator size="large" />} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <FontGate>
              <ThemeProvider>
                <RootNavigator />
              </ThemeProvider>
            </FontGate>
          </SafeAreaProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
