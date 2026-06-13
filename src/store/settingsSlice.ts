import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import type { AccentPalette, ThemeMode } from '../theme/types';
import { resolveAccent, resolveThemeMode } from '../theme/palettes';

interface SettingsState {
  theme: ThemeMode;
  accent: AccentPalette;
  currency: string;
  biometricEnabled: boolean;
  appLockPin: string | null;
  offlineQueue: Array<{ id: string; action: string; payload: unknown; timestamp: string }>;
}

const initialState: SettingsState = {
  theme: 'system',
  accent: 'indigo',
  currency: 'INR',
  biometricEnabled: false,
  appLockPin: null,
  offlineQueue: [],
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
    setAppLockPin(state, action: PayloadAction<string | null>) {
      state.appLockPin = action.payload;
    },
    addToOfflineQueue(
      state,
      action: PayloadAction<{ id: string; action: string; payload: unknown }>
    ) {
      state.offlineQueue.push({ ...action.payload, timestamp: new Date().toISOString() });
    },
    clearOfflineQueue(state) {
      state.offlineQueue = [];
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
} = settingsSlice.actions;
export default settingsSlice.reducer;
