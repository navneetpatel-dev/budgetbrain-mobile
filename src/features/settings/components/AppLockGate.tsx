import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useAppSelector } from '@/shared/store/hooks';
import { useAppLock } from '@/features/settings/hooks/useAppLock';
import { ColdStartSkeleton } from '@/shared/components/ui';
import { useTheme } from '@/shared/theme';
import { createStyles } from './AppLockGate.styles';

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
    return <ColdStartSkeleton />;
  }

  return <>{children}</>;
}
