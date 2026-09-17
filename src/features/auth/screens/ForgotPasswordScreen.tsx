import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/shared/components/ui';
import { AuthShell, AuthSuccessBanner, AuthErrorBanner } from '@/features/auth/components';
import { authFieldRules } from '@/features/auth/utils/authValidation';
import { maxLen } from '@/shared/validation/fieldLimits';
import { useForgotPassword } from '@/features/auth/hooks';
import type { ForgotPasswordInput } from '@/features/auth/types';
import { useTheme } from '@/shared/theme';
import { appHref } from '@/shared/utils/navigation';

export function ForgotPasswordScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { forgotPassword, loading, sent, error, clearError } = useForgotPassword();
  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    defaultValues: { email: '' },
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    clearError();
    void forgotPassword(data);
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
      tagline={sent ? 'Check your inbox for the link.' : 'Enter the email linked to your account.'}
      panelTitle="Reset password"
      backHref="/(auth)/login"
    >
      {sent ? (
        <View style={styles.actions}>
          <AuthSuccessBanner message="If an account exists for that email, a reset link has been sent." />
          <Button
            title="Back to Sign In"
            onPress={handleBackToSignIn}
            variant="outline"
            size="lg"
          />
        </View>
      ) : (
        <>
          <Controller
            control={control}
            name="email"
            rules={authFieldRules.email}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Email"
                maxLength={maxLen('email')}
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
          <View style={styles.actions}>
            <Button title="Send Reset Link" onPress={handleSubmit(onSubmit)} loading={loading} size="lg" />
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

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    actions: {
      gap: t.spacing.md,
      marginTop: t.spacing.xs,
    },
  });
}
