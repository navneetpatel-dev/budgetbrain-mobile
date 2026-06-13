import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { getBiometricType, isBiometricAvailable } from '@/shared/services/biometrics';
import { setBiometricEnabled } from '@/shared/store/settingsSlice';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';

export function useBiometricToggle() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((s) => s.settings);
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
    dispatch(setBiometricEnabled(enable));
  };

  return { type, supported, enabled: settings.biometricEnabled, toggle };
}
