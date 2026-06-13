import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" options={{ headerShown: true, title: 'Forgot Password' }} />
      <Stack.Screen name="reset-password" options={{ headerShown: true, title: 'Reset Password' }} />
      <Stack.Screen name="otp-login" options={{ headerShown: true, title: 'OTP Login' }} />
      <Stack.Screen name="verify-email" options={{ headerShown: true, title: 'Verify Email' }} />
    </Stack>
  );
}
