import { Stack } from 'expo-router';
import { useTheme } from '@/src/theme';

export default function AuthLayout() {
  const theme = useTheme();
  const options = {
    headerStyle: { backgroundColor: theme.colors.background },
    headerTintColor: theme.colors.primary,
    headerTitleStyle: { fontWeight: '700' as const, color: theme.colors.text },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: theme.colors.background },
  };

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" options={{ headerShown: true, title: 'Forgot Password', ...options }} />
      <Stack.Screen name="reset-password" options={{ headerShown: true, title: 'Reset Password', ...options }} />
      <Stack.Screen name="otp-login" options={{ headerShown: true, title: 'OTP Login', ...options }} />
      <Stack.Screen name="verify-email" options={{ headerShown: true, title: 'Verify Email', ...options }} />
    </Stack>
  );
}
