import { useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/shared/components/ui';
import { AuthShell, AuthFooter, AuthSuccessBanner, AuthErrorBanner } from '@/features/auth/components';
import { authFieldRules, confirmPasswordRule } from '@/features/auth/utils/authValidation';
import { useResetPassword } from '@/features/auth/hooks';

interface ResetForm {
  password: string;
  confirmPassword: string;
}

export function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { resetPassword, loading, done, error, clearError } = useResetPassword(token);
  const { control, handleSubmit, watch, formState: { errors } } = useForm<ResetForm>({
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const onSubmit = (data: ResetForm) => {
    clearError();
    void resetPassword(data.password);
  };

  return (
    <AuthShell
      tagline={done ? 'You can now sign in with your new password.' : 'Choose a strong password you haven\'t used before.'}
      panelTitle="New password"
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
            rules={authFieldRules.passwordMin8}
            render={({ field: { onChange, value } }) => (
              <Input
                label="New password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                secureToggle
                placeholder="Min. 8 characters"
                error={errors.password?.message}
                disabled={loading}
              />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            rules={confirmPasswordRule(password)}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Confirm password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                secureToggle
                placeholder="Re-enter password"
                error={errors.confirmPassword?.message}
                disabled={loading}
              />
            )}
          />
          {error ? <AuthErrorBanner message={error} /> : null}
          <Button title="Update Password" onPress={handleSubmit(onSubmit)} loading={loading} disabled={!token} size="lg" />
        </>
      )}
    </AuthShell>
  );
}
