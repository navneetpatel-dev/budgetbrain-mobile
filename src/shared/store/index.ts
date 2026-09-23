import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  createTransform,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  type PersistConfig,
} from 'redux-persist';
import { persistStorage } from './storage';
import authReducer from './authSlice';
import settingsReducer, { type SettingsState } from './settingsSlice';
import transactionDetectionReducer from './transactionDetectionSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  settings: settingsReducer,
  transactionDetection: transactionDetectionReducer,
});

type CombinedState = ReturnType<typeof rootReducer>;

/**
 * `appLockPin` is a credential and must never be written to redux-persist's
 * AsyncStorage-backed store in plaintext. This transform strips it from the
 * `settings` slice on every persist write; the real value belongs in
 * `shared/services/secureStorage.ts` (expo-secure-store), not Redux state.
 */
const settingsSecurityTransform = createTransform<SettingsState, SettingsState, CombinedState>(
  (inboundState) => ({ ...inboundState, appLockPin: null }),
  (outboundState) => outboundState,
  { whitelist: ['settings'] }
);

const persistConfig: PersistConfig<CombinedState> = {
  key: 'budgetbrain',
  storage: persistStorage,
  whitelist: ['settings', 'transactionDetection'],
  transforms: [settingsSecurityTransform],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        warnAfter: 128,
      },
      immutableCheck: {
        warnAfter: 128,
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
