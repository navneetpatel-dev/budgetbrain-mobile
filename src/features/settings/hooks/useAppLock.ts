import { useCallback, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { authenticateWithBiometrics } from '@/shared/services/biometrics';

export function useAppLock(biometricEnabled: boolean, isAuthenticated: boolean) {
  const [locked, setLocked] = useState(false);
  const [checked, setChecked] = useState(false);

  const unlock = useCallback(async () => {
    const success = await authenticateWithBiometrics();
    if (success) {
      setLocked(false);
      setChecked(true);
    }
  }, []);

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
  }, [biometricEnabled, isAuthenticated, locked, unlock]);

  return { locked, checked };
}
