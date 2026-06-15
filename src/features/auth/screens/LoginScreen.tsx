import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/shared/components/ui';
import {
  AuthShell,
  AuthFooter,
  AuthLink,
  AuthErrorBanner,
  SocialAuthButtons,
} from '@/features/auth/components';
import { authFieldRules } from '@/features/auth/utils/authValidation';
import { useLogin } from '@/features/auth/hooks';
import type { LoginCredentials } from '@/features/auth/types';

export function LoginScreen() {
  const { login, loading, error, clearError } = useLogin();
  const { control, handleSubmit, formState: { errors } } = useForm<LoginCredentials>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: LoginCredentials) => {
    clearError();
    void login(data);
  };

  return (
    <AuthShell
      footer={
        <AuthFooter text="Don't have an account?" linkText="Sign Up" href="/(auth)/register" />
      }
    >
      <Controller
        control={control}
        name="email"
        rules={authFieldRules.email}
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
        rules={authFieldRules.password}
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

      {error ? <AuthErrorBanner message={error} /> : null}

      <AuthLink href="/(auth)/forgot-password" align="right">Forgot password?</AuthLink>

      <Button title="Sign In" onPress={handleSubmit(onSubmit)} loading={loading} size="lg" />

      <SocialAuthButtons />

      <AuthLink href="/(auth)/otp-login" align="center">Sign in with OTP</AuthLink>
    </AuthShell>
  );
}
