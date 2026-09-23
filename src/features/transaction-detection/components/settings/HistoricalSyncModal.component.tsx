import React, { useState, useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/shared/theme';
import { createStyles } from './HistoricalSyncModal.styles';

export interface HistoricalSyncModalProps {
  visible: boolean;
  isSyncing: boolean;
  progress: { total: number; processed: number; detected: number };
  onStartSync: (days: number) => void;
  onCancelSync?: () => void;
  onDismiss: () => void;
}

const SYNC_OPTIONS = [
  { days: 30, label: 'Past 30 Days', subtext: 'Recommended · Quick setup' },
  { days: 60, label: 'Past 60 Days', subtext: 'Past 2 months of history' },
  { days: 90, label: 'Past 90 Days', subtext: 'Comprehensive 3-month scan' },
];

export function HistoricalSyncModal({
  visible,
  isSyncing,
  progress,
  onStartSync,
  onCancelSync,
  onDismiss,
}: HistoricalSyncModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [selectedDays, setSelectedDays] = useState(30);

  const percent = progress.total > 0
    ? Math.min(100, Math.round((progress.processed / progress.total) * 100))
    : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isSyncing ? undefined : onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>
            {isSyncing ? 'Scanning Past SMS...' : 'Import Past Transactions'}
          </Text>

          <Text style={styles.subtitle}>
            {isSyncing
              ? 'Extracting bank debits and credits from your inbox.'
              : 'Choose how far back to scan for your previous bank transactions.'}
          </Text>

          {!isSyncing ? (
            <>
              <View style={styles.rangeOptions}>
                {SYNC_OPTIONS.map((opt) => {
                  const isSelected = selectedDays === opt.days;
                  return (
                    <TouchableOpacity
                      key={opt.days}
                      style={[
                        styles.rangeOption,
                        isSelected && styles.rangeOptionSelected,
                      ]}
                      onPress={() => setSelectedDays(opt.days)}
                      activeOpacity={0.8}
                    >
                      <View>
                        <Text style={styles.rangeOptionText}>{opt.label}</Text>
                        <Text style={styles.rangeOptionSubtext}>{opt.subtext}</Text>
                      </View>
                      <Text style={{ fontSize: 16 }}>{isSelected ? '🔘' : '⚪'}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => onStartSync(selectedDays)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryButtonText}>Start Scan</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={onDismiss}
                  activeOpacity={0.7}
                >
                  <Text style={styles.secondaryButtonText}>Skip for Now</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.progressSection}>
              <View style={styles.progressBarTrack}>
                <View
                  style={[styles.progressBarFill, { width: `${percent}%` }]}
                />
              </View>

              <Text style={styles.progressText}>{percent}% Completed</Text>
              <Text style={styles.progressDetail}>
                {progress.processed} of {progress.total} messages scanned · {progress.detected} found
              </Text>

              {onCancelSync && (
                <TouchableOpacity
                  style={[styles.secondaryButton, { marginTop: theme.spacing.lg }]}
                  onPress={onCancelSync}
                  activeOpacity={0.7}
                >
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
