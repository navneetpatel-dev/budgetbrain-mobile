import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { apiPost } from '@/shared/services/api';
import { useCategoryOptions } from '@/features/categories/hooks/useCategoryOptions';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import type { ParsedTransactionPending } from '@/shared/types';

export interface SmsForm {
  content: string;
}

export interface EmailForm {
  subject: string;
  body: string;
}

export interface ParsedRecord {
  id: string;
  source: 'sms' | 'email';
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
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState('');

  const { data: pendingItems, total: pendingTotal, refetch: refetchPending } = usePaginatedList<
    ParsedTransactionPending,
    'pending'
  >({
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
  }, []);

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
    try {
      const result = await apiPost<{
        parsed: { id: string; source: 'sms' };
        suggestion: { amount: number; merchant: string; confidence: number };
      }>('/integrations/sms', data);
      await handleParseResult(result);
    } catch {
      Alert.alert('Error', 'Could not parse SMS');
    } finally {
      setSmsLoading(false);
    }
  };

  const parseEmail = async (data: EmailForm) => {
    setEmailLoading(true);
    try {
      const result = await apiPost<{
        parsed: { id: string; source: 'email' };
        suggestion: { amount: number; merchant: string; confidence: number };
      }>('/integrations/email', data);
      await handleParseResult(result);
    } catch {
      Alert.alert('Error', 'Could not parse email');
    } finally {
      setEmailLoading(false);
    }
  };

  const confirmParsed = async () => {
    if (!parsedRecord || !categoryId) {
      Alert.alert('Select Category', 'Choose a category before confirming.');
      return;
    }
    setConfirmLoading(true);
    try {
      await apiPost(`/integrations/${parsedRecord.id}/confirm`, { categoryId });
      await refetchPending();
      setSelectedId(null);
      setCategoryId('');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      Alert.alert('Expense Created', 'Transaction added from parsed content.', [
        { text: 'OK', onPress: () => router.push('/(tabs)/expenses') },
      ]);
    } catch {
      Alert.alert('Error', 'Could not create expense');
    } finally {
      setConfirmLoading(false);
    }
  };

  const rejectParsed = async () => {
    if (!parsedRecord) return;
    try {
      await apiPost(`/integrations/${parsedRecord.id}/reject`, {});
      await refetchPending();
      setSelectedId(null);
      setCategoryId('');
    } catch {
      Alert.alert('Error', 'Could not reject parsed transaction');
    }
  };

  return {
    smsLoading,
    emailLoading,
    confirmLoading,
    parsed: parsedRecord,
    pendingItems: pendingItems.map(toParsedRecord),
    pendingTotal,
    selectedId: parsedRecord?.id ?? null,
    selectPending,
    categoryId,
    setCategoryId,
    categories,
    smsForm,
    emailForm,
    parseSms,
    parseEmail,
    confirmParsed,
    rejectParsed,
  };
}
