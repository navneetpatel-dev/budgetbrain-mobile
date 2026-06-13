import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button, DateInput, StackScrollScreen, GroupedCard } from '@/shared/components/ui';
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
      <GroupedCard title="Date range" padded>
        <DateInput label="Start Date (optional)" value={startDate} onChange={setStartDate} />
        <DateInput label="End Date (optional)" value={endDate} onChange={setEndDate} />
      </GroupedCard>

      <GroupedCard title="Download" padded>
        <Button title="Download CSV" onPress={downloadCsv} loading={loading} />
        <Button title="Download PDF (Premium)" onPress={downloadPdf} variant="outline" loading={loading} />
        {!isPremium && <Text style={styles.premiumHint}>PDF export requires Premium</Text>}
      </GroupedCard>
    </StackScrollScreen>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    premiumHint: { ...t.typography.caption, color: t.colors.textSecondary, textAlign: 'center' },
  });
}
