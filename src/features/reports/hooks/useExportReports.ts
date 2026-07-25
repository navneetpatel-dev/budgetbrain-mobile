import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { apiDownloadText, apiDownloadBinary } from '@/shared/services/api';
import { saveAndShareFile } from '@/shared/utils/downloads';
import { useAppSelector } from '@/shared/store/hooks';

export function useExportReports() {
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
      await saveAndShareFile('budgetbrain-report.csv', csv, 'text/csv');
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
      await saveAndShareFile('budgetbrain-report.pdf', buffer, 'application/pdf');
    } catch {
      Alert.alert('Error', 'Could not download PDF report');
    } finally {
      setLoading(false);
    }
  };

  return {
    isPremium,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    loading,
    downloadCsv,
    downloadPdf,
  };
}
