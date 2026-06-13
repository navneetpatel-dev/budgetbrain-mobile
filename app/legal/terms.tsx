import { StyleSheet, ScrollView, Text } from 'react-native';
import { COLORS } from '@/src/constants/config';

export default function TermsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Terms of Service</Text>
      <Text style={styles.updated}>Last updated: June 2026</Text>

      <Text style={styles.section}>1. Acceptance of Terms</Text>
      <Text style={styles.body}>
        By using ExpenseFlow, you agree to these Terms of Service. If you do not agree, please do not use the app.
      </Text>

      <Text style={styles.section}>2. Service Description</Text>
      <Text style={styles.body}>
        ExpenseFlow is a personal finance management application that helps you track expenses, income,
        budgets, goals, and net worth. Premium features include AI insights, family accounts, and PDF reports.
      </Text>

      <Text style={styles.section}>3. User Accounts</Text>
      <Text style={styles.body}>
        You are responsible for maintaining the confidentiality of your account credentials. You must provide
        accurate information and notify us of any unauthorized access.
      </Text>

      <Text style={styles.section}>4. Subscriptions</Text>
      <Text style={styles.body}>
        Premium subscriptions are billed through the App Store or Google Play. Subscriptions auto-renew unless
        cancelled at least 24 hours before the end of the current period. Refunds are subject to platform policies.
      </Text>

      <Text style={styles.section}>5. Acceptable Use</Text>
      <Text style={styles.body}>
        You agree not to misuse the service, attempt unauthorized access, or use the app for any unlawful purpose.
        We reserve the right to suspend accounts that violate these terms.
      </Text>

      <Text style={styles.section}>6. Disclaimer</Text>
      <Text style={styles.body}>
        ExpenseFlow provides financial tracking tools, not financial advice. AI insights are informational only.
        We are not responsible for financial decisions made based on app data.
      </Text>

      <Text style={styles.section}>7. Contact</Text>
      <Text style={styles.body}>
        For questions about these terms, contact us at support@expenseflow.app
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 48 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  updated: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 24 },
  section: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginTop: 16, marginBottom: 8 },
  body: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
});
