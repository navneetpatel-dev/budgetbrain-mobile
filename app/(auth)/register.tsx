import { useState } from 'react';
import { StyleSheet, View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/src/components/ui';
import { apiPost, setTokens } from '@/src/services/api';
import { setUser } from '@/src/store/authSlice';
import { useAppDispatch } from '@/src/store/hooks';
import { COLORS } from '@/src/constants/config';
import type { User } from '@/src/types';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

export default function RegisterScreen() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const result = await apiPost<{ accessToken: string; refreshToken: string; user: User }>(
        '/auth/register',
        data
      );
      await setTokens(result.accessToken, result.refreshToken);
      dispatch(setUser(result.user));
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      Alert.alert('Registration Failed', message ?? 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start your financial journey</Text>
        </View>

        <Controller
          control={control}
          name="name"
          rules={{ required: 'Name is required' }}
          render={({ field: { onChange, value } }) => (
            <Input label="Full Name" value={value} onChangeText={onChange} error={errors.name?.message} />
          )}
        />

        <Controller
          control={control}
          name="email"
          rules={{ required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } }}
          render={({ field: { onChange, value } }) => (
            <Input label="Email" value={value} onChangeText={onChange} keyboardType="email-address" autoCapitalize="none" error={errors.email?.message} />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{ required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } }}
          render={({ field: { onChange, value } }) => (
            <Input label="Password" value={value} onChangeText={onChange} secureTextEntry error={errors.password?.message} />
          )}
        />

        <Button title="Create Account" onPress={handleSubmit(onSubmit)} loading={loading} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" style={styles.link}>Sign In</Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, marginTop: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: COLORS.textSecondary },
  link: { color: COLORS.primary, fontWeight: '600' },
});
