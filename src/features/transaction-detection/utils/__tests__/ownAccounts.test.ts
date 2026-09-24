import { describe, expect, it } from '@jest/globals';
import { normalizeAccountTail, normalizeVpa } from '../ownAccounts';

describe('own accounts (T5.7)', () => {
  it('keeps the last 3–4 digits of an account or card number', () => {
    expect(normalizeAccountTail('XX1234')).toBe('1234');
    expect(normalizeAccountTail('5010 0012 3456 7890')).toBe('7890');
    expect(normalizeAccountTail('987')).toBe('987');
    expect(normalizeAccountTail('12')).toBeNull();
    expect(normalizeAccountTail('abcd')).toBeNull();
  });

  it('accepts UPI IDs, lower-cased', () => {
    expect(normalizeVpa('  Rahul.Sharma@OkHDFC ')).toBe('rahul.sharma@okhdfc');
    expect(normalizeVpa('9876543210@ybl')).toBe('9876543210@ybl');
    expect(normalizeVpa('rahul@')).toBeNull();
    expect(normalizeVpa('rahul@1bank')).toBeNull();
    expect(normalizeVpa('not a vpa')).toBeNull();
  });
});
