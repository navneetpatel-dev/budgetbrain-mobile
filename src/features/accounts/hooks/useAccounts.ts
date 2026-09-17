import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { apiPost, apiPatch, getApiErrorMessage } from '@/shared/services/api';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import type { FinancialAccount } from '@/shared/types';

export interface AccountForm {
  name: string;
  type: 'bank' | 'credit_card' | 'cash' | 'wallet';
  institution: string;
  balance: string;
  accountNumberLast4: string;
}

export const ACCOUNT_TYPES = [
  { value: 'bank', label: 'Bank' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'wallet', label: 'Wallet' },
] as const;

export function useAccounts() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const clearSubmitError = useCallback(() => setSubmitError(null), []);

  const { data, isLoading, isRefetching, refetch } = usePaginatedList<FinancialAccount, 'accounts'>({
    queryKey: ['accounts'],
    url: '/accounts',
    itemsKey: 'accounts',
  });

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AccountForm>({
    defaultValues: { name: '', type: 'bank', institution: '', balance: '', accountNumberLast4: '' },
  });

  const accountType = watch('type');

  const openCreate = () => {
    clearSubmitError();
    reset({ name: '', type: 'bank', institution: '', balance: '', accountNumberLast4: '' });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (acc: FinancialAccount) => {
    clearSubmitError();
    reset({
      name: acc.name,
      type: acc.type,
      institution: acc.institution ?? '',
      balance: String(acc.balance),
      accountNumberLast4: acc.accountNumberLast4 ?? '',
    });
    setEditingId(acc.id);
    setShowForm(true);
  };

  const onSubmit = async (form: AccountForm) => {
    setLoading(true);
    setSubmitError(null);
    try {
      const payload = {
        name: form.name,
        type: form.type,
        institution: form.institution || undefined,
        balance: Number(form.balance),
        accountNumberLast4: form.accountNumberLast4 || undefined,
      };
      if (editingId) {
        await apiPatch(`/accounts/${editingId}`, { name: payload.name, balance: payload.balance });
      } else {
        await apiPost('/accounts', payload);
      }
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['net-worth'] });
      setShowForm(false);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not save account'));
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    isLoading,
    isRefetching,
    refetch,
    showForm,
    setShowForm,
    editingId,
    loading,
    submitError,
    clearSubmitError,
    control,
    handleSubmit,
    setValue,
    errors,
    accountType,
    openCreate,
    openEdit,
    onSubmit,
  };
}
