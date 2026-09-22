import { useState } from 'react';
import { Alert } from 'react-native';
import { apiDownloadText, apiDownloadBinary } from '@/shared/services/api';
import { saveAndShareFile } from '@/shared/utils/downloads';

export function useExportReports() {
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

  const downloadExcel = async () => {
    setLoading(true);
    try {
      const buffer = await apiDownloadBinary('/reports/excel', buildParams());
      await saveAndShareFile(
        'budgetbrain-report.xlsx',
        buffer,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
    } catch {
      Alert.alert('Error', 'Could not download Excel report');
    } finally {
      setLoading(false);
    }
  };

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    loading,
    downloadCsv,
    downloadPdf,
    downloadExcel,
  };
}
