import * as SecureStore from 'expo-secure-store';

const APP_LOCK_PIN_KEY = 'app_lock_pin';

/**
 * App Lock PIN storage. A PIN is a credential, so it must live in expo-secure-store —
 * never in Redux/redux-persist (which is backed by plain AsyncStorage; see
 * `shared/store/index.ts`'s `settingsSecurityTransform`, which strips `appLockPin`
 * from anything written there).
 */
export async function getStoredAppLockPin(): Promise<string | null> {
  return SecureStore.getItemAsync(APP_LOCK_PIN_KEY);
}

export async function setStoredAppLockPin(pin: string): Promise<void> {
  await SecureStore.setItemAsync(APP_LOCK_PIN_KEY, pin);
}

export async function clearStoredAppLockPin(): Promise<void> {
  await SecureStore.deleteItemAsync(APP_LOCK_PIN_KEY);
}
