import { useState, useMemo } from 'react';
import { StyleSheet, Text, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Screen } from '@/src/components/ui';
import { apiPost } from '@/src/services/api';
import { useTheme } from '@/src/theme';

export default function VerifyEmailScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { token } = useLocalSearchParams<{ token?: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const verify = async () => {
    if (!token) {
      Alert.alert('Invalid Link', 'No verification token found.');
      return;
    }
    setLoading(true);
    try {
      await apiPost('/auth/verify-email', { token });
      setVerified(true);
    } catch {
      Alert.alert('Error', 'This verification link is invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentContainerStyle={styles.container} padded={false}>
      <Text style={styles.title}>Verify Email</Text>
      {verified ? (
        <>
          <Text style={styles.message}>Your email has been verified successfully.</Text>
          <Button title="Go to Login" onPress={() => router.replace('/(auth)/login')} />
        </>
      ) : (
        <>
          <Text style={styles.message}>Tap below to verify your ExpenseFlow account.</Text>
          <Button title="Verify Email" onPress={verify} loading={loading} />
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
