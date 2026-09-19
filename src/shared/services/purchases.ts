import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';

let configured = false;

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function getApiKey(): string | null {
  if (Platform.OS === 'ios') return process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? null;
  if (Platform.OS === 'android') return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? null;
  return null;
}

/**
 * No-ops when a platform API key isn't configured (e.g. local dev, web, or a
 * build missing RevenueCat dashboard setup) so the rest of the app never has
 * to branch on whether purchases are available — every export below is safe
 * to call unconditionally and simply resolves to an empty/failed result.
 */
export function initPurchases(): void {
  if (configured) return;
  const apiKey = getApiKey();
  if (!apiKey) return;

  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
  Purchases.configure({ apiKey });
  configured = true;
}

export function isPurchasesConfigured(): boolean {
  return configured;
}

/**
 * Must match the backend's User.id (RevenueCat's app_user_id) — see subscriptions.service.ts.
 * The backend webhook resolves who paid via `User.findByPk(event.app_user_id)`, so if this
 * never actually succeeds, a real purchase gets attributed to RevenueCat's anonymous
 * pre-login ID and the webhook silently can't find a matching user — the customer pays and
 * gets no entitlement. Retries a couple of times (a lightweight SDK call, not worth giving
 * up on after one transient failure) and returns whether identity is confirmed correct,
 * so a caller that's about to charge someone can guard on it instead of hoping.
 */
export async function loginPurchasesUser(userId: string, attempts = 3): Promise<boolean> {
  if (!configured) return false;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await Purchases.logIn(userId);
      return true;
    } catch {
      if (attempt < attempts) await wait(300 * attempt);
    }
  }
  return false;
}

/** Returns RevenueCat's actual current identity, or null if unconfigured/unreachable. */
export async function getCurrentPurchasesUserId(): Promise<string | null> {
  if (!configured) return null;
  try {
    return await Purchases.getAppUserID();
  } catch {
    return null;
  }
}

/**
 * Purchase-time identity guard: confirms RevenueCat's SDK is genuinely logged in as
 * `userId` (not still anonymous, and not another user, e.g. after a fast account switch)
 * before a caller proceeds to charge the customer. Re-attempts login once if the identity
 * doesn't already match, since `_layout.tsx`'s background login may still be in flight or
 * may have failed. Call this immediately before `purchasePackage`.
 */
export async function ensurePurchasesIdentity(userId: string): Promise<boolean> {
  if (!configured) return false;
  const current = await getCurrentPurchasesUserId();
  if (current === userId) return true;
  const loggedIn = await loginPurchasesUser(userId);
  if (!loggedIn) return false;
  return (await getCurrentPurchasesUserId()) === userId;
}

export async function logoutPurchasesUser(): Promise<void> {
  if (!configured) return;
  try {
    await Purchases.logOut();
  } catch {
    // Non-fatal.
  }
}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  if (!configured) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch {
    return null;
  }
}

export type PurchaseResult =
  | { status: 'success'; customerInfo: CustomerInfo }
  | { status: 'cancelled' }
  | { status: 'error'; message: string };

export async function purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult> {
  if (!configured) {
    return { status: 'error', message: 'Purchases are not available on this build yet.' };
  }
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { status: 'success', customerInfo };
  } catch (error) {
    const err = error as { userCancelled?: boolean; message?: string };
    if (err.userCancelled) return { status: 'cancelled' };
    return { status: 'error', message: err.message ?? 'Purchase failed. Please try again.' };
  }
}

export async function restorePurchases(): Promise<PurchaseResult> {
  if (!configured) {
    return { status: 'error', message: 'Purchases are not available on this build yet.' };
  }
  try {
    const customerInfo = await Purchases.restorePurchases();
    return { status: 'success', customerInfo };
  } catch (error) {
    const err = error as { message?: string };
    return { status: 'error', message: err.message ?? 'Restore failed. Please try again.' };
  }
}
