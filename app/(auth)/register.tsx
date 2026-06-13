import { useMemo } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { Link } from 'expo-router';
import { appHref } from '@/src/shared/utils/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/src/shared/components/ui';
import { AuthShell } from '@/src/features/auth/components/AuthShell';
import { useRegister } from '@/src/features/auth/hooks/useRegister';
import { useTheme } from '@/src/shared/theme';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

export default function RegisterScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { register, loading } = useRegister();
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await register(data);
    } catch (err) {
      Alert.alert('Registration Failed', err instanceof Error ? err.message : 'Could not create account');
    }
  };

  return (
    <AuthShell title="Create Account" subtitle="Start your financial journey">
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
        rules={{ required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } }}
        render={({ field: { onChange, value } }) => (
          <Input
            label="Password"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            secureToggle
            textContentType="newPassword"
            autoComplete="password-new"
            error={errors.password?.message}
          />
        )}
      />

      <Button title="Create Account" onPress={handleSubmit(onSubmit)} loading={loading} size="lg" />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Link href={appHref('/(auth)/login')} style={styles.link}>Sign In</Link>
      </View>
    </AuthShell>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: t.spacing.xl },
    footerText: { color: t.colors.textSecondary },
    link: { color: t.colors.primary, fontWeight: '600' },
  });
}
