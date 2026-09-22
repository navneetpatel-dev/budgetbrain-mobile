import { apiPost } from '@/shared/services/api';
import type { AuthSession } from '@/features/auth/types/auth.types';
import type { FamilyInviteForm } from '../hooks/useFamilyInvite.hook';

/** Extracted as a plain function (rather than inlined in the hook) so it's directly
 *  unit-testable without rendering — this app's hook tests can't rely on
 *  renderHook/render in the current jest-expo/RTL setup, mirroring how
 *  features/auth/services/auth.service.ts keeps its API calls hook-free. */
export async function sendFamilyInvite(groupId: string, data: FamilyInviteForm): Promise<void> {
  await apiPost(`/family/groups/${groupId}/invites`, data);
}

export async function acceptFamilyInviteRequest(token: string): Promise<AuthSession> {
  return apiPost<AuthSession>('/family/invites/accept', { token });
}

const ACCEPT_ERROR_MESSAGES: Record<string, string> = {
  INVALID_INVITE: 'This invite link is invalid.',
  INVITE_ALREADY_USED: 'This invite has already been used.',
  INVITE_EXPIRED: 'This invite has expired. Ask for a new one.',
};

/** Maps the backend's distinct invite-failure error codes to a matching user-facing
 *  message, falling back to a generic one for anything unrecognized. */
export function resolveAcceptErrorMessage(code: string | undefined): string {
  return (code && ACCEPT_ERROR_MESSAGES[code]) ?? 'Could not accept this invite.';
}
