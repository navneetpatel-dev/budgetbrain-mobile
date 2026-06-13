import { useEffect, useState, useMemo } from 'react';
import { StyleSheet, View, Text, AppState, AppStateStatus } from 'react-native';
import { useAppSelector } from '../store/hooks';
import { authenticateWithBiometrics } from '../services/biometrics';
import { useTheme } from '@/src/theme';

interface Props {
  children: React.ReactNode;
}

export function AppLockGate({ children }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const biometricEnabled = useAppSelector((s) => s.settings.biometricEnabled);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [locked, setLocked] = useState(false);
  const [checked, setChecked] = useState(false);

  const unlock = async () => {
    const success = await authenticateWithBiometrics();
    if (success) {
      setLocked(false);
      setChecked(true);
    }
  };

  useEffect(() => {
    if (biometricEnabled && isAuthenticated) {
      setLocked(true);
      unlock();
    } else {
      setChecked(true);
    }
  }, []);

  useEffect(() => {
    if (!biometricEnabled || !isAuthenticated) return;

    const handleAppState = (state: AppStateStatus) => {
      if (state === 'background' || state === 'inactive') {
        setLocked(true);
        setChecked(false);
      } else if (state === 'active' && locked) {
        unlock();
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [biometricEnabled, isAuthenticated, locked]);

  if (biometricEnabled && isAuthenticated && locked) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>BudgetBrain Locked</Text>
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
