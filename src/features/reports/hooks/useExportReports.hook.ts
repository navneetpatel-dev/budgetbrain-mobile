import { useState } from 'react';
import { Alert } from 'react-native';
import { apiGet, apiPost } from '@/shared/services/api';
import { downloadAndShareFile } from '@/shared/utils/downloads';

type ExportFormat = 'csv' | 'pdf' | 'excel';

interface ExportJobStatus {
  status: 'pending' | 'active' | 'completed' | 'failed';
  downloadUrl?: string;
  fileName?: string;
}

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 30;

const MIME_TYPES: Record<ExportFormat, string> = {
  csv: 'text/csv',
  pdf: 'application/pdf',
  excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

const EXTENSIONS: Record<ExportFormat, string> = {
  csv: 'csv',
  pdf: 'pdf',
  excel: 'xlsx',
};

async function pollExportJob(jobId: string): Promise<ExportJobStatus> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const status = await apiGet<ExportJobStatus>(`/reports/export-async/${jobId}`);
    if (status.status === 'completed' || status.status === 'failed') return status;
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  throw new Error('Export timed out');
}

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

  const exportReport = async (format: ExportFormat) => {
    setLoading(true);
    try {
      const { jobId } = await apiPost<{ jobId: string }>('/reports/export-async', {
        format,
        filters: buildParams(),
      });
      const status = await pollExportJob(jobId);
      if (status.status !== 'completed' || !status.downloadUrl) {
        throw new Error('Export failed');
      }
      await downloadAndShareFile(
        status.downloadUrl,
        status.fileName ?? `budgetbrain-report.${EXTENSIONS[format]}`,
        MIME_TYPES[format]
      );
    } catch {
      Alert.alert('Error', `Could not export ${format.toUpperCase()} report`);
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
    exportReport,
  };
}
