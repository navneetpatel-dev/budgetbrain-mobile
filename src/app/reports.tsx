import { useMemo } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { Button, DateInput, useScrollContentStyle, ScreenIntro, GroupedCard } from '@/shared/components/ui';
import { useTheme } from '@/shared/theme';
import { useExportReports } from '@/features/reports/hooks/useExportReports';

export default function ReportsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { isPremium, startDate, setStartDate, endDate, setEndDate, loading, downloadCsv, downloadPdf } = useExportReports();
  const contentStyle = useScrollContentStyle();

  return (
    <ScrollView style={styles.container} contentContainerStyle={contentStyle}>
      <ScreenIntro eyebrow="EXPORT" subtitle="Download your transaction history as CSV or PDF" />

      <GroupedCard title="DATE RANGE">
        <DateInput label="Start Date (optional)" value={startDate} onChange={setStartDate} />
        <DateInput label="End Date (optional)" value={endDate} onChange={setEndDate} />
      </GroupedCard>

      <GroupedCard title="DOWNLOAD">
        <Button title="Download CSV" onPress={downloadCsv} loading={loading} />
        <View style={styles.spacer} />
        <Button title="Download PDF (Premium)" onPress={downloadPdf} variant="outline" loading={loading} />
        {!isPremium && <Text style={styles.premiumHint}>PDF export requires Premium</Text>}
      </GroupedCard>
    </ScrollView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    spacer: { height: 12 },
    premiumHint: { ...t.typography.caption, color: t.colors.textSecondary, marginTop: 10, textAlign: 'center' },
  });
}
