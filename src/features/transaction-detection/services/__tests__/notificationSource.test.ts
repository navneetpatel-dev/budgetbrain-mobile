import { beforeEach, describe, expect, it } from '@jest/globals';
import { createSqlJsDriver } from '@/shared/testing/sqlJsDriver';
import { toNormalizedMessage, type NativeSmsCandidate } from '@/shared/services/sms/smsDetector.service';
import { __useDetectionDriverForTests, countersForDay, listLocalPending } from '../store/detectionStore.service';
import { __resetActivePackForTests, nativeNotificationFilter } from '../detectionPack.service';
import { processMessages } from '../transactionPipeline.service';
import type { DetectionContext } from '../../types/transactionDetection.types';

const BODY = 'Paid Rs 180 to SWIGGY from Paytm Wallet. Txn ID 20260923112233. Updated balance Rs 820';
const AT = Date.parse('2026-09-23T06:00:00.000Z');

function candidate(overrides: Partial<NativeSmsCandidate>): NativeSmsCandidate {
  return { queueId: '7', messageId: null, sender: 'BZ-PAYTMB', body: BODY, receivedAt: AT, simSlot: null, ...overrides };
}

const context: DetectionContext = {
  userId: 'u1',
  isAutoTrackingEnabled: true,
  selectedSimSlot: 'all',
  excludedMerchants: [],
  excludedAccountTails: [],
  learnedRules: {},
  notificationPreference: 'all',
};

beforeEach(async () => {
  __resetActivePackForTests();
  await __useDetectionDriverForTests(await createSqlJsDriver());
});

describe('bank-app notifications (T8.1)', () => {
  it('maps a queued notification to a notification message keyed by its app package', () => {
    expect(toNormalizedMessage(candidate({ sender: 'net.one97.paytm', source: 'notification' }))).toEqual({
      id: 'queue:7',
      sender: 'net.one97.paytm',
      body: BODY,
      receivedAt: '2026-09-23T06:00:00.000Z',
      source: 'notification',
      appPackage: 'net.one97.paytm',
    });
    // Candidates from before T8.1 carry no source: they are SMS.
    expect(toNormalizedMessage(candidate({ simSlot: 2 }))).toMatchObject({ source: 'android_sms', simSlot: 2 });
    expect(toNormalizedMessage(candidate({ source: 'android_sms' }))).not.toHaveProperty('appPackage');
  });

  it('hands the native listener the app packages the pack lists for notifications', () => {
    expect(nativeNotificationFilter().packages).toContain('net.one97.paytm');
    expect(nativeNotificationFilter().packages.every((p) => p === p.toLowerCase())).toBe(true);
  });

  it('detects a payment from a notification, and stores one record when the SMS says the same', async () => {
    const viaNotification = toNormalizedMessage(candidate({ sender: 'net.one97.paytm', source: 'notification' }));
    const viaSms = toNormalizedMessage(candidate({ queueId: '8' }));

    const first = await processMessages([viaNotification], context);
    expect(first).toHaveLength(1);
    expect(first[0]).toMatchObject({ source: 'notification', institutionId: 'in.paytm_payments_bank', amount: '180.00' });

    expect(await processMessages([viaSms], context)).toHaveLength(0);
    expect(await listLocalPending('u1')).toHaveLength(1);
    const today = new Date().toISOString().slice(0, 10);
    expect(await countersForDay(today)).toContainEqual(
      expect.objectContaining({ state: 'DUPLICATE', reason: 'duplicate_fingerprint', count: 1 })
    );
  });

  it('ignores notifications from apps the pack doesn\'t list', async () => {
    const other = toNormalizedMessage(candidate({ sender: 'com.whatsapp', source: 'notification' }));
    expect(await processMessages([other], context)).toHaveLength(0);
  });
});
