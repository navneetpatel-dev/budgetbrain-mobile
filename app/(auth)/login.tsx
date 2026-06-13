import { useState } from 'react';
import { StyleSheet, View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Link } from 'expo-router';
import { appHref } from '@/src/utils/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/src/components/ui';
import { SocialAuthButtons } from '@/src/components/SocialAuthButtons';
import { apiPost, setTokens, getApiErrorMessage } from '@/src/services/api';
import { setUser } from '@/src/store/authSlice';
import { useAppDispatch } from '@/src/store/hooks';
import { COLORS } from '@/src/constants/config';
import type { User } from '@/src/types';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const result = await apiPost<{ accessToken: string; refreshToken: string; user: User }>(
        '/auth/login',
        data
      );
      await setTokens(result.accessToken, result.refreshToken);
      dispatch(setUser(result.user));
    } catch (err: unknown) {
      Alert.alert('Login Failed', getApiErrorMessage(err, 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>ExpenseFlow</Text>
          <Text style={styles.subtitle}>Track smarter. Save better.</Text>
        </View>

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
          rules={{ required: 'Password is required' }}
          render={({ field: { onChange, value } }) => (
            <Input label="Password" value={value} onChangeText={onChange} secureTextEntry error={errors.password?.message} />
          )}
        />

        <Link href={appHref('/(auth)/forgot-password')} style={styles.forgotLink}>Forgot password?</Link>

        <Button title="Sign In" onPress={handleSubmit(onSubmit)} loading={loading} />

        <SocialAuthButtons />

        <View style={styles.altAuth}>
          <Link href={appHref('/(auth)/otp-login')} style={styles.link}>Sign in with OTP</Link>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/register" style={styles.link}>Sign Up</Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 32, alignItems: 'center' },
  logo: { fontSize: 32, fontWeight: '800', color: COLORS.primary },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, marginTop: 8 },
  forgotLink: { alignSelf: 'flex-end', color: COLORS.primary, fontWeight: '600', marginBottom: 16 },
  altAuth: { alignItems: 'center', marginTop: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: COLORS.textSecondary },
  link: { color: COLORS.primary, fontWeight: '600' },
});
