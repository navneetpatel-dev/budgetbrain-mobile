import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/shared/theme';
import { createStyles } from './SyncStatusPill.styles';

export interface SyncStatusPillProps {
  isSyncing?: boolean;
  isOffline?: boolean;
  lastSyncAt?: string | null;
  onPress?: () => void;
}

export function SyncStatusPill({
  isSyncing = false,
  isOffline = false,
  lastSyncAt,
  onPress,
}: SyncStatusPillProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const dotStyle = isSyncing
    ? styles.dotSyncing
    : isOffline
      ? styles.dotOffline
      : styles.dotActive;

  let statusText = 'Auto-detection active';
  if (isSyncing) {
    statusText = 'Syncing messages...';
  } else if (isOffline) {
    statusText = 'Sync queued (offline)';
  } else if (lastSyncAt) {
    const date = new Date(lastSyncAt);
    statusText = `Synced ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  const Content = (
    <View style={styles.container}>
      <View style={[styles.dot, dotStyle]} />
      <Text style={styles.text}>{statusText}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {Content}
      </TouchableOpacity>
    );
  }

  return Content;
}
