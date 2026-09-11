import { useState } from 'react';
import { apiPatch } from '@/shared/services/api';
import { setUser } from '@/shared/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import type { User } from '@/shared/types';

export function useDigestPreference() {
  const dispatch = useAppDispatch();
  const enabled = useAppSelector((s) => s.auth.user?.weeklyDigestOptIn ?? true);
  const [saving, setSaving] = useState(false);

  const toggle = async (next: boolean) => {
    setSaving(true);
    try {
      const updated = await apiPatch<User>('/users/me', { weeklyDigestOptIn: next });
      if (updated) dispatch(setUser(updated));
    } catch {
      // Silently ignore — the row simply reflects the last confirmed server value.
    } finally {
      setSaving(false);
    }
  };

  return { enabled, saving, toggle };
}
