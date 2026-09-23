import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/theme';
import { createStyles } from './AutoDetectedBadge.styles';

export interface AutoDetectedBadgeProps {
  source?: string;
}

export function AutoDetectedBadge({ source = 'sms' }: AutoDetectedBadgeProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const label = source === 'notification' ? 'Auto (Notification)' : 'Auto (SMS)';

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>⚡ {label}</Text>
    </View>
  );
}
