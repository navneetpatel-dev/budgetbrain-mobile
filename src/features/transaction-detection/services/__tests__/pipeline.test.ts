import { beforeEach, describe, expect, it } from '@jest/globals';
import { computeFingerprint } from '@budgetbrain/detection-core';
import { createSqlJsDriver } from '@/shared/testing/sqlJsDriver';
import { __useDetectionDriverForTests, countersForDay, pendingCount } from '../store/detectionStore.service';
import { evaluateMessage, processMessages } from '../transactionPipeline.service';
import type { DetectionContext, RawIncomingMessage } from '../../types/transactionDetection.types';

const RECEIVED = '2026-09-23T04:30:00.000Z';
const DEBIT = 'Rs.1,250.00 debited from a/c **1234 on 23-09-26 to VPA swiggy@icici Ref 425612345678. Avl Bal Rs 20,500.00';

function sms(body: string, sender = 'VM-HDFCBK', extra: Partial<RawIncomingMessage> = {}): RawIncomingMessage {
  return { sender, body, receivedAt: RECEIVED, source: 'android_sms', ...extra };
}

function context(overrides: Partial<DetectionContext> = {}): DetectionContext {
  return {
    userId: 'user-1',
    isAutoTrackingEnabled: true,
    selectedSimSlot: 'all',
    excludedMerchants: [],
    excludedAccountTails: [],
    learnedRules: {},
    notificationPreference: 'all',
    ...overrides,
  };
}

function payloadOf(message: RawIncomingMessage, ctx = context()) {
  const result = evaluateMessage(message, ctx);
  if (!result.ok) throw new Error(`expected a payload, got ${result.outcome.reason}`);
  return result.payload;
}

function reasonOf(message: RawIncomingMessage, ctx = context()) {
  const result = evaluateMessage(message, ctx);
  return result.ok ? null : result.outcome;
}

beforeEach(async () => {
  await __useDetectionDriverForTests(await createSqlJsDriver());
});

describe('evaluateMessage', () => {
  it('builds a server payload with a decimal-string amount and a core fingerprint', () => {
    const payload = payloadOf(sms(DEBIT));
    expect(payload).toMatchObject({
      amount: '1250.00',
      currency: 'INR',
      direction: 'DEBIT',
      transactionType: 'expense',
      institutionId: 'in.hdfc_bank',
      accountTail: '1234',
      receivedAt: RECEIVED,
      source: 'android_sms',
    });
    expect(payload.dedupFingerprint).toBe(
      computeFingerprint({
        userId: 'user-1',
        institutionId: 'in.hdfc_bank',
        accountTail: '1234',
        amountMinor: 125000,
        currency: 'INR',
        direction: 'DEBIT',
        referenceNumber: payload.referenceNumber,
        transactionDate: payload.transactionDate,
        receivedAt: RECEIVED,
      })
    );
  });

  it('reports honest evidence: the balance is not a second amount candidate', () => {
    expect(payloadOf(sms(DEBIT)).evidence).toMatchObject({
      institutionVerified: true,
      amountRoleUnique: true,
      directionUnambiguous: true,
    });
  });

  it('never sends raw message text', () => {
    expect(JSON.stringify(payloadOf(sms(DEBIT)))).not.toContain('Avl Bal');
  });

  it('marks unknown senders as unverified, so they can only reach review', () => {
    const result = evaluateMessage(sms(DEBIT, 'VM-ABCDEF'), context());
    if (result.ok) {
      expect(result.payload.evidence.institutionVerified).toBe(false);
      expect(result.payload.confidenceTier).not.toBe('high');
    }
  });

  it('drops messages with several amounts instead of guessing, with a reason code', () => {
    expect(reasonOf(sms('Rs 500 and Rs 300 debited from a/c XX1234 on 23-09-26'))).toMatchObject({
      state: 'PARSE_FAILED',
    });
  });

  it('gives every rejection a state and a reason code (T2.10)', () => {
    expect(reasonOf(sms('Your OTP is 123456. Do not share. Rs 10 debited'))).toMatchObject({
      state: 'INELIGIBLE',
      reason: 'otp_marker',
      institutionId: 'in.hdfc_bank',
    });
    expect(reasonOf(sms(DEBIT), context({ excludedAccountTails: ['1234'] }))).toMatchObject({
      reason: 'excluded_account',
    });
    expect(reasonOf(sms(DEBIT), context({ userId: null }))).toMatchObject({ reason: 'kill_switch' });
  });

  it("drops the other SIM's messages when one SIM is selected (T2.7)", () => {
    const ctx = context({ selectedSimSlot: '1' });
    expect(reasonOf(sms(DEBIT, 'VM-HDFCBK', { simSlot: 2 }), ctx)).toMatchObject({ reason: 'sim_filtered' });
    expect(evaluateMessage(sms(DEBIT, 'VM-HDFCBK', { simSlot: 1 }), ctx).ok).toBe(true);
  });
});

describe('processMessages', () => {
  it('stores a message once even when it is seen twice (live, then by a catch-up scan)', async () => {
    expect(await processMessages([sms(DEBIT)], context())).toHaveLength(1);
    expect(await processMessages([sms(DEBIT)], context())).toHaveLength(0);
    expect(await pendingCount('user-1')).toBe(1);
  });

  it('counts rejected messages without storing their text', async () => {
    await processMessages([sms('Your OTP is 123456. Do not share. Rs 10 debited')], context());
    const counters = await countersForDay(new Date().toISOString().slice(0, 10));
    expect(counters).toEqual([{ state: 'INELIGIBLE', reason: 'otp_marker', institutionId: 'in.hdfc_bank', count: 1 }]);
  });

  it('respects the server kill switch (T1.16)', async () => {
    const config = { enabled: false, autoCreateEnabled: false, minAppVersion: null, autoAddHighConfidence: true };
    expect(await processMessages([sms(DEBIT)], context(), { config })).toHaveLength(0);
    expect(await pendingCount('user-1')).toBe(0);
  });

  it('does nothing without a signed-in user or with tracking off', async () => {
    expect(await processMessages([sms(DEBIT)], context({ userId: null }))).toHaveLength(0);
    expect(await processMessages([sms(DEBIT)], context({ isAutoTrackingEnabled: false }))).toHaveLength(0);
  });
});
