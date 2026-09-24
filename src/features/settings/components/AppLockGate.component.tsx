import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useAppSelector } from '@/shared/store/hooks';
import { useAppLock } from '@/features/settings/hooks/useAppLock.hook';
import { PinPadModal } from '@/features/settings/components/PinPadModal.component';
import { AppLoadingScreen } from '@/shared/components/brand/AppLoadingScreen.component';
import { useTheme } from '@/shared/theme';
import { useLogoutAction } from '@/features/settings/hooks/useLogout.hook';
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
  const hasPin = !!appLockPin;
  const hasLock = biometricEnabled || hasPin;
  // Set once the PIN is saved, until the store reports it (hasPin).
  const [pinSetupDone, setPinSetupDone] = useState(false);
  const signOut = useLogoutAction();

  const { locked, checked, unlockWithPin, unlockWithBiometrics } = useAppLock(
    biometricEnabled,
    hasPin,
    isAuthenticated
  );

  // Biometric unlock needs a PIN fallback: ask for one once the app is unlocked without it.
  const needsPinSetup = !pinSetupDone && !locked && isAuthenticated && biometricEnabled && !hasPin;

  const handleBiometricUnlock = async () => {
    await unlockWithBiometrics();
  };

  const handleUnlocked = () => {
    unlockWithPin();
  };

  if (hasLock && isAuthenticated && locked) {
    return (
      <View style={styles.container}>
        <PinPadModal
          visible={true}
          mode={hasPin ? 'unlock' : 'unlock'}
          allowEmptyPin={!hasPin}
          onClose={() => {}}
          onSuccess={handleUnlocked}
          onRetryBiometrics={biometricEnabled ? handleBiometricUnlock : undefined}
          onSignOut={!hasPin ? () => void signOut() : undefined}
        />
      </View>
    );
  }

  if (needsPinSetup) {
    return (
      <View style={styles.container}>
        <PinPadModal
          visible={true}
          mode="set"
          onClose={() => {}}
          onSuccess={() => {
            setPinSetupDone(true);
            unlockWithPin();
          }}
        />
      </View>
    );
  }

  if (!checked && hasLock) {
    return <AppLoadingScreen />;
  }

  return <>{children}</>;
}
