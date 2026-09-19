import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { apiPost, apiPatch, getApiErrorMessage } from '@/shared/services/api';
import { invalidateCategoryConsumers } from '@/shared/services/queryInvalidation';
import { CONFIRM } from '@/shared/constants/confirmations';
import { showConfirmation } from '@/shared/utils/confirmations';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import type { Category } from '@/shared/types';

export interface CategoryForm {
  name: string;
  color: string;
}

export const COLORS_PRESET = ['#6366F1', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export function useCategories() {
  const queryClient = useQueryClient();
  const [showArchived, setShowArchived] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const clearSubmitError = useCallback(() => setSubmitError(null), []);
  const clearListError = useCallback(() => setListError(null), []);

  const { data, isLoading, isRefetching, refetch } = usePaginatedList<Category, 'categories'>({
    queryKey: ['categories', showArchived ? 'all' : 'active'],
    url: showArchived ? '/categories?includeArchived=true' : '/categories',
    itemsKey: 'categories',
  });

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CategoryForm>({
    defaultValues: { name: '', color: COLORS_PRESET[0] },
  });

  const selectedColor = watch('color');

  const openCreate = () => {
    clearSubmitError();
    reset({ name: '', color: COLORS_PRESET[0] });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    clearSubmitError();
    reset({ name: cat.name, color: cat.color ?? COLORS_PRESET[0] });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const onSubmit = async (form: CategoryForm) => {
    setLoading(true);
    setSubmitError(null);
    try {
      if (editingId) {
        await apiPatch(`/categories/${editingId}`, form);
      } else {
        await apiPost('/categories', form);
      }
      invalidateCategoryConsumers(queryClient);
      setShowForm(false);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not save category'));
    } finally {
      setLoading(false);
    }
  };

  const archiveCategory = (id: string, name: string) => {
    showConfirmation(CONFIRM.archiveCategory(name), async () => {
      setListError(null);
      try {
        await apiPost(`/categories/${id}/archive`);
        invalidateCategoryConsumers(queryClient);
      } catch (err) {
        setListError(getApiErrorMessage(err, 'Could not archive category'));
      }
    });
  };

  const unarchiveCategory = async (id: string) => {
    setListError(null);
    try {
      await apiPost(`/categories/${id}/unarchive`);
      invalidateCategoryConsumers(queryClient);
    } catch (err) {
      setListError(getApiErrorMessage(err, 'Could not unarchive category'));
    }
  };

  const reorderAll = async (ordered: Category[]) => {
    setListError(null);
    try {
      await apiPost('/categories/reorder', { orderedIds: ordered.map((c) => c.id) });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch (err) {
      setListError(getApiErrorMessage(err, 'Could not reorder categories'));
      // Refetch to snap back to the server's real order after a failed reorder,
      // since the draggable list already optimistically reflects the drag result.
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  };

  return {
    data,
    isLoading,
    isRefetching,
    refetch,
    showArchived,
    setShowArchived,
    editingId,
    showForm,
    setShowForm,
    loading,
    submitError,
    listError,
    clearSubmitError,
    clearListError,
    control,
    handleSubmit,
    setValue,
    errors,
    selectedColor,
    openCreate,
    openEdit,
    onSubmit,
    archiveCategory,
    unarchiveCategory,
    reorderAll,
  };
}
