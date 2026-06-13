import { Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/src/shared/components/ui';
import { AuthShell } from '@/src/features/auth/components/AuthShell';
import { AuthFooter } from '@/src/features/auth/components/AuthFooter';
import { AuthSuccessBanner } from '@/src/features/auth/components/AuthSuccessBanner';
import { useForgotPassword } from '@/src/features/auth/hooks/useForgotPassword';

interface ForgotForm {
  email: string;
}

export default function ForgotPasswordScreen() {
  const { forgotPassword, loading, sent } = useForgotPassword();
  const { control, handleSubmit, formState: { errors } } = useForm<ForgotForm>({
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotForm) => {
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
