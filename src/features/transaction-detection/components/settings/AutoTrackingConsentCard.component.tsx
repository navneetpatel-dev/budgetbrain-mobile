import React, { useMemo } from 'react';
import { View, Text, Switch } from 'react-native';
import { useTheme } from '@/shared/theme';
import { createStyles } from './AutoTrackingConsentCard.styles';

export interface AutoTrackingConsentCardProps {
  isEnabled: boolean;
  autoAddHighConfidence: boolean;
  notifyOnDetection: boolean;
  onToggleEnabled: (value: boolean) => void;
  onToggleAutoAdd: (value: boolean) => void;
  onToggleNotify: (value: boolean) => void;
}

export function AutoTrackingConsentCard({
  isEnabled,
  autoAddHighConfidence,
  notifyOnDetection,
  onToggleEnabled,
  onToggleAutoAdd,
  onToggleNotify,
}: AutoTrackingConsentCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>SMS Transaction Tracking</Text>
          <Text style={styles.subtitle}>
            Automatically detect bank debits & credits from your SMS inbox.
          </Text>
        </View>
        <Switch
          value={isEnabled}
          onValueChange={onToggleEnabled}
          trackColor={{ false: theme.colors.surfaceContainerHighest, true: theme.colors.primary }}
          thumbColor={isEnabled ? theme.colors.onPrimary : theme.colors.surface}
        />
      </View>

      <View style={styles.privacyPill}>
        <Text style={{ fontSize: 13 }}>🔒</Text>
        <Text style={styles.privacyText}>
          100% on-device parsing. Raw SMS messages never leave your phone.
        </Text>
      </View>

      {isEnabled && (
        <>
          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Text style={styles.settingLabel}>Auto-add Verified Transactions</Text>
              <Text style={styles.settingDesc}>
                Add transactions directly when confidence is ≥85%.
              </Text>
            </View>
            <Switch
              value={autoAddHighConfidence}
              onValueChange={onToggleAutoAdd}
              trackColor={{ false: theme.colors.surfaceContainerHighest, true: theme.colors.primary }}
              thumbColor={autoAddHighConfidence ? theme.colors.onPrimary : theme.colors.surface}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Text style={styles.settingLabel}>Detection Notifications</Text>
              <Text style={styles.settingDesc}>
                Receive a local notification with quick confirm / edit buttons.
              </Text>
            </View>
            <Switch
              value={notifyOnDetection}
              onValueChange={onToggleNotify}
              trackColor={{ false: theme.colors.surfaceContainerHighest, true: theme.colors.primary }}
              thumbColor={notifyOnDetection ? theme.colors.onPrimary : theme.colors.surface}
            />
          </View>
        </>
      )}
    </View>
  );
}
