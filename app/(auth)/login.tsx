import { useState } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { Link } from 'expo-router';
import { appHref } from '@/src/utils/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/src/components/ui';
import { AuthShell } from '@/src/components/AuthShell';
import { SocialAuthButtons } from '@/src/components/SocialAuthButtons';
import { apiPost, setTokens, getApiErrorMessage } from '@/src/services/api';
import { setUser } from '@/src/store/authSlice';
import { useAppDispatch } from '@/src/store/hooks';
import { useTheme } from '@/src/theme';
import { useMemo } from 'react';
import type { User } from '@/src/types';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
    <AuthShell>
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

      <Button title="Sign In" onPress={handleSubmit(onSubmit)} loading={loading} size="lg" />

      <SocialAuthButtons />

      <View style={styles.altAuth}>
        <Link href={appHref('/(auth)/otp-login')} style={styles.link}>Sign in with OTP</Link>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <Link href="/(auth)/register" style={styles.link}>Sign Up</Link>
      </View>
    </AuthShell>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    forgotLink: { alignSelf: 'flex-end', color: t.colors.primary, fontWeight: '600', marginBottom: t.spacing.lg },
    altAuth: { alignItems: 'center', marginTop: t.spacing.lg },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: t.spacing.xl },
    footerText: { color: t.colors.textSecondary },
    link: { color: t.colors.primary, fontWeight: '600' },
  });
}
