import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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
  recentFingerprints: string[];
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
  recentFingerprints: [],
};

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
    recordFingerprint(state, action: PayloadAction<string>) {
      if (!state.recentFingerprints.includes(action.payload)) {
        state.recentFingerprints.push(action.payload);
        // Keep ring buffer at max 500 items
        if (state.recentFingerprints.length > 500) {
          state.recentFingerprints.shift();
        }
      }
    },
  },
});

export const {
  setAutoTrackingEnabled,
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
  recordFingerprint,
} = transactionDetectionSlice.actions;

export default transactionDetectionSlice.reducer;
