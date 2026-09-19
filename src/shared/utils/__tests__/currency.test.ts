import { describe, it, expect } from '@jest/globals';
import { formatCurrency, getCurrencySymbol } from '../currency';

describe('currency utils', () => {
  it('formats INR currency without decimals', () => {
    const formatted = formatCurrency(5000, 'INR');
    expect(formatted).toContain('5,000');
    expect(formatted).toMatch(/₹|INR/);
  });

  it('formats USD currency with 2 decimal places', () => {
    const formatted = formatCurrency(1234.56, 'USD');
    expect(formatted).toContain('1,234.56');
    expect(formatted).toContain('$');
  });

  it('formats EUR currency correctly', () => {
    const formatted = formatCurrency(99.9, 'EUR');
    expect(formatted).toContain('99.90');
    expect(formatted).toContain('€');
  });

  it('resolves correct currency symbols', () => {
    expect(getCurrencySymbol('SGD')).toBe('S$');
    expect(getCurrencySymbol('USD')).toBe('$');
    expect(getCurrencySymbol('EUR')).toBe('€');
  });

  it('handles negative amounts cleanly', () => {
    const formatted = formatCurrency(-50, 'USD');
    expect(formatted).toContain('50.00');
    expect(formatted).toMatch(/-/);
  });
});
