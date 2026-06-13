import { Platform } from 'react-native';
import Constants from 'expo-constants';

const API_KEY =
  Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
    : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

let configured = false;

export async function initPurchases(userId?: string): Promise<boolean> {
  if (!API_KEY || configured) return false;

  try {
    const Purchases = (await import('react-native-purchases')).default;
    Purchases.setLogLevel(__DEV__ ? Purchases.LOG_LEVEL.DEBUG : Purchases.LOG_LEVEL.WARN);

    if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: API_KEY, appUserID: userId });
    } else if (Platform.OS === 'android') {
      Purchases.configure({ apiKey: API_KEY, appUserID: userId });
    } else {
      return false;
    }

    configured = true;
    return true;
  } catch {
    return false;
  }
}

export async function getOfferings() {
  if (!configured) return null;
  const Purchases = (await import('react-native-purchases')).default;
  return Purchases.getOfferings();
}

export async function purchasePackage(pkg: { identifier: string }) {
  if (!configured) throw new Error('Purchases not configured');
  const Purchases = (await import('react-native-purchases')).default;
  const offerings = await Purchases.getOfferings();
  const packages = offerings.current?.availablePackages ?? [];
  const target = packages.find((p) => p.identifier === pkg.identifier);
  if (!target) throw new Error('Package not found');
  return Purchases.purchasePackage(target);
}

export async function restorePurchases() {
  if (!configured) throw new Error('Purchases not configured');
  const Purchases = (await import('react-native-purchases')).default;
  return Purchases.restorePurchases();
}

export async function getCustomerInfo() {
  if (!configured) return null;
  const Purchases = (await import('react-native-purchases')).default;
  return Purchases.getCustomerInfo();
}

export function isPurchasesConfigured() {
  return configured;
}
