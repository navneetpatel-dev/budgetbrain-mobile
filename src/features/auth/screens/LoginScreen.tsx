import { Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/shared/components/ui';
import {
  AuthShell,
  AuthFooter,
  AuthLink,
  SocialAuthButtons,
} from '@/features/auth/components';
import { useLogin } from '@/features/auth/hooks';
import type { LoginCredentials } from '@/features/auth/types';

export function LoginScreen() {
  const { login, loading } = useLogin();
  const { control, handleSubmit, formState: { errors } } = useForm<LoginCredentials>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginCredentials) => {
    try {
      await login(data);
    } catch (err) {
      Alert.alert('Login Failed', err instanceof Error ? err.message : 'Invalid credentials');
    }
  };

  return (
    <AuthShell
      subtitle="Track smarter. Save better."
      panelTitle="Welcome back"
      footer={
        <AuthFooter text="Don't have an account?" linkText="Sign Up" href="/(auth)/register" />
      }
    >
      <Controller
        control={control}
        name="email"
        rules={{ required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } }}
        render={({ field: { onChange, value } }) => (
          <Input
            label="Email"
            value={value}
            onChangeText={onChange}
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        rules={{ required: 'Password is required' }}
        render={({ field: { onChange, value } }) => (
          <Input
            label="Password"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            secureToggle
            textContentType="password"
            autoComplete="password"
            placeholder="Your password"
            error={errors.password?.message}
          />
        )}
      />

      <AuthLink href="/(auth)/forgot-password" align="right">Forgot password?</AuthLink>

      <Button title="Sign In" onPress={handleSubmit(onSubmit)} loading={loading} size="lg" />

      <SocialAuthButtons />

      <AuthLink href="/(auth)/otp-login" align="center">Sign in with OTP</AuthLink>
    </AuthShell>
  );
}
