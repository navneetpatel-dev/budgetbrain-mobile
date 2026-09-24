import { describe, expect, it } from '@jest/globals';
import { contextFromState } from '../detectionContext.service';

describe('contextFromState (T5.7)', () => {
  it('treats manual and linked account tails as own accounts, once each', () => {
    const context = contextFromState({
      auth: { user: { id: 'u1' } },
      transactionDetection: {
        isAutoTrackingEnabled: true,
        selectedSimSlot: 'all',
        excludedMerchants: [],
        excludedAccountTails: [],
        learnedRules: {},
        notificationPreference: 'all',
        ownAccountTails: ['1234', '5678'],
        linkedAccountTails: ['5678', '987'],
        ownVpas: ['me@oksbi'],
      },
    });
    expect(context).toMatchObject({ userId: 'u1', ownAccountTails: ['1234', '5678', '987'], ownVpas: ['me@oksbi'] });
  });
});
