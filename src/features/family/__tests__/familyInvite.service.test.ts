import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockApiPost = jest.fn<(...args: unknown[]) => Promise<unknown>>();
jest.mock('@/shared/services/api', () => ({
  apiPost: (...args: unknown[]) => mockApiPost(...args),
}));

import {
  sendFamilyInvite,
  acceptFamilyInviteRequest,
  resolveAcceptErrorMessage,
} from '../services/familyInvite.service';

describe('familyInvite.service', () => {
  beforeEach(() => {
    mockApiPost.mockReset();
  });

  describe('sendFamilyInvite', () => {
    it('posts to the group invites endpoint with the exact payload', async () => {
      mockApiPost.mockResolvedValueOnce({ id: 'inv-1' });
      await sendFamilyInvite('group-1', { invitedEmail: 'a@b.com', role: 'contributor' });
      expect(mockApiPost).toHaveBeenCalledWith('/family/groups/group-1/invites', {
        invitedEmail: 'a@b.com',
        role: 'contributor',
      });
    });

    it('propagates a rejection rather than swallowing it', async () => {
      mockApiPost.mockRejectedValueOnce(new Error('server error'));
      await expect(
        sendFamilyInvite('group-1', { invitedEmail: 'a@b.com', role: 'admin' })
      ).rejects.toThrow('server error');
    });
  });

  describe('acceptFamilyInviteRequest', () => {
    it('posts the token to the public accept endpoint and returns the session', async () => {
      const session = { accessToken: 'a', refreshToken: 'r', user: { id: 'u1' } };
      mockApiPost.mockResolvedValueOnce(session);
      const result = await acceptFamilyInviteRequest('tok-123');
      expect(mockApiPost).toHaveBeenCalledWith('/family/invites/accept', { token: 'tok-123' });
      expect(result).toBe(session);
    });
  });

  describe('resolveAcceptErrorMessage', () => {
    it.each([
      ['INVALID_INVITE', /invalid/i],
      ['INVITE_ALREADY_USED', /already been used/i],
      ['INVITE_EXPIRED', /expired/i],
    ])('maps %s to a matching message', (code, expected) => {
      expect(resolveAcceptErrorMessage(code)).toMatch(expected as RegExp);
    });

    it('falls back to a generic message for an unrecognized or missing code', () => {
      expect(resolveAcceptErrorMessage(undefined)).toBe('Could not accept this invite.');
      expect(resolveAcceptErrorMessage('SOMETHING_ELSE')).toBe('Could not accept this invite.');
    });
  });
});
