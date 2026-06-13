import { useState } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/src/components/ui';
import { apiPost } from '@/src/services/api';
import { COLORS } from '@/src/constants/config';

export default function VerifyEmailScreen() {
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
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: COLORS.background },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 16, textAlign: 'center' },
  message: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 24, textAlign: 'center', lineHeight: 24 },
});
