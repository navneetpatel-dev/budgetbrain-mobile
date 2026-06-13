import { useState } from 'react';
import { Alert } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { apiGet, apiPost, apiPatch } from '@/src/shared/services/api';
import type { Category } from '@/src/shared/types';

export interface CategoryForm {
  name: string;
  color: string;
}

export const COLORS_PRESET = ['#6366F1', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export function useCategories() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiGet<Category[]>('/categories'),
  });

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CategoryForm>({
    defaultValues: { name: '', color: COLORS_PRESET[0] },
  });

  const selectedColor = watch('color');

  const openCreate = () => {
    reset({ name: '', color: COLORS_PRESET[0] });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    reset({ name: cat.name, color: cat.color ?? COLORS_PRESET[0] });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const onSubmit = async (form: CategoryForm) => {
    setLoading(true);
    try {
      if (editingId) {
        await apiPatch(`/categories/${editingId}`, form);
      } else {
        await apiPost('/categories', form);
      }
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowForm(false);
    } catch {
      Alert.alert('Error', 'Could not save category');
    } finally {
      setLoading(false);
    }
  };

  const archiveCategory = (id: string, name: string) => {
    Alert.alert('Archive Category', `Archive "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiPost(`/categories/${id}/archive`);
            queryClient.invalidateQueries({ queryKey: ['categories'] });
          } catch {
            Alert.alert('Error', 'Could not archive category');
          }
        },
      },
    ]);
  };

  const moveCategory = async (index: number, direction: -1 | 1) => {
    if (!data) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= data.length) return;
    const ordered = [...data];
    const [item] = ordered.splice(index, 1);
    ordered.splice(newIndex, 0, item);
    try {
      await apiPost('/categories/reorder', { orderedIds: ordered.map((c) => c.id) });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch {
      Alert.alert('Error', 'Could not reorder categories');
    }
  };

  return {
    data,
    isLoading,
    editingId,
    showForm,
    setShowForm,
    loading,
    control,
    handleSubmit,
    setValue,
    errors,
    selectedColor,
    openCreate,
    openEdit,
    onSubmit,
    archiveCategory,
    moveCategory,
  };
}
