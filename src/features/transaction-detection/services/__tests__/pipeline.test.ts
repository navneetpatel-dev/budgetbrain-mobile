import { beforeEach, describe, expect, it } from '@jest/globals';
import { computeFingerprint } from '@budgetbrain/detection-core';
import { createSqlJsDriver } from '@/shared/testing/sqlJsDriver';
import { __useDetectionDriverForTests, countersForDay, pendingCount, queuedSkeletons } from '../store/detectionStore.service';
import { evaluateMessage, processMessages } from '../transactionPipeline.service';
import { nativeSenderFilter } from '../detectionPack.service';
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

  it('sends only the extracted fields: no message fragments, no sender, a cleaned merchant (T5.9)', () => {
    const ALLOWED_KEYS = [
      'accountTail', 'amount', 'categoryId', 'categorySource', 'clientId', 'confidenceTier', 'currency',
      'dedupFingerprint', 'direction', 'evidence', 'financialAccountId', 'institutionId', 'merchantId',
      'merchantName', 'paymentMethod', 'receivedAt', 'referenceNumber', 'source', 'subtype', 'taxonomyCode',
      'transactionDate', 'transactionType',
    ];
    const messages = [
      sms(DEBIT),
      sms('Rs 4,999.00 spent on HDFC Bank Card xx1111 at CROMA RETAIL on 2026-09-20. Ref 123456789012. Not you? Call 18002586161 to block', 'AD-HDFCBK'),
      sms('INR 15,000.00 credited to A/c XX9876 on 22-09-26 by NEFT from RAHUL SHARMA. Ref N265123456789. Avl Bal INR 35,500.00', 'JM-HDFCBK'),
    ];
    for (const message of messages) {
      const payload = payloadOf(message);
      expect(Object.keys(payload).sort()).toEqual(ALLOWED_KEYS);
      // The sender ID is replaced by the institution the knowledge pack resolved.
      expect(payload.institutionId).toBe('in.hdfc_bank');
      const sent = Object.entries(payload)
        .filter(([key]) => !['referenceNumber', 'merchantName', 'transactionDate'].includes(key))
        .map(([, value]) => JSON.stringify(value))
        .join('\n');
      expect(sent).not.toContain(message.sender);
      expect(sent).not.toContain(message.sender.slice(3));
      // No run of 10 characters from the message survives outside the extracted fields, and those
      // are a normalized reference, an ISO date and a cleaned merchant, never a longer piece of text.
      const body = message.body.toLowerCase();
      for (let i = 0; i + 10 <= body.length; i += 1) {
        expect(sent.toLowerCase()).not.toContain(body.slice(i, i + 10));
      }
      if (payload.referenceNumber) expect(payload.referenceNumber).toMatch(/^[A-Z0-9]{6,22}$/i);
      if (payload.transactionDate) expect(payload.transactionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (payload.merchantName) {
        expect(payload.merchantName).not.toMatch(/\d{4,}|\bon\b|ref/i);
        expect(payload.merchantName.length).toBeLessThanOrEqual(40);
      }
    }
  });

  it('ignores senders that are not in the knowledge pack (gap E2, E5)', () => {
    expect(reasonOf(sms(DEBIT, 'VM-ABCDEF'))).toMatchObject({ state: 'INELIGIBLE', reason: 'unknown_sender' });
  });

  it('sends several amounts to review at low confidence instead of guessing', () => {
    const payload = payloadOf(sms('Rs 500 and Rs 300 debited from a/c XX1234 on 23-09-26'));
    expect(payload.confidenceTier).toBe('low');
    expect(payload.evidence.amountRoleUnique).toBe(false);
  });

  it('maps the knowledge-base taxonomy to the user category of the same name', () => {
    const payload = payloadOf(sms(DEBIT), context());
    expect(payload).toMatchObject({ merchantId: 'm.swiggy', taxonomyCode: 'FOOD_AND_DRINK.RESTAURANT', categoryId: null });
    const result = evaluateMessage(sms(DEBIT), context(), [{ id: 'cat-food', name: 'Food' }]);
    expect(result.ok && result.payload.categoryId).toBe('cat-food');
  });

  it('applies learned merchant rules by the normalized merchant key', () => {
    const learned = { swiggy: { merchant: 'Swiggy', categoryId: 'cat-takeaway', updatedAt: '2026-09-01T00:00:00Z' } };
    expect(payloadOf(sms(DEBIT), context({ learnedRules: learned }))).toMatchObject({ categoryId: 'cat-takeaway', categorySource: 'rule' });
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

  describe('template learning (T7.4)', () => {
    const base = { enabled: true, autoCreateEnabled: true, minAppVersion: null, autoAddHighConfidence: true };

    it('queues the masked shape of a message no template read, once, only when opted in', async () => {
      const message = sms(DEBIT);
      expect(evaluateMessage(message, context())).toMatchObject({ learnShape: true });

      await processMessages([message], context(), { config: base });
      expect(await queuedSkeletons(10)).toEqual([]);

      await processMessages([message, sms(DEBIT.replace('1,250.00', '99.00'))], context(), {
        config: { ...base, templateLearning: true },
      });
      const queued = await queuedSkeletons(10);
      expect(queued).toHaveLength(1);
      expect(queued[0]).toMatchObject({ institutionId: 'in.hdfc_bank', country: 'IN' });
      expect(queued[0].skeleton).not.toMatch(/\d/);
      expect(queued[0].skeleton).not.toMatch(/swiggy/i);
    });

    it('never learns from ineligible messages or unknown senders', async () => {
      expect(evaluateMessage(sms('Your OTP is 123456. Do not share. Rs 10 debited'), context())).toMatchObject({
        learnShape: false,
      });
      expect(evaluateMessage(sms(DEBIT, 'VM-RANDOM'), context())).toMatchObject({ learnShape: false });
    });
  });
});

describe('native sender filter (T2.2, T3.2)', () => {
  it('hands the native side the pack headers plus the bank names and IFSC prefixes for unknown headers', () => {
    const filter = nativeSenderFilter();
    expect(filter.headers).toContain('HDFCBK');
    expect(filter.bodyNames).toContain('HDFC BANK');
    expect(filter.bodyNames.every((name) => name.includes(' ') && name === name.toUpperCase())).toBe(true);
    expect(filter.ifscPrefixes).toEqual(expect.arrayContaining(['HDFC', 'ICIC', 'SBIN']));
  });
});
