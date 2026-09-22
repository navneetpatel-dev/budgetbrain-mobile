import { useState } from 'react';
import { getApiErrorMessage } from '@/shared/services/api';
import { sendFamilyInvite } from '../api/familyInvite.api';

export type FamilyInviteRole = 'admin' | 'contributor' | 'read_only';

export interface FamilyInviteForm {
  invitedEmail: string;
  role: FamilyInviteRole;
}

/** Sends an email invite for a family group. Distinct from useFamilyGroups' create/join
 *  flows since it targets a specific groupId rather than the user's own membership list. */
export function useFamilyInvite(groupId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const sendInvite = async (data: FamilyInviteForm): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await sendFamilyInvite(groupId, data);
      setSuccess(`Invite sent to ${data.invitedEmail}.`);
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not send invite'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(null);
  };

  return { sendInvite, loading, error, success, reset };
}
