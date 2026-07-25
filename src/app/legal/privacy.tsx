import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { StackScrollScreen } from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { useTheme } from '@/shared/theme';

export default function PrivacyScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <StackScrollScreen
      header={<ProfileStackHeader screen="privacy" subtitle="Last updated: June 2026" />}
    >
      <Text style={styles.section}>1. Information We Collect</Text>
      <Text style={styles.body}>
        BudgetBrain collects account information (email, name), financial transaction data you enter,
        and device information for push notifications. We do not sell your personal data.
      </Text>

      <Text style={styles.section}>2. How We Use Your Data</Text>
      <Text style={styles.body}>
        Your data is used to provide budgeting, expense tracking, AI insights (for Premium users),
        and to improve our services. Transaction data is stored securely on our servers.
      </Text>

      <Text style={styles.section}>3. Data Security</Text>
      <Text style={styles.body}>
        We use industry-standard encryption for data in transit and at rest. Access tokens are stored
        in your device's secure storage. You can delete your account and all associated data at any time.
      </Text>

      <Text style={styles.section}>4. Third-Party Services</Text>
      <Text style={styles.body}>
        We use analytics (PostHog), crash reporting, and payment processing (RevenueCat) services.
        These providers have their own privacy policies governing their use of data.
      </Text>

      <Text style={styles.section}>5. Your Rights</Text>
      <Text style={styles.body}>
        You may request access to, correction of, or deletion of your personal data by contacting
        support or using the in-app account deletion feature.
      </Text>

      <Text style={styles.section}>6. Contact</Text>
      <Text style={styles.body}>
        For privacy-related inquiries, contact us at privacy@budgetbrain.app
      </Text>
    </StackScrollScreen>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    section: { fontSize: 16, fontWeight: '700', color: t.colors.text, marginTop: 8, marginBottom: 8 },
    body: { fontSize: 14, color: t.colors.textSecondary, lineHeight: 22 },
  });
}
