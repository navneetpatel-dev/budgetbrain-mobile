import { describe, expect, it } from '@jest/globals';
import {
  MAX_OWN_ENTRIES,
  addOwnAccountTail,
  addOwnVpa,
  removeOwnAccountTail,
  replaceLearnedRules,
  setAutoAddHighConfidence,
  setLinkedAccountTails,
  transactionDetectionSlice,
} from '../transactionDetectionSlice';

const reducer = transactionDetectionSlice.reducer;
const initial = reducer(undefined, { type: 'init' });

describe('transaction detection slice (Phase 5)', () => {
  it('replaces learned rules with the server list, keyed by merchant', () => {
    const withOld = reducer(initial, replaceLearnedRules([{ merchant: 'swiggy', categoryId: 'c1', updatedAt: 'x' }]));
    const next = reducer(withOld, replaceLearnedRules([{ merchant: 'Zomato ', categoryId: 'c2', updatedAt: 'y' }]));
    expect(Object.keys(next.learnedRules)).toEqual(['zomato']);
  });

  it('adds own tails and UPI IDs once, normalized, up to the cap', () => {
    let state = reducer(initial, addOwnAccountTail('xx1234'));
    state = reducer(state, addOwnAccountTail('1234'));
    state = reducer(state, addOwnAccountTail('12'));
    state = reducer(state, addOwnVpa('Me@OkSBI'));
    state = reducer(state, addOwnVpa('nope'));
    expect(state.ownAccountTails).toEqual(['1234']);
    expect(state.ownVpas).toEqual(['me@oksbi']);
    for (let i = 0; i < 20; i += 1) state = reducer(state, addOwnAccountTail(String(1000 + i)));
    expect(state.ownAccountTails).toHaveLength(MAX_OWN_ENTRIES);
    expect(reducer(state, removeOwnAccountTail('1234')).ownAccountTails).not.toContain('1234');
  });

  it('stores linked tails without repeats and remembers the auto-add choice', () => {
    expect(reducer(initial, setLinkedAccountTails(['1234', '1234', '987'])).linkedAccountTails).toEqual(['1234', '987']);
    expect(initial.autoAddHighConfidence).toBe(true);
    expect(reducer(initial, setAutoAddHighConfidence(false)).autoAddHighConfidence).toBe(false);
  });
});
