import { Keyboard } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/shared/components/ui';
import { AuthShell, AuthFooter, AuthInfoBanner, AuthErrorBanner } from '@/features/auth/components';
import { authFieldRules } from '@/features/auth/utils/authValidation';
import { maxLen } from '@/shared/validation/fieldLimits';
import { useOtpLogin } from '@/features/auth/hooks';

interface OtpForm {
  email: string;
  otp: string;
}

export function OtpLoginScreen() {
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

  return (
    <AuthShell
      tagline="We'll send a 6-digit code to your email."
      panelTitle="OTP sign in"
      backHref="/(auth)/login"
      footer={<AuthFooter linkText="Back to Sign In" href="/(auth)/login" />}
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
        <Button title="Send Code" onPress={handleRequestOtp} loading={loading} size="lg" />
      ) : (
        <>
          <Controller
            control={control}
            name="otp"
            rules={authFieldRules.otp}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Verification code"
                value={value}
                onChangeText={onChange}
                keyboardType="number-pad"
                maxLength={maxLen('otp')}
                placeholder="000000"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                returnKeyType="done"
                blurOnSubmit
                onSubmitEditing={Keyboard.dismiss}
                error={errors.otp?.message}
                disabled={loading}
              />
            )}
          />
          <Button title="Verify & Sign In" onPress={handleSubmit(onSubmit)} loading={loading} size="lg" />
          <Button title="Resend code" onPress={handleRequestOtp} variant="ghost" loading={loading} />
        </>
      )}
    </AuthShell>
  );
}
