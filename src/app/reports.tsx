import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { DateInput, StackScrollScreen, FormSection, FormActions, Button } from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { useTheme } from '@/shared/theme';
import { useExportReports } from '@/features/reports/hooks/useExportReports';

export default function ReportsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { isPremium, startDate, setStartDate, endDate, setEndDate, loading, downloadCsv, downloadPdf } = useExportReports();

  return (
    <StackScrollScreen
      header={
        <ProfileStackHeader
          screen="reports"
          subtitle="Download your transaction history as CSV or PDF"
        />
      }
    >
      <FormSection title="Date range" subtitle="Leave empty to export all transactions">
        <DateInput label="Start date" value={startDate} onChange={setStartDate} disabled={loading} />
        <DateInput label="End date" value={endDate} onChange={setEndDate} disabled={loading} />
      </FormSection>

      <FormSection title="Download">
        <FormActions primaryTitle="Download CSV" onPrimary={downloadCsv} primaryLoading={loading} />
        <Button title="Download PDF (Premium)" onPress={downloadPdf} variant="outline" loading={loading} />
        {!isPremium ? <Text style={styles.premiumHint}>PDF export requires Premium</Text> : null}
      </FormSection>
    </StackScrollScreen>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    premiumHint: { ...t.typography.caption, color: t.colors.textSecondary, textAlign: 'center', marginTop: t.spacing.sm },
  });
}
