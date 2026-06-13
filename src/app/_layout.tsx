import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
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

initAnalytics();
initMonitoring();
SplashScreen.preventAutoHideAsync().catch(() => {});

function FontGate({ children }: { children: React.ReactNode }) {
  const { fontsLoaded } = useFontBootstrap();

  if (!fontsLoaded) return <ActivityIndicator style={{ flex: 1 }} />;
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

  if (isLoading) return <LoadingScreen />;

  return <>{children}</>;
}

function RootNavigator() {
  const theme = useTheme();
  const stackOptions = {
    headerStyle: { backgroundColor: theme.colors.background },
    headerTintColor: theme.colors.primary,
    headerTitleStyle: { fontWeight: '600' as const, fontSize: 17, color: theme.colors.text },
    headerShadowVisible: false,
    headerBackTitleVisible: false,
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
          <Stack.Screen name="categories/index" options={{ headerShown: false }} />
          <Stack.Screen name="accounts/index" options={{ headerShown: false }} />
          <Stack.Screen name="investments/index" options={{ headerShown: false }} />
          <Stack.Screen name="search" options={{ headerShown: false }} />
          <Stack.Screen name="reports" options={{ headerShown: true, title: 'Reports', ...stackOptions }} />
          <Stack.Screen name="family/index" options={{ headerShown: true, title: 'Family', ...stackOptions }} />
          <Stack.Screen name="notifications" options={{ headerShown: false }} />
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
