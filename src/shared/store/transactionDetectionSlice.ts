import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { normalizeAccountTail, normalizeVpa } from '@/features/transaction-detection/utils/ownAccounts';
import type { LearnedMerchantRule } from '@/features/transaction-detection/types/transactionDetection.types';

export interface TransactionDetectionState {
  isAutoTrackingEnabled: boolean;
  consentGrantedAt: string | null;
  notificationPreference: 'all' | 'needs_review' | 'off';
  selectedSimSlot: 'all' | '1' | '2';
  excludedMerchants: string[];
  excludedAccountTails: string[];
  learnedRules: Record<string, LearnedMerchantRule>;
  pendingReviewCount: number;
  lastSyncedAt: string | null;
  syncStatus: 'idle' | 'syncing' | 'error';
  /** Last known server value, so the setting shows correctly offline (plan T5.7). */
  autoAddHighConfidence: boolean;
  /** "My accounts" (plan T5.7): tails and UPI ids the user added, used for transfer detection. */
  ownAccountTails: string[];
  ownVpas: string[];
  /** Tails of the user's financial accounts, refreshed from the server. */
  linkedAccountTails: string[];
  /**
   * Bank-app notification capture (plan T8.1): the user's choice. It works only while
   * auto-tracking is on and the user has granted notification access in system Settings.
   */
  appNotificationCaptureEnabled: boolean;
}

const initialState: TransactionDetectionState = {
  isAutoTrackingEnabled: false,
  consentGrantedAt: null,
  notificationPreference: 'all',
  selectedSimSlot: 'all',
  excludedMerchants: [],
  excludedAccountTails: [],
  learnedRules: {},
  pendingReviewCount: 0,
  lastSyncedAt: null,
  syncStatus: 'idle',
  autoAddHighConfidence: true,
  ownAccountTails: [],
  ownVpas: [],
  linkedAccountTails: [],
  appNotificationCaptureEnabled: false,
};

/** A person has a handful of own accounts and UPI IDs; the settings chip rows stay short. */
export const MAX_OWN_ENTRIES = 8;

export const transactionDetectionSlice = createSlice({
  name: 'transactionDetection',
  initialState,
  reducers: {
    setAutoTrackingEnabled(state, action: PayloadAction<boolean>) {
      state.isAutoTrackingEnabled = action.payload;
      if (action.payload && !state.consentGrantedAt) {
        state.consentGrantedAt = new Date().toISOString();
      }
    },
    setAppNotificationCapture(state, action: PayloadAction<boolean>) {
      state.appNotificationCaptureEnabled = action.payload;
    },
    setNotificationPreference(
      state,
      action: PayloadAction<'all' | 'needs_review' | 'off'>
    ) {
      state.notificationPreference = action.payload;
    },
    setSelectedSimSlot(state, action: PayloadAction<'all' | '1' | '2'>) {
      state.selectedSimSlot = action.payload;
    },
    addExcludedMerchant(state, action: PayloadAction<string>) {
      const trimmed = action.payload.trim().toLowerCase();
      if (trimmed && !state.excludedMerchants.includes(trimmed)) {
        state.excludedMerchants.push(trimmed);
      }
    },
    removeExcludedMerchant(state, action: PayloadAction<string>) {
      const trimmed = action.payload.trim().toLowerCase();
      state.excludedMerchants = state.excludedMerchants.filter((m) => m !== trimmed);
    },
    addExcludedAccountTail(state, action: PayloadAction<string>) {
      const tail = action.payload.trim();
      if (tail && !state.excludedAccountTails.includes(tail)) {
        state.excludedAccountTails.push(tail);
      }
    },
    removeExcludedAccountTail(state, action: PayloadAction<string>) {
      state.excludedAccountTails = state.excludedAccountTails.filter((t) => t !== action.payload.trim());
    },
    setLearnedRule(state, action: PayloadAction<LearnedMerchantRule>) {
      const key = action.payload.merchant.trim().toLowerCase();
      state.learnedRules[key] = action.payload;
    },
    resetLearnedRules(state) {
      state.learnedRules = {};
    },
    /** Replaces every rule with the server's list (plan T5.3); the server is the source of truth. */
    replaceLearnedRules(state, action: PayloadAction<LearnedMerchantRule[]>) {
      const next: Record<string, LearnedMerchantRule> = {};
      for (const rule of action.payload) next[rule.merchant.trim().toLowerCase()] = rule;
      state.learnedRules = next;
    },
    setAutoAddHighConfidence(state, action: PayloadAction<boolean>) {
      state.autoAddHighConfidence = action.payload;
    },
    addOwnAccountTail(state, action: PayloadAction<string>) {
      const tail = normalizeAccountTail(action.payload);
      if (tail && !state.ownAccountTails.includes(tail) && state.ownAccountTails.length < MAX_OWN_ENTRIES) {
        state.ownAccountTails.push(tail);
      }
    },
    removeOwnAccountTail(state, action: PayloadAction<string>) {
      state.ownAccountTails = state.ownAccountTails.filter((t) => t !== action.payload);
    },
    addOwnVpa(state, action: PayloadAction<string>) {
      const vpa = normalizeVpa(action.payload);
      if (vpa && !state.ownVpas.includes(vpa) && state.ownVpas.length < MAX_OWN_ENTRIES) {
        state.ownVpas.push(vpa);
      }
    },
    removeOwnVpa(state, action: PayloadAction<string>) {
      state.ownVpas = state.ownVpas.filter((v) => v !== action.payload);
    },
    setLinkedAccountTails(state, action: PayloadAction<string[]>) {
      state.linkedAccountTails = [...new Set(action.payload)];
    },
    setPendingReviewCount(state, action: PayloadAction<number>) {
      state.pendingReviewCount = Math.max(0, action.payload);
    },
    incrementPendingReviewCount(state) {
      state.pendingReviewCount += 1;
    },
    decrementPendingReviewCount(state) {
      state.pendingReviewCount = Math.max(0, state.pendingReviewCount - 1);
    },
    setSyncStatus(
      state,
      action: PayloadAction<{ status: 'idle' | 'syncing' | 'error'; timestamp?: string }>
    ) {
      state.syncStatus = action.payload.status;
      if (action.payload.timestamp) {
        state.lastSyncedAt = action.payload.timestamp;
      }
    },
    /**
     * Drops the Phase 1 fingerprint ring buffer from persisted state once it has been imported
     * into the detection store (plan T2.8). Fingerprints no longer live in Redux.
     */
    clearLegacyFingerprints(state) {
      delete (state as { recentFingerprints?: string[] }).recentFingerprints;
    },
  },
});

export const {
  setAutoTrackingEnabled,
  setAppNotificationCapture,
  setNotificationPreference,
  setSelectedSimSlot,
  addExcludedMerchant,
  removeExcludedMerchant,
  addExcludedAccountTail,
  removeExcludedAccountTail,
  setLearnedRule,
  resetLearnedRules,
  setPendingReviewCount,
  incrementPendingReviewCount,
  decrementPendingReviewCount,
  setSyncStatus,
  clearLegacyFingerprints,
  replaceLearnedRules,
  setAutoAddHighConfidence,
  addOwnAccountTail,
  removeOwnAccountTail,
  addOwnVpa,
  removeOwnVpa,
  setLinkedAccountTails,
} = transactionDetectionSlice.actions;

export default transactionDetectionSlice.reducer;
