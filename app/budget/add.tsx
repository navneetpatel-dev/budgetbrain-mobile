import { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, Alert, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Input } from '@/src/components/ui';
import { apiGet, apiPost } from '@/src/services/api';
import { useTheme } from '@/src/theme';
import type { Budget, Category } from '@/src/types';

interface BudgetForm {
  name: string;
  type: 'monthly' | 'weekly' | 'category';
  amount: string;
  categoryId: string;
  startDate: string;
  alertThreshold: string;
}

export default function AddBudgetScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiGet<Category[]>('/categories'),
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<BudgetForm>({
    defaultValues: {
      name: '',
      type: 'monthly',
      amount: '',
      categoryId: '',
      startDate: monthStart,
      alertThreshold: '80',
    },
  });

  const budgetType = watch('type');
  const selectedCategory = watch('categoryId');

  const onSubmit = async (data: BudgetForm) => {
    if (data.type === 'category' && !data.categoryId) {
      Alert.alert('Category Required', 'Select a category for category budgets');
      return;
    }
    setLoading(true);
    try {
      await apiPost<Budget>('/budgets', {
        name: data.name,
        type: data.type,
        amount: Number(data.amount),
        categoryId: data.type === 'category' ? data.categoryId : undefined,
        startDate: data.startDate,
        alertThreshold: Number(data.alertThreshold),
      });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.back();
    } catch {
      Alert.alert('Error', 'Could not create budget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Controller
        control={control}
        name="name"
        rules={{ required: 'Name is required' }}
        render={({ field: { onChange, value } }) => (
          <Input label="Budget Name" value={value} onChangeText={onChange} error={errors.name?.message} />
        )}
      />

      <Text style={styles.label}>Budget Type</Text>
      <View style={styles.chipRow}>
        {(['monthly', 'weekly', 'category'] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setValue('type', t)}
            style={[styles.chip, budgetType === t && styles.chipActive]}
          >
            <Text style={[styles.chipText, budgetType === t && styles.chipTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <Controller
        control={control}
        name="amount"
        rules={{ required: 'Amount is required' }}
        render={({ field: { onChange, value } }) => (
          <Input label="Budget Amount (₹)" value={value} onChangeText={onChange} keyboardType="numeric" error={errors.amount?.message} />
        )}
      />

      <Controller
        control={control}
        name="startDate"
        render={({ field: { onChange, value } }) => (
          <Input label="Start Date (YYYY-MM-DD)" value={value} onChangeText={onChange} />
        )}
      />

      <Controller
        control={control}
        name="alertThreshold"
        render={({ field: { onChange, value } }) => (
          <Input label="Alert Threshold (%)" value={value} onChangeText={onChange} keyboardType="numeric" />
        )}
      />

      {budgetType === 'category' && (
        <>
          <Text style={styles.label}>Category</Text>
          <View style={styles.chipRow}>
            {categories?.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setValue('categoryId', cat.id)}
                style={[styles.chip, selectedCategory === cat.id && { backgroundColor: cat.color ?? theme.colors.primary, borderColor: cat.color ?? theme.colors.primary }]}
              >
                <Text style={[styles.chipText, selectedCategory === cat.id && styles.chipTextActive]}>{cat.name}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <Button title="Create Budget" onPress={handleSubmit(onSubmit)} loading={loading} />
    </ScrollView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    content: { padding: 16 },
    label: { fontSize: 14, fontWeight: '500', color: t.colors.text, marginBottom: 8 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface, textTransform: 'capitalize' },
    chipActive: { backgroundColor: t.colors.primary, borderColor: t.colors.primary },
    chipText: { fontSize: 13, color: t.colors.text, textTransform: 'capitalize' },
    chipTextActive: { color: t.colors.onPrimary, fontWeight: '600' },
  });
}
