import { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useAppSelector } from '@/shared/store/hooks';
import { useAppLock } from '@/features/settings/hooks/useAppLock';
import { useTheme } from '@/shared/theme';

interface Props {
  children: React.ReactNode;
}

export function AppLockGate({ children }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const biometricEnabled = useAppSelector((s) => s.settings.biometricEnabled);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { locked, checked } = useAppLock(biometricEnabled, isAuthenticated);

  if (biometricEnabled && isAuthenticated && locked) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>budgetbrain Locked</Text>
        <Text style={styles.subtitle}>Authenticate to continue</Text>
      </View>
    );
  }

  if (!checked && biometricEnabled) {
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>Verifying...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: t.colors.background,
    },
    title: { ...t.typography.title, color: t.colors.text },
    subtitle: { ...t.typography.bodyMedium, color: t.colors.textSecondary, marginTop: t.spacing.sm },
  });
}
