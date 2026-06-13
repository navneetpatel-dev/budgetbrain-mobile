import { useMemo } from 'react';
import { View, Text, StyleSheet, Platform, Alert } from 'react-native';
import { Button } from '@/src/shared/components/ui';
import { useSocialAuth } from '@/src/features/auth/hooks/useSocialAuth';
import { useTheme } from '@/src/shared/theme';

export function SocialAuthButtons() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { loading, signInGoogle, signInApple } = useSocialAuth();

  const onGoogle = async () => {
    try {
      await signInGoogle();
    } catch (err) {
      Alert.alert('Google Sign-In Failed', err instanceof Error ? err.message : 'Could not sign in');
    }
  };

  const onApple = async () => {
    try {
      await signInApple();
    } catch (err) {
      if (err instanceof Error && err.message.includes('ERR_REQUEST_CANCELED')) return;
      Alert.alert('Apple Sign-In Failed', err instanceof Error ? err.message : 'Could not sign in');
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
