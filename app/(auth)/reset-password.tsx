import { Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/src/shared/components/ui';
import { AuthShell } from '@/src/features/auth/components/AuthShell';
import { AuthFooter } from '@/src/features/auth/components/AuthFooter';
import { AuthSuccessBanner } from '@/src/features/auth/components/AuthSuccessBanner';
import { useResetPassword } from '@/src/features/auth/hooks/useResetPassword';

interface ResetForm {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { resetPassword, loading, done } = useResetPassword(token);
  const { control, handleSubmit, watch, formState: { errors } } = useForm<ResetForm>({
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const onSubmit = async (data: ResetForm) => {
    try {
      await resetPassword(data.password);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not reset password');
    }
  };

  return (
    <AuthShell
      variant="compact"
      title="New password"
      subtitle={done ? 'You can now sign in with your new password.' : 'Choose a strong password you haven\'t used before.'}
      backHref="/(auth)/login"
      footer={<AuthFooter linkText="Back to Sign In" href="/(auth)/login" />}
    >
      {done ? (
        <AuthSuccessBanner message="Your password has been reset successfully." />
      ) : (
        <>
          <Controller
            control={control}
            name="password"
            rules={{ required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } }}
            render={({ field: { onChange, value } }) => (
              <Input
                label="New password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                secureToggle
                placeholder="Min. 8 characters"
                error={errors.password?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              required: 'Confirm your password',
              validate: (v) => v === password || 'Passwords do not match',
            }}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Confirm password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                secureToggle
                placeholder="Re-enter password"
                error={errors.confirmPassword?.message}
              />
            )}
          />
          <Button title="Update Password" onPress={handleSubmit(onSubmit)} loading={loading} disabled={!token} size="lg" />
        </>
      )}
    </AuthShell>
  );
}
