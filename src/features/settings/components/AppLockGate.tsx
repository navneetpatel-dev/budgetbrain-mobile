import { useMemo } from 'react';
import { View } from 'react-native';
import { useAppSelector } from '@/shared/store/hooks';
import { useAppLock } from '@/features/settings/hooks/useAppLock';
import { PinPadModal } from '@/features/settings/components/PinPadModal.component';
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
  const appLockPin = useAppSelector((s) => s.settings.appLockPin);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const hasLock = biometricEnabled || !!appLockPin;

  const { locked, checked, unlockWithPin } = useAppLock(
    biometricEnabled,
    !!appLockPin,
    isAuthenticated
  );

  if (hasLock && isAuthenticated && locked) {
    return (
      <View style={styles.container}>
        <PinPadModal
          visible={true}
          mode="unlock"
          onClose={() => {}}
          onSuccess={unlockWithPin}
        />
      </View>
    );
  }

  if (!checked && hasLock) {
    return <ColdStartSkeleton />;
  }

  return <>{children}</>;
}
