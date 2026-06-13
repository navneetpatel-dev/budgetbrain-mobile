import { useState } from 'react';
import { Alert } from 'react-native';
import { apiPatch } from '@/shared/services/api';
import { setUser } from '@/shared/store/authSlice';
import { useAppDispatch } from '@/shared/store/hooks';
import type { User } from '@/shared/types';

export interface ProfileForm {
  name: string;
  country: string;
  currency: string;
}

export function useEditProfile() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const save = async (data: ProfileForm) => {
    setLoading(true);
    try {
      const updated = await apiPatch<User>('/users/me', data);
      if (updated) dispatch(setUser(updated));
      return true;
    } catch {
      Alert.alert('Error', 'Could not update profile');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { save, loading };
}
