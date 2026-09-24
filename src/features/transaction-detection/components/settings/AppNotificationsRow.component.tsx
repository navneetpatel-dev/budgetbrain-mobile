import React, { useMemo } from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { useTheme } from '@/shared/theme';
import { createStyles } from './AppNotificationsRow.styles';

export interface AppNotificationsRowProps {
  enabled: boolean;
  accessGranted: boolean;
  onToggle: (value: boolean) => void;
  onOpenSettings: () => void;
}

/** Bank and UPI app notifications as a second source (plan T8.1). */
export function AppNotificationsRow({ enabled, accessGranted, onToggle, onOpenSettings }: AppNotificationsRowProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Bank App Notifications</Text>
          <Text style={styles.subtitle}>
            Also detect payments from your bank and UPI apps&apos; notifications. A payment seen in
            both an SMS and a notification is added once.
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          accessibilityLabel="Bank app notifications"
          trackColor={{ false: theme.colors.surfaceContainerHighest, true: theme.colors.primary }}
          thumbColor={enabled ? theme.colors.onPrimary : theme.colors.surface}
        />
      </View>
      {enabled && !accessGranted && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>Notification access is off, so nothing is detected yet.</Text>
          <TouchableOpacity onPress={onOpenSettings} accessibilityRole="button" activeOpacity={0.7}>
            <Text style={styles.warningAction}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
