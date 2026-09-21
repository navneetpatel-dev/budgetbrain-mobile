import { describe, it, expect, jest } from '@jest/globals';
import { resolveDateRange } from '../transactionFilters';
import { toIsoDate } from '@/shared/utils/dateBounds';

describe('transactionFilters local-date presets', () => {
  it('this_month uses the local calendar day, not UTC (local midnight on the 1st)', () => {
    jest.useFakeTimers({ now: new Date(2026, 9, 1, 0, 30, 0) });
    try {
      const range = resolveDateRange({ type: 'all', datePreset: 'this_month' });
      expect(range.startDate).toBe('2026-10-01');
      expect(range.endDate).toBe(toIsoDate(new Date(2026, 9, 1, 0, 30, 0)));

      const localMidnight = new Date(2026, 9, 1, 0, 0, 0);
      expect(toIsoDate(localMidnight)).toBe('2026-10-01');
      if (localMidnight.getTimezoneOffset() < 0) {
        expect(localMidnight.toISOString().slice(0, 10)).not.toBe('2026-10-01');
      }
    } finally {
      jest.useRealTimers();
    }
  });
});
