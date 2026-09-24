import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/shared/theme';
import { createStyles } from './DetectionPausedNotice.styles';

export interface DetectionPausedNoticeProps {
  /** False: the staged rollout (plan T9.3) hasn't reached this account; true: paused for everyone. */
  rolledOut: boolean;
  onPasteOrImport: () => void;
}

/** Shown when the server has automatic detection off for this account (rollout or kill switch). */
export function DetectionPausedNotice({ rolledOut, onPasteOrImport }: DetectionPausedNoticeProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{rolledOut ? 'Automatic detection is paused' : 'Coming to your account soon'}</Text>
        <Text style={styles.description}>
          {rolledOut
            ? "We've paused it while we fix something. Nothing is lost; you can still paste a message or import a statement."
            : "Automatic detection is rolling out gradually. Until it reaches you, paste a message or import a statement."}
        </Text>
      </View>
      <TouchableOpacity style={styles.actionButton} onPress={onPasteOrImport} accessibilityRole="button" activeOpacity={0.8}>
        <Text style={styles.actionText}>Paste or Import</Text>
      </TouchableOpacity>
    </View>
  );
}
