import { useCallback, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { authenticateWithBiometrics } from '@/shared/services/biometrics';

export function useAppLock(
  biometricEnabled: boolean,
  hasPin: boolean,
  isAuthenticated: boolean
) {
  const isLockActive = (biometricEnabled || hasPin) && isAuthenticated;
  const [locked, setLocked] = useState(false);
  const [checked, setChecked] = useState(false);

  const unlockWithBiometrics = useCallback(async () => {
    if (!biometricEnabled) return;
    const success = await authenticateWithBiometrics();
    if (success) {
      setLocked(false);
      setChecked(true);
    }
  }, [biometricEnabled]);

  const unlockWithPin = useCallback(() => {
    setLocked(false);
    setChecked(true);
  }, []);

  useEffect(() => {
    if (isLockActive) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- must run after mount to gate the initial screen before the async biometrics prompt (a native API call, not computable during render) fires below.
      setLocked(true);
      if (biometricEnabled) {
        unlockWithBiometrics();
      } else {
        setChecked(true);
      }
    } else {
      setChecked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional initial-mount-only lock initialization
  }, []);

  useEffect(() => {
    if (!isLockActive) return;

    const handleAppState = (state: AppStateStatus) => {
      if (state === 'background' || state === 'inactive') {
        setLocked(true);
        setChecked(false);
      } else if (state === 'active' && locked) {
        if (biometricEnabled) {
          unlockWithBiometrics();
        } else {
          setChecked(true);
        }
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [isLockActive, biometricEnabled, locked, unlockWithBiometrics]);

  return { locked, checked, unlockWithBiometrics, unlockWithPin };
}
