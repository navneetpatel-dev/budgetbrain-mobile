import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/shared/theme';
import { openAppSettings } from '@/shared/services/sms';
import { createStyles } from './PermissionWarningBanner.styles';

export interface PermissionWarningBannerProps {
  status: 'denied' | 'blocked';
  onActionPress?: () => void;
}

export function PermissionWarningBanner({
  status,
  onActionPress,
}: PermissionWarningBannerProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handlePress = async () => {
    if (onActionPress) {
      onActionPress();
      return;
    }
    await openAppSettings();
  };

  const isBlocked = status === 'blocked';
  const buttonLabel = isBlocked ? 'Open Settings' : 'Allow Access';

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={{ fontSize: 20 }}>⚠️</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>SMS Permission Required</Text>
        <Text style={styles.description}>
          {isBlocked
            ? 'SMS permission was permanently denied. Please enable it in Settings to auto-detect transactions.'
            : 'SMS permission is required to detect bank transactions automatically.'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handlePress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={buttonLabel}
      >
        <Text style={styles.actionText}>{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}
