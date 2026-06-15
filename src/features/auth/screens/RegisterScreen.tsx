import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/shared/components/ui';
import { AuthShell, AuthFooter, AuthErrorBanner } from '@/features/auth/components';
import { authFieldRules } from '@/features/auth/utils/authValidation';
import { useRegister } from '@/features/auth/hooks';
import type { RegisterCredentials } from '@/features/auth/types';

export function RegisterScreen() {
  const { register, loading, error, clearError } = useRegister();
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterCredentials>({
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = (data: RegisterCredentials) => {
    clearError();
    void register(data);
  };

  return (
    <AuthShell
      tagline="Set up your profile in under a minute."
      panelTitle="Create account"
      backHref="/(auth)/login"
      footer={
        <AuthFooter text="Already have an account?" linkText="Sign In" href="/(auth)/login" />
      }
    >
      <Controller
        control={control}
        name="name"
        rules={authFieldRules.name}
        render={({ field: { onChange, value } }) => (
          <Input label="Full name" value={value} onChangeText={onChange} placeholder="Jane Doe" error={errors.name?.message} disabled={loading} />
        )}
      />

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
            disabled={loading}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        rules={authFieldRules.passwordMin8}
        render={({ field: { onChange, value } }) => (
          <Input
            label="Password"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            secureToggle
            textContentType="newPassword"
            autoComplete="password-new"
            placeholder="Min. 8 characters"
            error={errors.password?.message}
            disabled={loading}
          />
        )}
      />

      {error ? <AuthErrorBanner message={error} /> : null}

      <Button title="Create Account" onPress={handleSubmit(onSubmit)} loading={loading} size="lg" />
    </AuthShell>
  );
}
