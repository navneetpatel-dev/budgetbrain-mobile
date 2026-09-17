import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { StackScrollScreen } from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { useTheme } from '@/shared/theme';

export default function TermsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <StackScrollScreen
      header={<ProfileStackHeader screen="terms" subtitle="Last updated: June 2026" />}
    >
      <Text style={styles.section}>1. Acceptance of Terms</Text>
      <Text style={styles.body}>
        By using BudgetBrain, you agree to these Terms of Service. If you do not agree, please do not use the app.
      </Text>

      <Text style={styles.section}>2. Service Description</Text>
      <Text style={styles.body}>
        BudgetBrain is a personal finance management application that helps you track expenses, income,
        budgets, goals, and net worth. Features include AI insights, family accounts, and PDF reports.
      </Text>

      <Text style={styles.section}>3. User Accounts</Text>
      <Text style={styles.body}>
        You are responsible for maintaining the confidentiality of your account credentials. You must provide
        accurate information and notify us of any unauthorized access.
      </Text>

      <Text style={styles.section}>4. Acceptable Use</Text>
      <Text style={styles.body}>
        You agree not to misuse the service, attempt unauthorized access, or use the app for any unlawful purpose.
        We reserve the right to suspend accounts that violate these terms.
      </Text>

      <Text style={styles.section}>5. Disclaimer</Text>
      <Text style={styles.body}>
        BudgetBrain provides financial tracking tools, not financial advice. AI insights are informational only.
        We are not responsible for financial decisions made based on app data.
      </Text>

      <Text style={styles.section}>6. Contact</Text>
      <Text style={styles.body}>
        For questions about these terms, contact us at support@budgetbrain.app
      </Text>
    </StackScrollScreen>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    section: { ...t.typography.titleSm, color: t.colors.text, marginTop: t.spacing.sm, marginBottom: t.spacing.sm },
    body: { ...t.typography.bodyMedium, color: t.colors.textSecondary },
  });
}
