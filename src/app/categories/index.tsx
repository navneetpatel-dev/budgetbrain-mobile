import { useMemo } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { Controller } from 'react-hook-form';
import {
  Button,
  Input,
  Card,
  EmptyState,
  ScreenLoader,
  FormModal,
  StickyHeaderFlatScreen,
  ActionFab,
  FormFieldLabel,
} from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { useFabBottom } from '@/shared/hooks/useFabBottom';
import { useTheme } from '@/shared/theme';
import { useCategories, COLORS_PRESET } from '@/features/categories/hooks/useCategories';

export default function CategoriesScreen() {
  const theme = useTheme();
  const fabBottom = useFabBottom();
  const styles = useMemo(() => createStyles(theme), [theme]);
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

  const items = data ?? [];

  return (
    <View style={styles.root}>
      <FormModal visible={showForm} title={editingId ? 'Edit Category' : 'New Category'} onClose={() => setShowForm(false)}>
        <Controller
          control={control}
          name="name"
          rules={{ required: 'Name is required' }}
          render={({ field: { onChange, value } }) => (
            <Input label="Category Name" value={value} onChangeText={onChange} error={errors.name?.message} />
          )}
        />
        <FormFieldLabel>Color</FormFieldLabel>
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

      <StickyHeaderFlatScreen
        inset="stack"
        header={
          <ProfileStackHeader
            screen="categories"
            subtitle={`${items.length} categor${items.length !== 1 ? 'ies' : 'y'}`}
          />
        }
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: fabBottom + 72 }}
        ListEmptyComponent={
          <EmptyState icon="category" title="No categories" subtitle="Create categories to organize expenses" action="Add category" onAction={openCreate} />
        }
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

      {!showForm && <ActionFab onPress={openCreate} label="Add category" />}
    </View>
  );
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: t.colors.background },
    colorRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    colorDot: { width: 32, height: 32, borderRadius: 16 },
    colorSelected: { borderWidth: 3, borderColor: t.colors.text },
    catCard: { marginBottom: 0 },
    catRow: { flexDirection: 'row', alignItems: 'center' },
    dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
    catName: { flex: 1, fontSize: 15, fontWeight: '600', color: t.colors.text },
    actions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    actionBtn: { color: t.colors.primary, fontSize: 13, fontWeight: '600' },
    archive: { color: t.colors.danger },
    spacer: { height: 8 },
  });
}
