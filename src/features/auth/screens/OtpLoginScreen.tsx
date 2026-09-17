import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, OtpInput } from '@/shared/components/ui';
import { AuthShell, AuthInfoBanner, AuthErrorBanner } from '@/features/auth/components';
import { authFieldRules } from '@/features/auth/utils/authValidation';
import { maxLen } from '@/shared/validation/fieldLimits';
import { useOtpLogin } from '@/features/auth/hooks';
import { useTheme } from '@/shared/theme';
import { appHref } from '@/shared/utils/navigation';

interface OtpForm {
  email: string;
  otp: string;
}

export function OtpLoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { loading, otpSent, error, info, clearError, requestOtp, verifyOtp } = useOtpLogin();
  const { control, handleSubmit, formState: { errors } } = useForm<OtpForm>({
    defaultValues: { email: '', otp: '' },
  });

  const handleRequestOtp = handleSubmit((data) => {
    clearError();
    void requestOtp(data.email);
  });

  const onSubmit = (data: OtpForm) => {
    clearError();
    void verifyOtp(data.email, data.otp);
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
      tagline="We'll send a 6-digit code to your email."
      panelTitle="OTP sign in"
      backHref="/(auth)/login"
    >
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
            editable={!otpSent && !loading}
            error={errors.email?.message}
            disabled={loading}
          />
        )}
      />

      {info ? <AuthInfoBanner message={info} icon="mail" /> : null}
      {error ? <AuthErrorBanner message={error} /> : null}

      {!otpSent ? (
        <View style={styles.actions}>
          <Button title="Send Code" onPress={handleRequestOtp} loading={loading} size="lg" />
          <Button
            title="Back to Sign In"
            onPress={handleBackToSignIn}
            variant="outline"
            size="lg"
            disabled={loading}
          />
        </View>
      ) : (
        <View style={styles.actions}>
          <Controller
            control={control}
            name="otp"
            rules={authFieldRules.otp}
            render={({ field: { onChange, value } }) => (
              <OtpInput
                label="Verification code"
                value={value}
                onChange={onChange}
                autoFocus
                disabled={loading}
                error={errors.otp?.message}
              />
            )}
          />
          <Button title="Verify & Sign In" onPress={handleSubmit(onSubmit)} loading={loading} size="lg" />
          <Button title="Resend code" onPress={handleRequestOtp} variant="ghost" loading={loading} />
          <Button
            title="Back to Sign In"
            onPress={handleBackToSignIn}
            variant="outline"
            size="lg"
            disabled={loading}
          />
        </View>
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
