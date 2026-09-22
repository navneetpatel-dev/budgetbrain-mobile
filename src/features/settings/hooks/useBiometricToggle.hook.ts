import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { getBiometricType, isBiometricAvailable } from '@/shared/services/biometrics';
import { setBiometricEnabled } from '@/shared/store/settingsSlice';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';

export function useBiometricToggle() {
  const dispatch = useAppDispatch();
  // Narrow selectors, not `s.settings` wholesale — see useSyncedPreferences.hook.ts for why.
  const appLockPin = useAppSelector((s) => s.settings.appLockPin);
  const biometricEnabled = useAppSelector((s) => s.settings.biometricEnabled);
  const [type, setType] = useState('Biometric');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    isBiometricAvailable().then(setSupported);
    getBiometricType().then(setType);
  }, []);

  const toggle = async (enable: boolean) => {
    if (enable && !(await isBiometricAvailable())) {
      Alert.alert('Unavailable', `${type} is not set up.`);
      return;
    }
    if (enable && !appLockPin) {
      Alert.alert(
        'Set a PIN first',
        'Biometrics need a PIN fallback so you can still unlock if Face ID or fingerprint fails.'
      );
      return;
    }
    dispatch(setBiometricEnabled(enable));
  };

  return { type, supported, enabled: biometricEnabled, toggle };
}
