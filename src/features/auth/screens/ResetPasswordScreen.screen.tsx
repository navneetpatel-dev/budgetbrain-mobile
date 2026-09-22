import { useMemo } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/shared/components/ui';
import { AuthShell, AuthSuccessBanner, AuthErrorBanner } from '@/features/auth/components';
import { authFieldRules, confirmPasswordRule } from '@/features/auth/utils/authValidation';
import { maxLen } from '@/shared/validation/fieldLimits';
import { useResetPassword } from '@/features/auth/hooks';
import { useTheme } from '@/shared/theme';
import { appHref } from '@/shared/utils/navigation';
import { createStyles } from './ResetPasswordScreen.styles';

interface ResetForm {
  password: string;
  confirmPassword: string;
}

export function ResetPasswordScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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

  const handleBackToSignIn = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(appHref('/(auth)/login'));
    }
  };

  return (
    <AuthShell
      tagline={done ? 'You can now sign in with your new password.' : 'Choose a strong password you haven\'t used before.'}
      panelTitle="New password"
      backHref="/(auth)/login"
    >
      {done ? (
        <View style={styles.actions}>
          <AuthSuccessBanner message="Your password has been reset successfully." />
          <Button
            title="Back to Sign In"
            onPress={handleBackToSignIn}
            size="lg"
          />
        </View>
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
                maxLength={maxLen('password')}
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
                maxLength={maxLen('password')}
                placeholder="Re-enter password"
                error={errors.confirmPassword?.message}
                disabled={loading}
              />
            )}
          />
          {error ? <AuthErrorBanner message={error} /> : null}
          <View style={styles.actions}>
            <Button title="Update Password" onPress={handleSubmit(onSubmit)} loading={loading} disabled={!token} size="lg" />
            <Button
              title="Back to Sign In"
              onPress={handleBackToSignIn}
              variant="outline"
              size="lg"
              disabled={loading}
            />
          </View>
        </>
      )}
    </AuthShell>
  );
}
