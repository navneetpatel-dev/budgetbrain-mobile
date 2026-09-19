import { useMemo } from 'react';
import { RefreshControl, View, Pressable, Text } from 'react-native';
import { Controller } from 'react-hook-form';
import {
  Input,
  Card,
  EmptyState,
  ListRowsSkeleton,
  FormModal,
  StickyHeaderFlatScreen,
  ActionFab,
  ColorPicker,
  FormActions,
  FormErrorBanner,
  FilterChipsRail,
} from '@/shared/components/ui';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useFabBottom } from '@/shared/hooks/useFabBottom';
import { useTheme } from '@/shared/theme';
import { useCategories, COLORS_PRESET } from '@/features/categories/hooks/useCategories';
import { maxLen, textRules } from '@/shared/validation/fieldLimits';
import { createStyles } from './CategoriesScreen.styles';

export function CategoriesScreen() {
  const theme = useTheme();
  const fabBottom = useFabBottom();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const {
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
    moveCategory,
  } = useCategories();

  const items = data ?? [];

  return (
    <View style={styles.root}>
      <FormModal
        visible={showForm}
        title={editingId ? 'Edit Category' : 'New Category'}
        subtitle="Pick a name and color"
        onClose={() => setShowForm(false)}
        footer={
          <FormActions
            primaryTitle={editingId ? 'Update' : 'Create'}
            onPrimary={handleSubmit(onSubmit)}
            primaryLoading={loading}
            secondaryTitle="Cancel"
            onSecondary={() => setShowForm(false)}
          />
        }
      >
        {submitError ? <FormErrorBanner message={submitError} /> : null}
        <Controller
          control={control}
          name="name"
          rules={textRules('categoryName')}
          render={({ field: { onChange, value } }) => (
            <Input label="Category name" value={value} onChangeText={onChange} maxLength={maxLen('categoryName')} error={errors.name?.message} leftIcon="category" placeholder="e.g. Food, Travel" disabled={loading} />
          )}
        />
        <ColorPicker
          label="Color"
          colors={COLORS_PRESET}
          value={selectedColor}
          onChange={(c) => setValue('color', c)}
          disabled={loading}
        />
      </FormModal>

      <StickyHeaderFlatScreen
        inset="stack"
        header={
          <ProfileStackHeader
            screen="categories"
            subtitle={isLoading ? 'Loading…' : `${items.length} categor${items.length !== 1 ? 'ies' : 'y'}`}
          />
        }
        data={isLoading ? [] : items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: fabBottom + 72 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={theme.colors.primary} />}
        ListHeaderComponent={
          <View style={{ gap: 10, paddingHorizontal: 16, paddingVertical: 10 }}>
            {listError ? <FormErrorBanner message={listError} /> : null}
            <FilterChipsRail
              chips={[
                { id: 'active', label: 'Active Categories' },
                { id: 'all', label: 'Include Archived' },
              ]}
              selectedId={showArchived ? 'all' : 'active'}
              onSelect={(id) => setShowArchived(id === 'all')}
              style={{ paddingHorizontal: 0 }}
            />
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <ListRowsSkeleton count={5} variant="category" />
          ) : (
            <EmptyState icon="category" title="No categories" subtitle="Create categories to organize expenses" action="Add category" onAction={openCreate} />
          )
        }
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => (item.archivedAt ? undefined : openEdit(item))}
            accessibilityRole="button"
            accessibilityLabel={`Category ${item.name}`}
          >
            <Card style={styles.catCard}>
              <View style={styles.catRow}>
                <View style={[styles.dot, { backgroundColor: item.color ?? theme.colors.primary }]} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.catName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.archivedAt && (
                    <Text style={{ ...theme.typography.caption, fontSize: 11, color: theme.colors.textTertiary }}>
                      Archived
                    </Text>
                  )}
                </View>
                <View style={styles.actions}>
                  {item.archivedAt ? (
                    <Pressable
                      onPress={() => void unarchiveCategory(item.id)}
                      style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
                      accessibilityRole="button"
                      accessibilityLabel={`Unarchive ${item.name}`}
                      hitSlop={4}
                    >
                      <AppIcon name="refresh" size={18} color={theme.colors.success} />
                    </Pressable>
                  ) : (
                    <>
                      <Pressable
                        onPress={() => moveCategory(index, -1)}
                        style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
                        accessibilityRole="button"
                        accessibilityLabel={`Move ${item.name} up`}
                        hitSlop={4}
                      >
                        <AppIcon name="arrowUp" size={18} color={theme.colors.primary} />
                      </Pressable>
                      <Pressable
                        onPress={() => moveCategory(index, 1)}
                        style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
                        accessibilityRole="button"
                        accessibilityLabel={`Move ${item.name} down`}
                        hitSlop={4}
                      >
                        <AppIcon name="arrowDown" size={18} color={theme.colors.primary} />
                      </Pressable>
                      <Pressable
                        onPress={() => openEdit(item)}
                        style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
                        accessibilityRole="button"
                        accessibilityLabel={`Edit ${item.name}`}
                        hitSlop={4}
                      >
                        <AppIcon name="edit" size={17} color={theme.colors.primary} />
                      </Pressable>
                      {!item.isDefault && (
                        <Pressable
                          onPress={() => archiveCategory(item.id, item.name)}
                          style={({ pressed }) => [styles.iconBtnDanger, pressed && styles.iconBtnPressed]}
                          accessibilityRole="button"
                          accessibilityLabel={`Archive ${item.name}`}
                          hitSlop={4}
                        >
                          <AppIcon name="trash" size={16} color={theme.colors.danger} />
                        </Pressable>
                      )}
                    </>
                  )}
                </View>
              </View>
            </Card>
          </Pressable>
        )}
      />

      {!showForm && <ActionFab onPress={openCreate} label="Add category" />}
    </View>
  );
}

