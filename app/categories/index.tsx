import { useMemo } from 'react';
import { StyleSheet, View, FlatList, Pressable, Text } from 'react-native';
import { Controller } from 'react-hook-form';
import { Button, Input, Card, EmptyState, ScreenLoader, ScreenContainer, FormModal } from '@/src/shared/components/ui';
import { useFabBottom } from '@/src/shared/hooks/useFabBottom';
import { useTheme } from '@/src/shared/theme';
import { useCategories, COLORS_PRESET } from '@/src/features/categories/hooks/useCategories';

export default function CategoriesScreen() {
  const theme = useTheme();
  const fabBottom = useFabBottom();
  const styles = useMemo(() => createStyles(theme, fabBottom), [theme, fabBottom]);
  const {
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
  } = useCategories();

  if (isLoading) {
    return <ScreenLoader />;
  }

  return (
    <ScreenContainer>
      <FormModal visible={showForm} title={editingId ? 'Edit Category' : 'New Category'} onClose={() => setShowForm(false)}>
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
              accessibilityRole="button"
              accessibilityLabel={`Color ${c}`}
            />
          ))}
        </View>
        <Button title={editingId ? 'Update' : 'Create'} onPress={handleSubmit(onSubmit)} loading={loading} />
        <View style={styles.spacer} />
        <Button title="Cancel" onPress={() => setShowForm(false)} variant="outline" />
      </FormModal>

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
        <Pressable
          style={styles.fab}
          onPress={openCreate}
          accessibilityRole="button"
          accessibilityLabel="Add category"
        >
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      )}
    </ScreenContainer>
  );
}

function createStyles(t: ReturnType<typeof useTheme>, fabBottom: number) {
  return StyleSheet.create({
    list: { paddingTop: t.spacing.lg, paddingBottom: fabBottom + 64 },
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
      bottom: fabBottom,
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
