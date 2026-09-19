import { describe, it, expect } from '@jest/globals';
import { toIsoDate, parseIsoDate, DateBounds } from '../dateBounds';

describe('dateBounds utils', () => {
  it('converts date to ISO date YYYY-MM-DD format', () => {
    const d = new Date(2026, 0, 15);
    expect(toIsoDate(d)).toBe('2026-01-15');
  });

  it('parses ISO date string to Date object correctly', () => {
    const parsed = parseIsoDate('2026-06-20');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(5); // 0-indexed
    expect(parsed.getDate()).toBe(20);
  });

  it('calculates rangeFrom and rangeTo date bounds properly', () => {
    const fromBounds = DateBounds.rangeFrom('2026-05-15', '2026-04-01');
    expect(fromBounds.max).toBe('2026-05-15');

    const toBounds = DateBounds.rangeTo('2026-04-01', '2026-05-15');
    expect(toBounds.min).toBe('2026-04-01');
  });
});
