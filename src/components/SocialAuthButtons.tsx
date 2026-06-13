import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from './ui';
import { signInWithGoogle, signInWithApple } from '../services/socialAuth';
import { setTokens } from '../services/api';
import { setUser } from '../store/authSlice';
import { useAppDispatch } from '../store/hooks';
import { useTheme } from '@/src/theme';

export function SocialAuthButtons() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null);

  const handleResult = async (
    result: Awaited<ReturnType<typeof signInWithGoogle>> | null,
    provider: string
  ) => {
    if (!result) return;
    await setTokens(result.accessToken, result.refreshToken);
    dispatch(setUser(result.user));
    if (!result.user.onboardingCompleted) {
      router.replace('/(onboarding)');
    } else {
      router.replace('/(tabs)');
    }
    void provider;
  };

  const onGoogle = async () => {
    setLoading('google');
    try {
      const result = await signInWithGoogle();
      await handleResult(result, 'google');
    } catch (err) {
      Alert.alert('Google Sign-In Failed', err instanceof Error ? err.message : 'Could not sign in');
    } finally {
      setLoading(null);
    }
  };

  const onApple = async () => {
    setLoading('apple');
    try {
      const result = await signInWithApple();
      await handleResult(result, 'apple');
    } catch (err) {
      if (err instanceof Error && err.message.includes('ERR_REQUEST_CANCELED')) return;
      Alert.alert('Apple Sign-In Failed', err instanceof Error ? err.message : 'Could not sign in');
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.divider}>or continue with</Text>
      <Button
        title="Google"
        onPress={onGoogle}
        variant="outline"
        loading={loading === 'google'}
        disabled={!!loading}
      />
      {Platform.OS === 'ios' && (
        <View style={styles.spacer}>
          <Button
            title="Apple"
            onPress={onApple}
            variant="outline"
            loading={loading === 'apple'}
            disabled={!!loading}
          />
        </View>
      )}
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { marginTop: t.spacing.lg },
    divider: { textAlign: 'center', color: t.colors.textSecondary, marginBottom: t.spacing.md, fontSize: 14 },
    spacer: { marginTop: t.spacing.sm },
  });
}
