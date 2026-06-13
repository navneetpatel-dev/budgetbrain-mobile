import { Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/shared/components/ui';
import { AuthShell, AuthFooter, AuthSuccessBanner } from '@/features/auth/components';
import { useForgotPassword } from '@/features/auth/hooks';
import type { ForgotPasswordInput } from '@/features/auth/types';

export function ForgotPasswordScreen() {
  const { forgotPassword, loading, sent } = useForgotPassword();
  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      await forgotPassword(data);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not send reset email');
    }
  };

  return (
    <AuthShell
      variant="compact"
      title="Reset password"
      subtitle={sent ? 'Check your inbox for the link.' : 'Enter the email linked to your account.'}
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
          <Button title="Send Reset Link" onPress={handleSubmit(onSubmit)} loading={loading} size="lg" />
        </>
      )}
    </AuthShell>
  );
}
