import { useState, useCallback } from 'react';
import { apiPatch, getApiErrorMessage } from '@/shared/services/api';
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const clearSubmitError = useCallback(() => setSubmitError(null), []);

  const save = async (data: ProfileForm) => {
    setLoading(true);
    setSubmitError(null);
    try {
      const updated = await apiPatch<User>('/users/me', data);
      if (updated) dispatch(setUser(updated));
      return true;
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not update profile'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { save, loading, submitError, clearSubmitError };
}
