import { useState, useMemo } from 'react';
import { StyleSheet, View, FlatList, Alert, Pressable, Text } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, Card, EmptyState, ScreenLoader } from '@/src/components/ui';
import { apiGet, apiPost, apiPatch } from '@/src/services/api';
import { useTheme } from '@/src/theme';
import type { Category } from '@/src/types';

interface CategoryForm {
  name: string;
  color: string;
}

const COLORS_PRESET = ['#6366F1', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export default function CategoriesScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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

  if (isLoading) {
    return <ScreenLoader />;
  }

  return (
    <View style={styles.container}>
      {showForm && (
        <Card style={styles.formCard}>
          <Controller
            control={control}
            name="name"
            rules={{ required: 'Name is required' }}
            render={({ field: { onChange, value } }) => (
              <Input label="Category Name" value={value} onChangeText={onChange} error={errors.name?.message} />
            )}
          />
          <Text style={styles.label}>Color</Text>
          <View style={styles.colorRow}>
            {COLORS_PRESET.map((c) => (
              <Pressable
                key={c}
                onPress={() => setValue('color', c)}
                style={[styles.colorDot, { backgroundColor: c }, selectedColor === c && styles.colorSelected]}
              />
            ))}
          </View>
          <Button title={editingId ? 'Update' : 'Create'} onPress={handleSubmit(onSubmit)} loading={loading} />
          <View style={styles.spacer} />
          <Button title="Cancel" onPress={() => setShowForm(false)} variant="outline" />
        </Card>
      )}

      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState title="No categories" subtitle="Create categories to organize expenses" />}
        renderItem={({ item, index }) => (
          <Card style={styles.catCard}>
            <View style={styles.catRow}>
              <View style={[styles.dot, { backgroundColor: item.color ?? theme.colors.primary }]} />
              <Text style={styles.catName}>{item.name}</Text>
              <View style={styles.actions}>
                <Pressable onPress={() => moveCategory(index, -1)}>
                  <Text style={styles.actionBtn}>↑</Text>
                </Pressable>
                <Pressable onPress={() => moveCategory(index, 1)}>
                  <Text style={styles.actionBtn}>↓</Text>
                </Pressable>
                <Pressable onPress={() => openEdit(item)}>
                  <Text style={styles.actionBtn}>Edit</Text>
                </Pressable>
                {!item.isDefault && (
                  <Pressable onPress={() => archiveCategory(item.id, item.name)}>
                    <Text style={[styles.actionBtn, styles.archive]}>Archive</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </Card>
        )}
      />

      {!showForm && (
        <Pressable style={styles.fab} onPress={openCreate}>
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      )}
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: t.colors.background },
    list: { padding: 16, paddingBottom: 80 },
    formCard: { margin: 16, marginBottom: 0 },
    label: { fontSize: 14, fontWeight: '500', color: t.colors.text, marginBottom: 8 },
    colorRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    colorDot: { width: 32, height: 32, borderRadius: 16 },
    colorSelected: { borderWidth: 3, borderColor: t.colors.text },
    catCard: { marginBottom: 8 },
    catRow: { flexDirection: 'row', alignItems: 'center' },
    dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
    catName: { flex: 1, fontSize: 15, fontWeight: '600', color: t.colors.text },
    actions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    actionBtn: { color: t.colors.primary, fontSize: 13, fontWeight: '600' },
    archive: { color: t.colors.danger },
    spacer: { height: 8 },
    fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: t.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...t.shadows.lg,
    },
    fabText: { color: t.colors.onPrimary, fontSize: 28, fontWeight: '300', marginTop: -2 },
  });
}
