import { useMemo } from 'react';
import { StyleSheet, View, Text, Alert, Keyboard } from 'react-native';
import { Link } from 'expo-router';
import { appHref } from '@/src/shared/utils/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, Screen } from '@/src/shared/components/ui';
import { useOtpLogin } from '@/src/features/auth/hooks/useOtpLogin';
import { useTheme } from '@/src/shared/theme';

interface OtpForm {
  email: string;
  otp: string;
}

export default function OtpLoginScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
    <Screen contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" padded={false}>
      <Text style={styles.title}>Login with OTP</Text>
      <Text style={styles.subtitle}>We will email you a one-time code</Text>

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
            error={errors.email?.message}
          />
        )}
      />

      {!otpSent ? (
        <Button title="Send OTP" onPress={handleRequestOtp} loading={loading} />
      ) : (
        <>
          <Controller
            control={control}
            name="otp"
            rules={{ required: 'OTP is required', minLength: { value: 6, message: '6 digits required' }, maxLength: { value: 6, message: '6 digits required' } }}
            render={({ field: { onChange, value } }) => (
              <Input
                label="6-digit OTP"
                value={value}
                onChangeText={onChange}
                keyboardType="number-pad"
                maxLength={6}
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                returnKeyType="done"
                blurOnSubmit
                onSubmitEditing={Keyboard.dismiss}
                error={errors.otp?.message}
              />
            )}
          />
          <Button title="Done entering code" onPress={Keyboard.dismiss} variant="ghost" />
          <Button title="Verify & Sign In" onPress={handleSubmit(onSubmit)} loading={loading} />
          <View style={styles.resend}>
            <Button title="Resend OTP" onPress={handleRequestOtp} variant="outline" loading={loading} />
          </View>
        </>
      )}

      <View style={styles.footer}>
        <Link href={appHref('/(auth)/login')} style={styles.link}>Back to Sign In</Link>
      </View>
    </Screen>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
    title: { ...t.typography.display, color: t.colors.text, marginBottom: 8 },
    subtitle: { ...t.typography.bodyMedium, color: t.colors.textSecondary, marginBottom: 24 },
    resend: { marginTop: 12 },
    footer: { alignItems: 'center', marginTop: 24 },
    link: { color: t.colors.primary, fontWeight: '600' },
  });
}
