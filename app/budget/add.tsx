import { useMemo } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { Button, Input, DateInput, useScrollContentStyle } from '@/src/shared/components/ui';
import { apiGet } from '@/src/shared/services/api';
import { useCreateBudget, type BudgetForm } from '@/src/features/budgets/hooks/useCreateBudget';
import { useTheme } from '@/src/shared/theme';
import { useUserCurrency } from '@/src/shared/hooks/useUserCurrency';
import type { Category } from '@/src/shared/types';

export default function AddBudgetScreen() {
  const theme = useTheme();
  const { amountLabel } = useUserCurrency();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { create, loading } = useCreateBudget();

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

  const contentStyle = useScrollContentStyle();

  return (
    <ScrollView style={styles.container} contentContainerStyle={contentStyle}>
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
          <Input label={amountLabel('Budget Amount')} value={value} onChangeText={onChange} keyboardType="numeric" error={errors.amount?.message} />
        )}
      />

      <Controller
        control={control}
        name="startDate"
        render={({ field: { onChange, value } }) => (
          <DateInput label="Start Date" value={value} onChange={onChange} />
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

      <Button title="Create Budget" onPress={handleSubmit(create)} loading={loading} />
    </ScrollView>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    label: { fontSize: 14, fontWeight: '500', color: t.colors.text, marginBottom: 8 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: t.colors.border, backgroundColor: t.colors.surface },
    chipActive: { backgroundColor: t.colors.primary, borderColor: t.colors.primary },
    chipText: { fontSize: 13, color: t.colors.text, textTransform: 'capitalize' },
    chipTextActive: { color: t.colors.onPrimary, fontWeight: '600' },
  });
}
