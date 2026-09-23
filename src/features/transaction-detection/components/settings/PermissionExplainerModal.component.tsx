import React, { useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
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
              : 'Effortlessly track every card swipe and UPI debit without typing a single number.'}
          </Text>

          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletIcon}>🛡️</Text>
              <View style={styles.bulletTextContainer}>
                <Text style={styles.bulletTitle}>100% Private & On-Device</Text>
                <Text style={styles.bulletDesc}>
                  SMS messages are parsed right inside your phone. No message text is ever uploaded to our servers.
                </Text>
              </View>
            </View>

            <View style={styles.bulletItem}>
              <Text style={styles.bulletIcon}>🏦</Text>
              <View style={styles.bulletTextContainer}>
                <Text style={styles.bulletTitle}>Only Bank SMS Analyzed</Text>
                <Text style={styles.bulletDesc}>
                  Personal messages, OTPs, and verification codes are completely ignored and discarded.
                </Text>
              </View>
            </View>

            <View style={styles.bulletItem}>
              <Text style={styles.bulletIcon}>⚡</Text>
              <View style={styles.bulletTextContainer}>
                <Text style={styles.bulletTitle}>Full Control</Text>
                <Text style={styles.bulletDesc}>
                  Review detected expenses anytime, or turn auto-tracking off in one tap.
                </Text>
              </View>
            </View>
          </View>

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
