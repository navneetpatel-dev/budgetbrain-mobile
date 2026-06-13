import { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input, Card } from '@/src/components/ui';
import { apiDownloadText, apiDownloadBinary } from '@/src/services/api';
import { saveAndShareFile } from '@/src/utils/downloads';
import { useAppSelector } from '@/src/store/hooks';
import { useTheme } from '@/src/theme';

export default function ReportsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const isPremium = ['premium', 'lifetime', 'admin'].includes(user?.role ?? '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const buildParams = (): Record<string, string> => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return params;
  };

  const downloadCsv = async () => {
    setLoading(true);
    try {
      const csv = await apiDownloadText('/reports/csv', buildParams());
      await saveAndShareFile('expenseflow-report.csv', csv, 'text/csv');
    } catch {
      Alert.alert('Error', 'Could not download CSV report');
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    if (!isPremium) {
      Alert.alert('Premium Feature', 'PDF reports are available for Premium subscribers.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upgrade', onPress: () => router.push('/subscription') },
      ]);
      return;
    }
    setLoading(true);
    try {
      const buffer = await apiDownloadBinary('/reports/pdf', buildParams());
      await saveAndShareFile('expenseflow-report.pdf', buffer, 'application/pdf');
    } catch {
      Alert.alert('Error', 'Could not download PDF report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Export Reports</Text>
      <Text style={styles.subtitle}>Download your transaction history</Text>

      <Card style={styles.card}>
        <Input label="Start Date (optional)" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" />
        <Input label="End Date (optional)" value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" />
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
    content: { padding: 16, paddingBottom: 48 },
    title: { fontSize: 24, fontWeight: '800', color: t.colors.text, marginBottom: 4 },
    subtitle: { fontSize: 14, color: t.colors.textSecondary, marginBottom: 24 },
    card: { marginBottom: 16 },
    spacer: { height: 12 },
    premiumHint: { fontSize: 12, color: t.colors.textSecondary, marginTop: 8, textAlign: 'center' },
  });
}
