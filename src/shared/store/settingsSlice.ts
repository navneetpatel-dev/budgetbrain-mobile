import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import type { AccentPalette, ThemeMode } from '../theme/types';
import { DEFAULT_ACCENT, resolveAccent, resolveThemeMode } from '../theme/palettes';

export interface SettingsState {
  theme: ThemeMode;
  accent: AccentPalette;
  currency: string;
  biometricEnabled: boolean;
  appLockPin: string | null;
  offlineQueue: Array<{
    id: string;
    action: string;
    resource?: 'transaction' | 'income' | 'budget' | 'goal';
    payload: unknown;
    timestamp: string;
    retryCount?: number;
    lastError?: string;
  }>;
  syncConflicts: Array<{
    id: string;
    action: string;
    resource?: string;
    payload: unknown;
    timestamp: string;
    error: string;
  }>;
}

const initialState: SettingsState = {
  theme: 'system',
  accent: DEFAULT_ACCENT,
  currency: 'INR',
  biometricEnabled: false,
  appLockPin: null,
  offlineQueue: [],
  syncConflicts: [],
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload;
    },
    setAccent(state, action: PayloadAction<AccentPalette>) {
      state.accent = action.payload;
    },
    setCurrency(state, action: PayloadAction<string>) {
      state.currency = action.payload;
    },
    setBiometricEnabled(state, action: PayloadAction<boolean>) {
      state.biometricEnabled = action.payload;
    },
    /**
     * In-memory reactivity flag only ("is a PIN currently set"). The PIN value itself
     * must be written to `shared/services/secureStorage.ts` (expo-secure-store) by the
     * caller, not persisted here — `shared/store/index.ts`'s `settingsSecurityTransform`
     * strips this field before it ever reaches AsyncStorage-backed redux-persist.
     */
    setAppLockPin(state, action: PayloadAction<string | null>) {
      state.appLockPin = action.payload;
    },
    addToOfflineQueue(
      state,
      action: PayloadAction<{ id: string; action: string; resource?: 'transaction' | 'income' | 'budget' | 'goal'; payload: unknown }>
    ) {
      state.offlineQueue.push({ ...action.payload, timestamp: new Date().toISOString(), retryCount: 0 });
    },
    clearOfflineQueue(state) {
      state.offlineQueue = [];
    },
    removeOfflineQueueItems(state, action: PayloadAction<string[]>) {
      const ids = new Set(action.payload);
      state.offlineQueue = state.offlineQueue.filter((item) => !ids.has(item.id));
    },
    bumpOfflineQueueRetry(
      state,
      action: PayloadAction<{ id: string; error: string }>
    ) {
      const item = state.offlineQueue.find((entry) => entry.id === action.payload.id);
      if (!item) return;
      item.retryCount = (item.retryCount ?? 0) + 1;
      item.lastError = action.payload.error;
    },
    moveOfflineItemToConflicts(state, action: PayloadAction<{ id: string; error: string }>) {
      const index = state.offlineQueue.findIndex((entry) => entry.id === action.payload.id);
      if (index < 0) return;
      const [item] = state.offlineQueue.splice(index, 1);
      state.syncConflicts.push({
        id: item.id,
        action: item.action,
        resource: item.resource,
        payload: item.payload,
        timestamp: item.timestamp,
        error: action.payload.error,
      });
    },
    hydratePreferences(state, action: PayloadAction<{ theme?: string | null; accent?: string | null }>) {
      if (action.payload.theme) state.theme = resolveThemeMode(action.payload.theme);
      if (action.payload.accent) state.accent = resolveAccent(action.payload.accent);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (_state, action) => {
      const incoming = (action as { payload?: { settings?: Partial<SettingsState> } }).payload?.settings;
      if (!incoming) return initialState;
      return {
        ...initialState,
        ...incoming,
        theme: resolveThemeMode(incoming.theme),
        accent: resolveAccent(incoming.accent),
        offlineQueue: incoming.offlineQueue ?? [],
        syncConflicts: incoming.syncConflicts ?? [],
      };
    });
  },
});

export const {
  setTheme,
  setAccent,
  setCurrency,
  setBiometricEnabled,
  setAppLockPin,
  addToOfflineQueue,
  clearOfflineQueue,
  removeOfflineQueueItems,
  bumpOfflineQueueRetry,
  moveOfflineItemToConflicts,
  hydratePreferences,
} = settingsSlice.actions;
export default settingsSlice.reducer;
