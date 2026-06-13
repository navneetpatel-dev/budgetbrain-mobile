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
      name: 'ExpenseFlow',
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
