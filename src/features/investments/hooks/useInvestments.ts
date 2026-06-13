import { useState } from 'react';
import { Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { apiPost, apiPatch } from '@/shared/services/api';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import type { Investment } from '@/shared/types';

export interface InvestmentForm {
  name: string;
  type: 'stocks' | 'mutual_fund' | 'fd' | 'crypto' | 'gold' | 'other';
  symbol: string;
  quantity: string;
  purchasePrice: string;
  currentPrice: string;
  purchaseDate: string;
}

export const INVESTMENT_TYPES = [
  { value: 'stocks', label: 'Stocks' },
  { value: 'mutual_fund', label: 'Mutual Fund' },
  { value: 'fd', label: 'Fixed Deposit' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'gold', label: 'Gold' },
  { value: 'other', label: 'Other' },
] as const;

export function useInvestments() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data, isLoading } = usePaginatedList<Investment, 'investments'>({
    queryKey: ['investments'],
    url: '/investments',
    itemsKey: 'investments',
  });

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<InvestmentForm>({
    defaultValues: {
      name: '',
      type: 'stocks',
      symbol: '',
      quantity: '',
      purchasePrice: '',
      currentPrice: '',
      purchaseDate: new Date().toISOString().split('T')[0],
    },
  });

  const invType = watch('type');

  const openCreate = () => {
    reset({
      name: '',
      type: 'stocks',
      symbol: '',
      quantity: '',
      purchasePrice: '',
      currentPrice: '',
      purchaseDate: new Date().toISOString().split('T')[0],
    });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (inv: Investment) => {
    reset({
      name: inv.name,
      type: inv.type,
      symbol: inv.symbol ?? '',
      quantity: String(inv.quantity),
      purchasePrice: String(inv.purchasePrice),
      currentPrice: String(inv.currentPrice),
      purchaseDate: inv.purchaseDate,
    });
    setEditingId(inv.id);
    setShowForm(true);
  };

  const onSubmit = async (form: InvestmentForm) => {
    setLoading(true);
    try {
      if (editingId) {
        await apiPatch(`/investments/${editingId}`, {
          currentPrice: Number(form.currentPrice),
          quantity: Number(form.quantity),
        });
      } else {
        await apiPost('/investments', {
          name: form.name,
          type: form.type,
          symbol: form.symbol || undefined,
          quantity: Number(form.quantity),
          purchasePrice: Number(form.purchasePrice),
          currentPrice: Number(form.currentPrice) || Number(form.purchasePrice),
          purchaseDate: form.purchaseDate,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['net-worth'] });
      setShowForm(false);
    } catch {
      Alert.alert('Error', 'Could not save investment');
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    isLoading,
    showForm,
    setShowForm,
    editingId,
    loading,
    control,
    handleSubmit,
    setValue,
    errors,
    invType,
    openCreate,
    openEdit,
    onSubmit,
  };
}
