import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { store, persistor } from '@/shared/store';
import { queryClient } from '@/shared/services/queryClient';
import { useAppSelector } from '@/shared/store/hooks';
import { AppLockGate } from '@/features/settings/components/AppLockGate';
import { initAnalytics, resetAnalytics } from '@/shared/services/analytics';
import { initMonitoring } from '@/shared/services/monitoring';
import { initOfflineSync } from '@/shared/services/offlineSync';
import { ThemeProvider, useTheme } from '@/shared/theme';
import { useFontBootstrap } from '@/shared/hooks/useFontBootstrap';
import { useAuthBootstrap } from '@/shared/hooks/useAuthBootstrap';
import { useAuthNavigation } from '@/shared/hooks/useAuthNavigation';
import { FeatureSplashScreen } from '@/shared/components/brand/FeatureSplashScreen';

initAnalytics();
initMonitoring();
SplashScreen.preventAutoHideAsync().catch(() => {});

function FontGate({ children }: { children: React.ReactNode }) {
  const { fontsLoaded } = useFontBootstrap();
  if (!fontsLoaded) return <FeatureSplashScreen />;
  return <>{children}</>;
}

function ThemedStatusBar() {
  const theme = useTheme();
  return <StatusBar style={theme.isDark ? 'light' : 'dark'} />;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    const unsubscribe = initOfflineSync();
    return unsubscribe;
  }, []);

  useAuthBootstrap();
  useAuthNavigation(isAuthenticated, isLoading, user);

  useEffect(() => {
    if (!isAuthenticated) {
      resetAnalytics();
    }
  }, [isAuthenticated]);

  if (isLoading) return <FeatureSplashScreen />;

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
          <Stack.Screen name="expense/add" options={{ presentation: 'modal' }} />
          <Stack.Screen name="expense/[id]" />
          <Stack.Screen name="income/add" options={{ presentation: 'modal' }} />
          <Stack.Screen name="budget/add" options={{ presentation: 'modal' }} />
          <Stack.Screen name="goal/add" options={{ presentation: 'modal' }} />
          <Stack.Screen name="goal/[id]/contribute" options={{ presentation: 'modal' }} />
          <Stack.Screen name="net-worth" />
          <Stack.Screen name="categories/index" />
          <Stack.Screen name="accounts/index" />
          <Stack.Screen name="investments/index" />
          <Stack.Screen name="search" />
          <Stack.Screen name="reports" />
          <Stack.Screen name="family/index" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="integrations/index" />
          <Stack.Screen name="legal/privacy" />
          <Stack.Screen name="legal/terms" />
          <Stack.Screen name="support/index" />
          <Stack.Screen name="income/[id]" />
          <Stack.Screen name="budget/[id]" />
          <Stack.Screen name="goal/[id]/index" />
          <Stack.Screen name="subscription" options={{ presentation: 'modal' }} />
        </Stack>
        <ThemedStatusBar />
      </AppLockGate>
    </AuthGate>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <ThemeProvider>
              <FontGate>
                <RootNavigator />
              </FontGate>
            </ThemeProvider>
          </SafeAreaProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
