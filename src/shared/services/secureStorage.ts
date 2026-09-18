import * as SecureStore from 'expo-secure-store';

const APP_LOCK_PIN_KEY = 'app_lock_pin';
const APP_LOCK_ATTEMPTS_KEY = 'app_lock_pin_attempts';

/** Escalating lockout after repeated wrong PIN guesses: no delay for the first 3
 * failures, then a cooldown that grows with each further failure. Persisted (not just
 * component state) so a killed/relaunched app can't be used to bypass the lockout. */
const LOCKOUT_FREE_ATTEMPTS = 3;
const LOCKOUT_BASE_SECONDS = 30;

interface PinAttemptState {
  failedAttempts: number;
  lockedUntil: number | null;
}

async function readAttemptState(): Promise<PinAttemptState> {
  const raw = await SecureStore.getItemAsync(APP_LOCK_ATTEMPTS_KEY);
  if (!raw) return { failedAttempts: 0, lockedUntil: null };
  try {
    const parsed = JSON.parse(raw) as PinAttemptState;
    return { failedAttempts: parsed.failedAttempts ?? 0, lockedUntil: parsed.lockedUntil ?? null };
  } catch {
    return { failedAttempts: 0, lockedUntil: null };
  }
}

async function writeAttemptState(state: PinAttemptState): Promise<void> {
  await SecureStore.setItemAsync(APP_LOCK_ATTEMPTS_KEY, JSON.stringify(state));
}

/** Returns the remaining lockout in seconds (0 if not currently locked out). */
export async function getPinLockoutSecondsRemaining(): Promise<number> {
  const { lockedUntil } = await readAttemptState();
  if (!lockedUntil) return 0;
  const remainingMs = lockedUntil - Date.now();
  return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
}

/** Records a failed PIN attempt and returns the resulting lockout (seconds, 0 if none yet). */
export async function recordFailedPinAttempt(): Promise<number> {
  const { failedAttempts } = await readAttemptState();
  const nextAttempts = failedAttempts + 1;
  const attemptsOverFree = nextAttempts - LOCKOUT_FREE_ATTEMPTS;
  if (attemptsOverFree <= 0) {
    await writeAttemptState({ failedAttempts: nextAttempts, lockedUntil: null });
    return 0;
  }
  // Doubles each additional failure past the free-attempt threshold: 30s, 60s, 120s, ...
  const lockoutSeconds = LOCKOUT_BASE_SECONDS * 2 ** (attemptsOverFree - 1);
  const lockedUntil = Date.now() + lockoutSeconds * 1000;
  await writeAttemptState({ failedAttempts: nextAttempts, lockedUntil });
  return lockoutSeconds;
}

/** Resets the failed-attempt counter on a successful PIN verification. */
export async function resetPinAttempts(): Promise<void> {
  await SecureStore.deleteItemAsync(APP_LOCK_ATTEMPTS_KEY);
}

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
