import { useMemo } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, ActivityIndicator } from 'react-native';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useSocialAuth } from '@/features/auth/hooks/useSocialAuth';
import { AuthDivider } from '@/features/auth/components/ui/AuthDivider';
import { useTheme } from '@/shared/theme';

function GoogleMark() {
  return (
    <View style={markStyles.circle}>
      <Text style={markStyles.g}>G</Text>
    </View>
  );
}

const markStyles = StyleSheet.create({
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  g: { fontSize: 13, fontWeight: '700', color: '#4285F4' },
});

function SocialAuthError({ message }: { message: string }) {
  const theme = useTheme();
  return (
    <Text
      accessibilityRole="alert"
      style={{
        color: theme.colors.danger,
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 18,
        marginTop: theme.spacing.sm,
        textAlign: 'center',
      }}
    >
      {message}
    </Text>
  );
}

export function SocialAuthButtons() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { loading, error, clearError, signInGoogle, signInApple } = useSocialAuth();

  const onGoogle = () => {
    clearError();
    void signInGoogle();
  };

  const onApple = () => {
    clearError();
    void signInApple();
  };

  return (
    <View style={styles.container}>
      <AuthDivider label="or sign in with" />
      <View style={styles.row}>
        <SocialButton
          label="Google"
          onPress={onGoogle}
          loading={loading === 'google'}
          disabled={!!loading}
          icon={<GoogleMark />}
        />
        {Platform.OS === 'ios' && (
          <SocialButton
            label="Apple"
            onPress={onApple}
            loading={loading === 'apple'}
            disabled={!!loading}
            icon={<AppIcon name="apple" size={20} color={theme.colors.text} />}
          />
        )}
      </View>
      {error ? <SocialAuthError message={error} /> : null}
    </View>
  );
}

function SocialButton({
  label,
  onPress,
  loading,
  disabled,
  icon,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createBtnStyles(theme), [theme]);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        (disabled || loading) && styles.btnDisabled,
        pressed && !disabled && !loading && styles.btnPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={theme.colors.primary} />
      ) : (
        <>
          {icon}
          <Text style={styles.label}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { marginTop: t.spacing.lg },
    row: { flexDirection: 'row', gap: t.spacing.sm },
  });
}

function createBtnStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    btn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingVertical: 14,
      borderRadius: t.radii.lg,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
    },
    btnDisabled: { opacity: 0.5 },
    btnPressed: { opacity: 0.88 },
    label: { ...t.typography.bodySemibold, fontSize: 15, color: t.colors.text },
  });
}
