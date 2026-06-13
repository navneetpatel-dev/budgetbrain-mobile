import { useState, useMemo } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, Screen } from '@/src/components/ui';
import { apiPost, setTokens } from '@/src/services/api';
import { setUser } from '@/src/store/authSlice';
import { useAppDispatch } from '@/src/store/hooks';
import { useTheme } from '@/src/theme';
import type { User } from '@/src/types';

interface OtpForm {
  email: string;
  otp: string;
}

export default function OtpLoginScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { control, handleSubmit, getValues, formState: { errors } } = useForm<OtpForm>({
    defaultValues: { email: '', otp: '' },
  });

  const requestOtp = async () => {
    const email = getValues('email');
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      await apiPost('/auth/otp/request', { email });
      setOtpSent(true);
      Alert.alert('OTP Sent', 'Check your email for the 6-digit code.');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      Alert.alert('Error', message ?? 'Could not send OTP');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: OtpForm) => {
    setLoading(true);
    try {
      const result = await apiPost<{ accessToken: string; refreshToken: string; user: User }>(
        '/auth/otp/verify',
        { email: data.email, otp: data.otp }
      );
      await setTokens(result.accessToken, result.refreshToken);
      dispatch(setUser(result.user));
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      Alert.alert('Verification Failed', message ?? 'Invalid OTP');
    } finally {
      setLoading(false);
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
          <Input label="Email" value={value} onChangeText={onChange} keyboardType="email-address" autoCapitalize="none" error={errors.email?.message} />
        )}
      />

      {!otpSent ? (
        <Button title="Send OTP" onPress={requestOtp} loading={loading} />
      ) : (
        <>
          <Controller
            control={control}
            name="otp"
            rules={{ required: 'OTP is required', minLength: { value: 6, message: '6 digits required' }, maxLength: { value: 6, message: '6 digits required' } }}
            render={({ field: { onChange, value } }) => (
              <Input label="6-digit OTP" value={value} onChangeText={onChange} keyboardType="number-pad" maxLength={6} error={errors.otp?.message} />
            )}
          />
          <Button title="Verify & Sign In" onPress={handleSubmit(onSubmit)} loading={loading} />
          <View style={styles.resend}>
            <Button title="Resend OTP" onPress={requestOtp} variant="outline" loading={loading} />
          </View>
        </>
      )}

      <View style={styles.footer}>
        <Link href="/(auth)/login" style={styles.link}>Back to Sign In</Link>
      </View>
    </Screen>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
    title: { fontSize: 28, fontWeight: '800', color: t.colors.text, marginBottom: 8 },
    subtitle: { fontSize: 15, color: t.colors.textSecondary, marginBottom: 24 },
    resend: { marginTop: 12 },
    footer: { alignItems: 'center', marginTop: 24 },
    link: { color: t.colors.primary, fontWeight: '600' },
  });
}
