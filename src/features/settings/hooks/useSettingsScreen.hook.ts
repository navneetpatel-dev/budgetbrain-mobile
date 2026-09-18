import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import { setAppLockPin } from '@/shared/store/settingsSlice';
import { getStoredAppLockPin } from '@/shared/services/secureStorage';
import { useBiometricToggle } from './useBiometricToggle';
import { useDigestPreference } from './useDigestPreference';
import { useDeleteAccount } from './useDeleteAccount';
import { useEditProfile, type ProfileForm } from './useEditProfile';
import { useLogout } from './useLogout';
import { usePushTest } from './usePushTest';
import { useSyncedPreferences } from './useSyncedPreferences';

export function useSettingsScreen() {
  const user = useAppSelector((s) => s.auth.user);
  const { theme: themeMode, accent, setThemeMode, setAccentPalette } = useSyncedPreferences();
  const [editingProfile, setEditingProfile] = useState(false);

  const logout = useLogout();
  const deleteAccount = useDeleteAccount();
  const { save: saveProfile, loading: profileLoading, submitError: profileError, clearSubmitError } = useEditProfile();
  const { type: biometricType, supported: biometricSupported, enabled: biometricEnabled, toggle: toggleBiometric } = useBiometricToggle();
  const { enabled: digestEnabled, toggle: toggleDigest } = useDigestPreference();
  const testPush = usePushTest();

  const form = useForm<ProfileForm>({
    defaultValues: { name: user?.name ?? '', country: user?.country ?? '', currency: user?.currency ?? 'INR' },
  });
  const { reset } = form;

  useEffect(() => {
    reset({ name: user?.name ?? '', country: user?.country ?? '', currency: user?.currency ?? 'INR' });
  }, [user, reset]);

  const toggleEditingProfile = () => {
    if (editingProfile) clearSubmitError();
    setEditingProfile((prev) => !prev);
  };

  const cancelEditingProfile = () => setEditingProfile(false);

  const onSaveProfile = async (data: ProfileForm) => {
    const ok = await saveProfile(data);
    if (ok) setEditingProfile(false);
  };

  const dispatch = useAppDispatch();
  const appLockPin = useAppSelector((s) => s.settings.appLockPin);

  useEffect(() => {
    getStoredAppLockPin().then((pin) => {
      if (pin && !appLockPin) {
        dispatch(setAppLockPin('configured'));
      }
    });
  }, [dispatch, appLockPin]);

  return {
    user,
    themeMode,
    accent,
    setThemeMode,
    setAccentPalette,
    editingProfile,
    toggleEditingProfile,
    cancelEditingProfile,
    logout,
    deleteAccount,
    profileLoading,
    profileError,
    biometricType,
    biometricSupported,
    biometricEnabled,
    toggleBiometric,
    appLockPin,
    digestEnabled,
    toggleDigest,
    testPush,
    form,
    onSaveProfile,
  };
}
