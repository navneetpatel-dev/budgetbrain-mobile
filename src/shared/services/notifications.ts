import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { apiPost } from './api';

/** Push notifications are not supported in Expo Go (SDK 53+). Use a dev build. */
export function isPushAvailable(): boolean {
  return Constants.appOwnership !== 'expo';
}

async function loadNotifications() {
  if (!isPushAvailable()) return null;
  try {
    return await import('expo-notifications');
  } catch {
    return null;
  }
}

export async function registerForPushNotifications(): Promise<string | null> {
  if (!isPushAvailable()) return null;

  const Notifications = await loadNotifications();
  if (!Notifications) return null;

  const Device = await import('expo-device');
  if (!Device.isDevice) return null;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'BudgetBrain',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;

  await apiPost('/notifications/register-device', {
    pushToken: token,
    deviceName: Device.deviceName ?? 'Mobile Device',
    platform: Platform.OS,
  });

  return token;
}

/**
 * Maps a tapped push notification's `data` payload to the screen it should open,
 * per requirements.md's 5 trigger types. `data.type` is the `NotificationType` enum
 * value the backend now includes in every push payload (see
 * backend/src/shared/modules/notifications/service/notification.service.ts).
 */
export function resolveNotificationDeepLink(data: Record<string, unknown> | undefined): string {
  const type = data?.type as string | undefined;
  switch (type) {
    case 'budget_exceeded':
      return data?.budgetId ? `/budget/${String(data.budgetId)}` : '/(tabs)/budgets';
    case 'goal_achieved':
      return data?.goalId ? `/goal/${String(data.goalId)}` : '/(tabs)/goals';
    case 'subscription_renewal':
      // No dedicated "my BudgetBrain plan" screen exists yet (confirmed gap, step 13) —
      // Settings is the closest real destination until a paywall/plan screen is built.
      return '/(tabs)/settings';
    case 'daily_reminder':
      return '/expense/add';
    case 'bill_due':
    case 'recurring_expense':
      return data?.transactionId ? `/expense/${String(data.transactionId)}` : '/subscriptions';
    case 'weekly_digest':
      return '/recap';
    default:
      return '/notifications';
  }
}

export async function addNotificationListener(
  callback: (notification: import('expo-notifications').Notification) => void
) {
  const Notifications = await loadNotifications();
  if (!Notifications) return { remove: () => {} };
  return Notifications.addNotificationReceivedListener(callback);
}

export async function addNotificationResponseListener(
  callback: (response: import('expo-notifications').NotificationResponse) => void
) {
  const Notifications = await loadNotifications();
  if (!Notifications) return { remove: () => {} };
  return Notifications.addNotificationResponseReceivedListener(callback);
}
