import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';

let configured = false;

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

/** Must match the backend's User.id (RevenueCat's app_user_id) — see subscriptions.service.ts. */
export async function loginPurchasesUser(userId: string): Promise<void> {
  if (!configured) return;
  try {
    await Purchases.logIn(userId);
  } catch {
    // Non-fatal — entitlement still reads from the backend as the source of truth.
  }
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
