import { useState } from 'react';
import { Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { apiPost, apiGet } from '@/shared/services/api';
import type { Category } from '@/shared/types';

export interface SmsForm {
  content: string;
}

export interface EmailForm {
  subject: string;
  body: string;
}

export interface ParsedRecord {
  id: string;
  parsedAmount: number;
  parsedMerchant: string | null;
  confidence: number;
}

export function useTransactionParsing() {
  const router = useRouter();
  const [smsLoading, setSmsLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [parsed, setParsed] = useState<ParsedRecord | null>(null);
  const [categoryId, setCategoryId] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiGet<Category[]>('/categories'),
  });

  const smsForm = useForm<SmsForm>({ defaultValues: { content: '' } });
  const emailForm = useForm<EmailForm>({ defaultValues: { subject: '', body: '' } });

  const handleParseResult = (result: { parsed: ParsedRecord; suggestion: { amount: number; merchant: string; confidence: number } }) => {
    setParsed({
      id: result.parsed.id,
      parsedAmount: Number(result.suggestion.amount),
      parsedMerchant: result.suggestion.merchant,
      confidence: result.suggestion.confidence,
    });
    setCategoryId('');
  };

  const parseSms = async (data: SmsForm) => {
    setSmsLoading(true);
    setParsed(null);
    try {
      const result = await apiPost<{ parsed: ParsedRecord; suggestion: { amount: number; merchant: string; confidence: number } }>(
        '/integrations/sms',
        data
      );
      handleParseResult(result);
    } catch {
      Alert.alert('Error', 'Could not parse SMS');
    } finally {
      setSmsLoading(false);
    }
  };

  const parseEmail = async (data: EmailForm) => {
    setEmailLoading(true);
    setParsed(null);
    try {
      const result = await apiPost<{ parsed: ParsedRecord; suggestion: { amount: number; merchant: string; confidence: number } }>(
        '/integrations/email',
        data
      );
      handleParseResult(result);
    } catch {
      Alert.alert('Error', 'Could not parse email');
    } finally {
      setEmailLoading(false);
    }
  };

  const confirmParsed = async () => {
    if (!parsed || !categoryId) {
      Alert.alert('Select Category', 'Choose a category before confirming.');
      return;
    }
    setConfirmLoading(true);
    try {
      await apiPost(`/integrations/${parsed.id}/confirm`, { categoryId });
      Alert.alert('Expense Created', 'Transaction added from parsed content.', [
        { text: 'OK', onPress: () => router.push('/(tabs)/expenses') },
      ]);
      setParsed(null);
    } catch {
      Alert.alert('Error', 'Could not create expense');
    } finally {
      setConfirmLoading(false);
    }
  };

  const rejectParsed = async () => {
    if (!parsed) return;
    try {
      await apiPost(`/integrations/${parsed.id}/reject`, {});
      setParsed(null);
    } catch {
      Alert.alert('Error', 'Could not reject parsed transaction');
    }
  };

  return {
    smsLoading,
    emailLoading,
    confirmLoading,
    parsed,
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
