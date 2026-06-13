import { useMemo } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { Link } from 'expo-router';
import { appHref } from '@/src/shared/utils/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/src/shared/components/ui';
import { AuthShell } from '@/src/features/auth/components/AuthShell';
import { SocialAuthButtons } from '@/src/features/auth/components/SocialAuthButtons';
import { useLogin } from '@/src/features/auth/hooks/useLogin';
import { useTheme } from '@/src/shared/theme';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { login, loading } = useLogin();
  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data);
    } catch (err) {
      Alert.alert('Login Failed', err instanceof Error ? err.message : 'Invalid credentials');
    }
  };

  return (
    <AuthShell>
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

      <Controller
        control={control}
        name="password"
        rules={{ required: 'Password is required' }}
        render={({ field: { onChange, value } }) => (
          <Input
            label="Password"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            secureToggle
            textContentType="password"
            autoComplete="password"
            error={errors.password?.message}
          />
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
        <Link href={appHref('/(auth)/register')} style={styles.link}>Sign Up</Link>
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
