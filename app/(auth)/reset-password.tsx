import { useMemo } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, Screen } from '@/src/shared/components/ui';
import { useResetPassword } from '@/src/features/auth/hooks/useResetPassword';
import { useTheme } from '@/src/shared/theme';

interface ResetForm {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { resetPassword, loading, done } = useResetPassword(token);
  const { control, handleSubmit, watch, formState: { errors } } = useForm<ResetForm>({
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const onSubmit = async (data: ResetForm) => {
    try {
      await resetPassword(data.password);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not reset password');
    }
  };

  return (
    <Screen contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" padded={false}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>
        {done ? 'Your password has been reset successfully.' : 'Enter your new password below.'}
      </Text>

      {!done && (
        <>
          <Controller
            control={control}
            name="password"
            rules={{ required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } }}
            render={({ field: { onChange, value } }) => (
              <Input label="New Password" value={value} onChangeText={onChange} secureTextEntry error={errors.password?.message} />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              required: 'Confirm your password',
              validate: (v) => v === password || 'Passwords do not match',
            }}
            render={({ field: { onChange, value } }) => (
              <Input label="Confirm Password" value={value} onChangeText={onChange} secureTextEntry error={errors.confirmPassword?.message} />
            )}
          />
          <Button title="Reset Password" onPress={handleSubmit(onSubmit)} loading={loading} disabled={!token} />
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
