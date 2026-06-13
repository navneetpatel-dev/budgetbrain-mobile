import { useState } from 'react';
import { StyleSheet, View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/src/components/ui';
import { apiPost } from '@/src/services/api';
import { COLORS } from '@/src/constants/config';

interface ForgotForm {
  email: string;
}

export default function ForgotPasswordScreen() {
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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 24 },
  footer: { alignItems: 'center', marginTop: 24 },
  link: { color: COLORS.primary, fontWeight: '600' },
});
