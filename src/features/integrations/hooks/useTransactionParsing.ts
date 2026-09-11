import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { api, apiPost, getApiErrorMessage } from '@/shared/services/api';
import { invalidateMoneyQueries } from '@/shared/services/queryInvalidation';
import { useCategoryOptions } from '@/features/categories/hooks/useCategoryOptions';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import type { ParsedTransactionPending } from '@/shared/types';
import { ValidationMessages } from '@/shared/validation/fieldLimits';

export interface SmsForm {
  content: string;
}

export interface EmailForm {
  subject: string;
  body: string;
}

export interface ParsedRecord {
  id: string;
  source: 'sms' | 'email' | 'csv';
  parsedAmount: number;
  parsedMerchant: string | null;
  confidence: number;
}

function toParsedRecord(item: ParsedTransactionPending): ParsedRecord {
  return {
    id: item.id,
    source: item.source,
    parsedAmount: Number(item.parsedAmount ?? 0),
    parsedMerchant: item.parsedMerchant,
    confidence: item.confidence,
  };
}

export function useTransactionParsing() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [smsLoading, setSmsLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [categoryId, setCategoryIdState] = useState('');
  const [categoryError, setCategoryError] = useState<string | undefined>();
  const [smsError, setSmsError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const setCategoryId = useCallback((id: string) => {
    setCategoryIdState(id);
    setCategoryError(undefined);
  }, []);
  const clearSmsError = useCallback(() => setSmsError(null), []);
  const clearEmailError = useCallback(() => setEmailError(null), []);
  const clearConfirmError = useCallback(() => setConfirmError(null), []);

  const {
    data: pendingItems,
    total: pendingTotal,
    isLoading: pendingLoading,
    refetch: refetchPending,
  } = usePaginatedList<ParsedTransactionPending, 'pending'>({
    queryKey: ['integrations-pending'],
    url: '/integrations/pending',
    itemsKey: 'pending',
  });

  const { data: categories } = useCategoryOptions();

  const smsForm = useForm<SmsForm>({ defaultValues: { content: '' } });
  const emailForm = useForm<EmailForm>({ defaultValues: { subject: '', body: '' } });

  const parsed = selectedId
    ? pendingItems.find((item) => item.id === selectedId) ?? null
    : pendingItems[0] ?? null;

  const parsedRecord = parsed ? toParsedRecord(parsed) : null;

  const selectPending = useCallback((id: string) => {
    setSelectedId(id);
    setCategoryId('');
    setConfirmError(null);
    setActionError(null);
  }, [setCategoryId]);

  const handleParseResult = async (result: {
    parsed: { id: string; source?: 'sms' | 'email' };
    suggestion: { amount: number; merchant: string; confidence: number };
  }) => {
    await refetchPending();
    setSelectedId(result.parsed.id);
    setCategoryId('');
  };

  const parseSms = async (data: SmsForm) => {
    setSmsLoading(true);
    setSmsError(null);
    try {
      const result = await apiPost<{
        parsed: { id: string; source: 'sms' };
        suggestion: { amount: number; merchant: string; confidence: number };
      }>('/integrations/sms', data);
      await handleParseResult(result);
      smsForm.reset();
    } catch (err) {
      setSmsError(getApiErrorMessage(err, 'Could not parse SMS'));
    } finally {
      setSmsLoading(false);
    }
  };

  const parseEmail = async (data: EmailForm) => {
    setEmailLoading(true);
    setEmailError(null);
    try {
      const result = await apiPost<{
        parsed: { id: string; source: 'email' };
        suggestion: { amount: number; merchant: string; confidence: number };
      }>('/integrations/email', data);
      await handleParseResult(result);
      emailForm.reset();
    } catch (err) {
      setEmailError(getApiErrorMessage(err, 'Could not parse email'));
    } finally {
      setEmailLoading(false);
    }
  };

  const uploadCsv = async () => {
    setCsvError(null);
    const result = await DocumentPicker.getDocumentAsync({
      type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel'],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];

    setCsvLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: asset.name ?? 'statement.csv',
        type: asset.mimeType ?? 'text/csv',
      } as unknown as Blob);

      await api.post('/integrations/csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await refetchPending();
    } catch (err) {
      setCsvError(getApiErrorMessage(err, 'Could not import CSV file'));
    } finally {
      setCsvLoading(false);
    }
  };

  const confirmParsed = async () => {
    setConfirmError(null);
    if (!parsedRecord) return;
    if (!categoryId) {
      setCategoryError(ValidationMessages.categoryRequired);
      return;
    }
    setCategoryError(undefined);
    setConfirmLoading(true);
    try {
      await apiPost(`/integrations/${parsedRecord.id}/confirm`, { categoryId });
      await refetchPending();
      setSelectedId(null);
      setCategoryIdState('');
      invalidateMoneyQueries(queryClient);
      router.push('/(tabs)/expenses');
    } catch (err) {
      setConfirmError(getApiErrorMessage(err, 'Could not create expense'));
    } finally {
      setConfirmLoading(false);
    }
  };

  const rejectParsed = async () => {
    if (!parsedRecord) return;
    setActionError(null);
    setCategoryError(undefined);
    try {
      await apiPost(`/integrations/${parsedRecord.id}/reject`, {});
      await refetchPending();
      setSelectedId(null);
      setCategoryIdState('');
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Could not reject parsed transaction'));
    }
  };

  return {
    smsLoading,
    emailLoading,
    csvLoading,
    csvError,
    uploadCsv,
    confirmLoading,
    pendingLoading,
    parsed: parsedRecord,
    pendingItems: pendingItems.map(toParsedRecord),
    pendingTotal,
    selectedId: parsedRecord?.id ?? null,
    selectPending,
    categoryId,
    setCategoryId,
    categoryError,
    categories,
    smsForm,
    emailForm,
    parseSms,
    parseEmail,
    confirmParsed,
    rejectParsed,
    smsError,
    emailError,
    confirmError,
    actionError,
    clearSmsError,
    clearEmailError,
    clearConfirmError,
  };
}
