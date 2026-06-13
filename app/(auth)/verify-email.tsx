import { useMemo } from 'react';
import { StyleSheet, Text, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Button, Screen } from '@/src/shared/components/ui';
import { useVerifyEmail } from '@/src/features/auth/hooks/useVerifyEmail';
import { useTheme } from '@/src/shared/theme';

export default function VerifyEmailScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { verify, loading, verified, goToLogin } = useVerifyEmail(token);

  const handleVerify = async () => {
    try {
      await verify();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'This verification link is invalid or expired.');
    }
  };

  return (
    <Screen contentContainerStyle={styles.container} padded={false}>
      <Text style={styles.title}>Verify Email</Text>
      {verified ? (
        <>
          <Text style={styles.message}>Your email has been verified successfully.</Text>
          <Button title="Go to Login" onPress={goToLogin} />
        </>
      ) : (
        <>
          <Text style={styles.message}>Tap below to verify your ExpenseFlow account.</Text>
          <Button title="Verify Email" onPress={handleVerify} loading={loading} />
        </>
      )}
    </Screen>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
    title: { fontSize: 28, fontWeight: '800', color: t.colors.text, marginBottom: 16, textAlign: 'center' },
    message: { fontSize: 16, color: t.colors.textSecondary, marginBottom: 24, textAlign: 'center', lineHeight: 24 },
  });
}
