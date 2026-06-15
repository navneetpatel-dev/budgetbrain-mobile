import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/shared/components/ui';
import { AuthShell, AuthFooter, AuthSuccessBanner, AuthErrorBanner } from '@/features/auth/components';
import { authFieldRules } from '@/features/auth/utils/authValidation';
import { useForgotPassword } from '@/features/auth/hooks';
import type { ForgotPasswordInput } from '@/features/auth/types';

export function ForgotPasswordScreen() {
  const { forgotPassword, loading, sent, error, clearError } = useForgotPassword();
  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    defaultValues: { email: '' },
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    clearError();
    void forgotPassword(data);
  };

  return (
    <AuthShell
      tagline={sent ? 'Check your inbox for the link.' : 'Enter the email linked to your account.'}
      panelTitle="Reset password"
      backHref="/(auth)/login"
      footer={<AuthFooter linkText="Back to Sign In" href="/(auth)/login" />}
    >
      {sent ? (
        <AuthSuccessBanner message="If an account exists for that email, a reset link has been sent." />
      ) : (
        <>
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
          {error ? <AuthErrorBanner message={error} /> : null}
          <Button title="Send Reset Link" onPress={handleSubmit(onSubmit)} loading={loading} size="lg" />
        </>
      )}
    </AuthShell>
  );
}
