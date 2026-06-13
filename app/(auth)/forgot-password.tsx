import { useState, useMemo } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, Screen } from '@/src/components/ui';
import { apiPost } from '@/src/services/api';
import { useTheme } from '@/src/theme';

interface ForgotForm {
  email: string;
}

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<ForgotForm>({
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotForm) => {
    setLoading(true);
    try {
      await apiPost('/auth/forgot-password', data);
      setSent(true);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      Alert.alert('Error', message ?? 'Could not send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" padded={false}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>
        {sent
          ? 'If an account exists for that email, a reset link has been sent.'
          : 'Enter your email and we will send a reset link.'}
      </Text>

      {!sent && (
        <>
          <Controller
            control={control}
            name="email"
            rules={{ required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } }}
            render={({ field: { onChange, value } }) => (
              <Input label="Email" value={value} onChangeText={onChange} keyboardType="email-address" autoCapitalize="none" error={errors.email?.message} />
            )}
          />
          <Button title="Send Reset Link" onPress={handleSubmit(onSubmit)} loading={loading} />
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
    footer: { alignItems: 'center', marginTop: 24 },
    link: { color: t.colors.primary, fontWeight: '600' },
  });
}
