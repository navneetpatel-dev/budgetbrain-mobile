import { Alert } from 'react-native';

export function confirmDeleteBudget(name: string, onConfirm: () => void) {
  Alert.alert('Delete Budget', `Remove "${name}"?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onConfirm },
  ]);
}
