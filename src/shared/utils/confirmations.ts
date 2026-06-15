import { Alert } from 'react-native';
import type { ConfirmCopy } from '@/shared/constants/confirmations';

/** Native confirmation dialog with consistent copy and cancel / confirm actions. */
export function showConfirmation(
  copy: ConfirmCopy,
  onConfirm: () => void | Promise<void>,
): void {
  Alert.alert(copy.title, copy.message, [
    { text: copy.cancelLabel ?? 'Cancel', style: 'cancel' },
    {
      text: copy.confirmLabel,
      style: copy.destructive ? 'destructive' : 'default',
      onPress: () => { void onConfirm(); },
    },
  ]);
}
