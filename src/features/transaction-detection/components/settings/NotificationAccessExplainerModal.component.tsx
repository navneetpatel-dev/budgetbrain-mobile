import React, { useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/shared/theme';
import { createStyles } from './NotificationAccessExplainerModal.styles';

export interface NotificationAccessExplainerModalProps {
  visible: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

/**
 * Explains notification access before sending the user to system Settings (plan T8.1, spec
 * §23). Android has no permission dialog for it; the user switches it on in Settings.
 */
export function NotificationAccessExplainerModal({ visible, onConfirm, onDismiss }: NotificationAccessExplainerModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconHeader}>
            <Text style={styles.iconText}>🔔</Text>
          </View>
          <Text style={styles.title}>Detect Payments From Bank Apps</Text>
          <Text style={styles.subtitle}>
            Android will open its Notification access screen. Turn BudgetBrain on there, then come back.
          </Text>

          {/* What the listener reads and keeps. Keep in sync with BankNotificationListener.kt. */}
          <ScrollView style={styles.bulletScroll} contentContainerStyle={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletIcon}>🏦</Text>
              <View style={styles.bulletTextContainer}>
                <Text style={styles.bulletTitle}>Only bank and payment apps</Text>
                <Text style={styles.bulletDesc}>
                  {'Android shows the app every notification, but it only looks at ones from bank and UPI apps it knows that mention an amount. Chats, emails and everything else are ignored the moment they arrive and never saved.'}
                </Text>
              </View>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletIcon}>🛡️</Text>
              <View style={styles.bulletTextContainer}>
                <Text style={styles.bulletTitle}>Same privacy as SMS</Text>
                <Text style={styles.bulletDesc}>
                  {"Only the amount, date, merchant, account digits and reference are taken. The notification's text never leaves your phone."}
                </Text>
              </View>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletIcon}>⚙️</Text>
              <View style={styles.bulletTextContainer}>
                <Text style={styles.bulletTitle}>Turn it off any time</Text>
                <Text style={styles.bulletDesc}>{'Here, or in Android Settings under Notification access.'}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={onConfirm} activeOpacity={0.8}>
              <Text style={styles.primaryButtonText}>Open Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={onDismiss} activeOpacity={0.7}>
              <Text style={styles.secondaryButtonText}>Not Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
