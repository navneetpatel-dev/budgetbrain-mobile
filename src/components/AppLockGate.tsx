import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, AppState, AppStateStatus } from 'react-native';
import { useAppSelector } from '../store/hooks';
import { authenticateWithBiometrics } from '../services/biometrics';
import { COLORS } from '../constants/config';

interface Props {
  children: React.ReactNode;
}

export function AppLockGate({ children }: Props) {
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
        <Text style={styles.title}>ExpenseFlow Locked</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, marginTop: 8 },
});
