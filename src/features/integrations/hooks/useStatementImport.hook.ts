import { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/shared/services/api';
import { invalidateMoneyQueries } from '@/shared/services/queryInvalidation';
import { importStatement, previewStatement } from '../api/ingest.api';
import type { StatementFile } from '../types/ingest.types';
import { importSummary, previewSummary } from '../utils/ingestMessages';

const TYPES = ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel', 'text/plain', 'application/xml', 'text/xml', 'application/x-ofx', 'application/octet-stream'];

/**
 * Statement import on the phone (plan T6.5): pick a file, see what it holds, then import.
 * A CSV whose columns the server can't recognise is mapped on the web app instead.
 */
export function useStatementImport() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<StatementFile | null>(null);

  const preview = useMutation({ mutationFn: previewStatement });
  const commit = useMutation({
    mutationFn: importStatement,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['detected-transactions'] });
      invalidateMoneyQueries(queryClient);
    },
  });

  const pick = async () => {
    const picked = await DocumentPicker.getDocumentAsync({ type: TYPES, copyToCacheDirectory: true });
    if (picked.canceled || !picked.assets?.[0]) return;
    const asset = picked.assets[0];
    const next = { uri: asset.uri, name: asset.name ?? 'statement.csv', mimeType: asset.mimeType ?? 'text/plain' };
    setFile(next);
    commit.reset();
    preview.mutate(next);
  };

  const data = preview.data;
  const error = preview.error ?? commit.error;
  return {
    fileName: file?.name ?? null,
    pick: () => void pick(),
    isPreviewing: preview.isPending,
    summary: data && !data.needsMapping ? previewSummary(data) : null,
    needsMapping: !!data?.needsMapping,
    canImport: !!file && !!data && !data.needsMapping && data.validRows > 0 && !commit.isSuccess,
    runImport: () => {
      if (file) commit.mutate(file);
    },
    isImporting: commit.isPending,
    result: commit.data ? importSummary(commit.data) : null,
    error: error ? getApiErrorMessage(error, 'Could not read this statement') : null,
  };
}
