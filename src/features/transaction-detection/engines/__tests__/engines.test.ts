import { describe, it, expect } from '@jest/globals';
import { isMessageEligible } from '../eligibility.engine';
import { detectFinancialMovement } from '../detector.engine';
import { extractTransactionDetails } from '../extractor.engine';
import { classifyTransactionType } from '../classifier.engine';
import { resolveMerchant } from '../merchant.engine';
import { resolveCategory } from '../category.engine';
import { evaluateConfidence } from '../confidence.engine';
import { computeClientFingerprint, isFuzzyManualDuplicate } from '../duplicate.engine';

describe('Transaction Detection Engines', () => {
  describe('eligibility.engine', () => {
    it('rejects OTP and 2FA messages', () => {
      const otpMsg = 'Your OTP for login to HDFC netbanking is 482910. Do not share with anyone.';
      expect(isMessageEligible('VK-HDFCBK', otpMsg)).toBe(false);
    });

    it('rejects promotional offers', () => {
      const promoMsg = 'Congratulations! You are pre-approved for a personal loan of Rs 5,00,000. Apply now!';
      expect(isMessageEligible('AD-ICICIB', promoMsg)).toBe(false);
    });

    it('accepts legitimate bank transaction messages', () => {
      const txMsg = 'Rs. 450.00 debited from a/c **4012 on 23-Sep-2026 at Swiggy. Avail Bal: Rs 15,200.00.';
      expect(isMessageEligible('VK-HDFCBK', txMsg)).toBe(true);
    });
  });

  describe('detector & classifier engines', () => {
    it('detects debit expenses correctly', () => {
      const content = 'Paid Rs. 1,250 to Amazon India via UPI ref 89234710.';
      const signal = detectFinancialMovement(content);
      expect(signal.isTransaction).toBe(true);
      expect(signal.direction).toBe('DEBIT');

      const txType = classifyTransactionType(signal.direction!, signal, content);
      expect(txType).toBe('expense');
    });

    it('detects self-transfers and classifies as transfer', () => {
      const content = 'Rs. 10,000.00 transferred to own a/c ending 9012. Ref: TXN9988.';
      const signal = detectFinancialMovement(content);
      expect(signal.isSelfTransfer).toBe(true);

      const txType = classifyTransactionType('DEBIT', signal, content);
      expect(txType).toBe('transfer');
    });

    it('detects refunds and classifies as refund', () => {
      const content = 'Refund of Rs. 499.00 credited to your card ending 1234 from Amazon.';
      const signal = detectFinancialMovement(content);
      expect(signal.direction).toBe('CREDIT');
      expect(signal.isReversal).toBe(true);

      const txType = classifyTransactionType('CREDIT', signal, content);
      expect(txType).toBe('refund');
    });

    it('identifies declined transactions as non-transactions', () => {
      const content = 'Your txn of Rs 1,500 at Zomato was DECLINED due to insufficient balance.';
      const signal = detectFinancialMovement(content);
      expect(signal.isTransaction).toBe(false);
      expect(signal.isFailedOrDeclined).toBe(true);
    });
  });

  describe('extractor.engine', () => {
    it('isolates transaction amount without confusing with balance or account numbers', () => {
      const msg = 'Rs. 850.50 debited from a/c ending 4012 on 23-09-2026. Avail bal is Rs. 24,500.00. Ref: 98127398.';
      const details = extractTransactionDetails(msg);

      expect(details.amount).toBe(850.5);
      expect(details.accountTail).toBe('4012');
      expect(details.referenceNumber).toBe('98127398');
    });
  });

  describe('merchant.engine', () => {
    it('normalizes merchants and strips VPA suffixes', () => {
      const res1 = resolveMerchant('swiggy@icici');
      expect(res1.normalizedMerchant).toBe('Swiggy');
      expect(res1.categoryHint).toBe('Food & Dining');

      const res2 = resolveMerchant('AMZN Mktp');
      expect(res2.normalizedMerchant).toBe('Amazon');
      expect(res2.categoryHint).toBe('Shopping');
    });
  });

  describe('category.engine', () => {
    const categories = [
      { id: 'cat-1', name: 'Food & Dining' },
      { id: 'cat-2', name: 'Electronics' },
      { id: 'cat-3', name: 'Fuel' },
      { id: 'cat-4', name: 'Other' },
    ];

    it('prioritizes user learned rules over catalog hints', () => {
      const userRules = {
        amazon: { merchant: 'Amazon', categoryId: 'cat-2', categoryName: 'Electronics', updatedAt: '' },
      };

      const res = resolveCategory('Amazon', 'Shopping', 'Amazon purchase', userRules, categories);
      expect(res.source).toBe('user_rule');
      expect(res.categoryId).toBe('cat-2');
    });

    it('uses context keywords when merchant hint is unavailable', () => {
      const res = resolveCategory('Unknown Station', null, 'Paid Rs 2,000 for petrol', {}, categories);
      expect(res.source).toBe('context_keyword');
      expect(res.categoryName).toBe('Fuel');
      expect(res.categoryId).toBe('cat-3');
    });
  });

  describe('confidence & duplicate engines', () => {
    it('rates a complete bank transaction as high confidence', () => {
      const evalRes = evaluateConfidence('VK-HDFCBK', 450, 'DEBIT', 'Swiggy', 'UPI12345', '2026-09-23');
      expect(evalRes.tier).toBe('high');
      expect(evalRes.score).toBeGreaterThanOrEqual(0.8);
    });

    it('detects fuzzy duplicates within 24 hours of exact amount', () => {
      const existing = [{ amount: 450, date: '2026-09-23T12:00:00Z', type: 'expense' }];
      const isDup = isFuzzyManualDuplicate(450, '2026-09-23T15:30:00Z', 'expense', existing);
      expect(isDup).toBe(true);

      const notDup = isFuzzyManualDuplicate(500, '2026-09-23T15:30:00Z', 'expense', existing);
      expect(notDup).toBe(false);
    });

    it('computes deterministic SHA-256 fingerprint', () => {
      const fp1 = computeClientFingerprint('user-1', 500, 'INR', 'DEBIT', 'expense', 'Zomato', '1234', '2026-09-23');
      const fp2 = computeClientFingerprint('user-1', 500, 'INR', 'DEBIT', 'expense', 'Zomato', '1234', '2026-09-23');
      expect(fp1).toBe(fp2);
      expect(fp1).toHaveLength(64);
    });
  });
});
