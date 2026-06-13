import { useMemo } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { Button, DateInput, Card, useScrollContentStyle } from '@/shared/components/ui';
import { useTheme } from '@/shared/theme';
import { useExportReports } from '@/features/reports/hooks/useExportReports';

export default function ReportsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { isPremium, startDate, setStartDate, endDate, setEndDate, loading, downloadCsv, downloadPdf } = useExportReports();
  const contentStyle = useScrollContentStyle();

  return (
    <ScrollView style={styles.container} contentContainerStyle={contentStyle}>
      <Text style={styles.title}>Export Reports</Text>
      <Text style={styles.subtitle}>Download your transaction history</Text>

      <Card style={styles.card}>
        <DateInput label="Start Date (optional)" value={startDate} onChange={setStartDate} />
        <DateInput label="End Date (optional)" value={endDate} onChange={setEndDate} />
        <Button title="Download CSV" onPress={downloadCsv} loading={loading} />
        <View style={styles.spacer} />
        <Button title="Download PDF (Premium)" onPress={downloadPdf} variant="outline" loading={loading} />
        {!isPremium && <Text style={styles.premiumHint}>PDF export requires Premium</Text>}
      </Card>
    </ScrollView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    title: { fontSize: 24, fontWeight: '800', color: t.colors.text, marginBottom: 4 },
    subtitle: { fontSize: 14, color: t.colors.textSecondary, marginBottom: 24 },
    card: { marginBottom: 16 },
    spacer: { height: 12 },
    premiumHint: { fontSize: 12, color: t.colors.textSecondary, marginTop: 8, textAlign: 'center' },
  });
}
