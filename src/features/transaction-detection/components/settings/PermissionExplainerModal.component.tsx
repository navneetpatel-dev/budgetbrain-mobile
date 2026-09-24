import React, { useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/shared/theme';
import { createStyles } from './PermissionExplainerModal.styles';

export interface PermissionExplainerModalProps {
  visible: boolean;
  isPermanentlyDenied?: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

export function PermissionExplainerModal({
  visible,
  isPermanentlyDenied = false,
  onConfirm,
  onDismiss,
}: PermissionExplainerModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconHeader}>
            <Text style={styles.iconText}>💬</Text>
          </View>

          <Text style={styles.title}>
            {isPermanentlyDenied
              ? 'Enable SMS in Settings'
              : 'Auto-Detect Your Expenses'}
          </Text>

          <Text style={styles.subtitle}>
            {isPermanentlyDenied
              ? 'SMS access was previously declined. Please open Android settings to enable auto-tracking.'
              : 'Card payments, UPI transfers and bank credits become transactions without typing them in.'}
          </Text>

          {/* What the app reads, extracts and stores (plan T5.8, spec §23). Keep in sync with the pipeline. */}
          <ScrollView style={styles.bulletScroll} contentContainerStyle={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletIcon}>🏦</Text>
              <View style={styles.bulletTextContainer}>
                <Text style={styles.bulletTitle}>Only messages from known banks</Text>
                <Text style={styles.bulletDesc}>{'The app reads your SMS inbox on this phone but only looks at messages from senders it recognises as banks, cards and payment apps. Everything else, including personal messages and OTPs, is skipped without being analysed or saved.'}</Text>
              </View>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletIcon}>🔍</Text>
              <View style={styles.bulletTextContainer}>
                <Text style={styles.bulletTitle}>What is taken from a bank message</Text>
                <Text style={styles.bulletDesc}>{'The amount, date, merchant name, the last digits of the account or card, and the reference number. Nothing else.'}</Text>
              </View>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletIcon}>🛡️</Text>
              <View style={styles.bulletTextContainer}>
                <Text style={styles.bulletTitle}>What leaves your phone</Text>
                <Text style={styles.bulletDesc}>{'Those fields, the bank\'s name, a suggested category and a one-way code that stops duplicates are sent to your BudgetBrain account. The message text never leaves your phone and is never stored.'}</Text>
              </View>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletIcon}>⚙️</Text>
              <View style={styles.bulletTextContainer}>
                <Text style={styles.bulletTitle}>You stay in control</Text>
                <Text style={styles.bulletDesc}>{'Turn tracking off here at any time; that also clears anything waiting to sync. "Delete my detected data" removes every detection from this phone and our servers.'}</Text>
              </View>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletIcon}>📱</Text>
              <View style={styles.bulletTextContainer}>
                <Text style={styles.bulletTitle}>Android only</Text>
                <Text style={styles.bulletDesc}>{"iPhones don't let apps read SMS, so on iOS transactions are added by hand."}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>
                {isPermanentlyDenied ? 'Open Settings' : 'Allow Access'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onDismiss}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Not Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
