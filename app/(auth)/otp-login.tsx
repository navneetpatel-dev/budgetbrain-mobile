import { Alert, Keyboard } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/src/shared/components/ui';
import { AuthShell } from '@/src/features/auth/components/AuthShell';
import { AuthFooter } from '@/src/features/auth/components/AuthFooter';
import { useOtpLogin } from '@/src/features/auth/hooks/useOtpLogin';

interface OtpForm {
  email: string;
  otp: string;
}

export default function OtpLoginScreen() {
  const { loading, otpSent, requestOtp, verifyOtp } = useOtpLogin();
  const { control, handleSubmit, getValues, formState: { errors } } = useForm<OtpForm>({
    defaultValues: { email: '', otp: '' },
  });

  const handleRequestOtp = async () => {
    const email = getValues('email');
    try {
      await requestOtp(email);
      Alert.alert('OTP Sent', 'Check your email for the 6-digit code.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not send OTP';
      const title = message.includes('valid email') ? 'Invalid Email' : 'Error';
      Alert.alert(title, message);
    }
  };

  const onSubmit = async (data: OtpForm) => {
    try {
      await verifyOtp(data.email, data.otp);
    } catch (err) {
      Alert.alert('Verification Failed', err instanceof Error ? err.message : 'Invalid OTP');
    }
  };

  return (
    <AuthShell
      variant="compact"
      title="OTP sign in"
      subtitle="We'll send a 6-digit code to your email."
      backHref="/(auth)/login"
      footer={<AuthFooter linkText="Back to Sign In" href="/(auth)/login" />}
    >
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
            editable={!otpSent}
            error={errors.email?.message}
          />
        )}
      />

      {!otpSent ? (
        <Button title="Send Code" onPress={handleRequestOtp} loading={loading} size="lg" />
      ) : (
        <>
          <Controller
            control={control}
            name="otp"
            rules={{ required: 'OTP is required', minLength: { value: 6, message: '6 digits required' }, maxLength: { value: 6, message: '6 digits required' } }}
            render={({ field: { onChange, value } }) => (
              <Input
                label="Verification code"
                value={value}
                onChangeText={onChange}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="000000"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                returnKeyType="done"
                blurOnSubmit
                onSubmitEditing={Keyboard.dismiss}
                error={errors.otp?.message}
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
