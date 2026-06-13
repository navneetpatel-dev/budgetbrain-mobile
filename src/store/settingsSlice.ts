import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsState {
  theme: ThemeMode;
  currency: string;
  biometricEnabled: boolean;
  appLockPin: string | null;
  offlineQueue: Array<{ id: string; action: string; payload: unknown; timestamp: string }>;
}

const initialState: SettingsState = {
  theme: 'system',
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
});

export const {
  setTheme,
  setCurrency,
  setBiometricEnabled,
  setAppLockPin,
  addToOfflineQueue,
  clearOfflineQueue,
} = settingsSlice.actions;
export default settingsSlice.reducer;
