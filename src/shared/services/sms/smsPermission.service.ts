import { PermissionsAndroid, Platform, Linking } from 'react-native';
import { isSmsDetectorAvailable } from './smsDetector.service';

export type PermissionCheckResult = 'granted' | 'denied' | 'blocked' | 'unsupported';

/**
 * 'unsupported' off Android, in Expo Go (no native detector) and in the noSms build variant,
 * so the settings screen explains instead of asking for a permission the build can't hold.
 */
export async function checkSmsPermissions(): Promise<PermissionCheckResult> {
  if (Platform.OS !== 'android' || !isSmsDetectorAvailable()) {
    return 'unsupported';
  }

  try {
    const hasReceive = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECEIVE_SMS
    );
    const hasRead = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_SMS
    );

    if (hasReceive && hasRead) {
      return 'granted';
    }
    return 'denied';
  } catch {
    return 'denied';
  }
}

export async function requestSmsPermissions(): Promise<PermissionCheckResult> {
  if (Platform.OS !== 'android' || !isSmsDetectorAvailable()) {
    return 'unsupported';
  }

  try {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
      PermissionsAndroid.PERMISSIONS.READ_SMS,
    ]);

    const receiveStatus = results[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS];
    const readStatus = results[PermissionsAndroid.PERMISSIONS.READ_SMS];

    if (
      receiveStatus === PermissionsAndroid.RESULTS.GRANTED &&
      readStatus === PermissionsAndroid.RESULTS.GRANTED
    ) {
      return 'granted';
    }

    if (
      receiveStatus === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
      readStatus === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
    ) {
      return 'blocked';
    }

    return 'denied';
  } catch {
    return 'denied';
  }
}

export function openAppSettings(): void {
  Linking.openSettings().catch(() => {});
}
