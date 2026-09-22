import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ActionSheet, FormFieldLabel } from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon.component';
import {
  useFilterEntityPicker,
  type FilterEntityOption,
} from '@/features/expenses/hooks/useFilterEntityPicker.hook';
import { FILTER_PICKER_PREVIEW_COUNT } from '../utils/transactionFilters';
import { useTheme } from '@/shared/theme';
import { createStyles } from './FilterEntityPicker.styles';

export type { FilterEntityOption };

interface Props {
  label: string;
  allLabel: string;
  value?: string;
  options: FilterEntityOption[];
  onChange: (id: string | undefined) => void;
  previewCount?: number;
}

export function FilterEntityPicker({
  label,
  allLabel,
  value,
  options,
  onChange,
  previewCount = FILTER_PICKER_PREVIEW_COUNT,
}: Props) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { preview, hasMore, moreOpen, openMore, closeMore, clearSelection, selectOption, sheetItems } =
    useFilterEntityPicker(options, onChange, allLabel, previewCount);

  return (
    <View style={styles.block}>
      <FormFieldLabel>{label}</FormFieldLabel>

      <View style={styles.chipWrap}>
        <Pressable
          onPress={clearSelection}
          style={[styles.chip, !value && styles.chipSelected]}
        >
          <Text style={[styles.chipText, !value && styles.chipTextSelected]}>{allLabel}</Text>
        </Pressable>
        {/* Fixed preview row (default 4 chips). Overflow opens ActionSheet. */}
        {preview.map((opt) => {
          const selectedOpt = value === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => selectOption(opt.id)}
              style={[styles.chip, selectedOpt && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selectedOpt && styles.chipTextSelected]} numberOfLines={1}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
        {hasMore ? (
          <Pressable
            onPress={openMore}
            style={({ pressed }) => [styles.moreChip, pressed && styles.moreChipPressed]}
            accessibilityRole="button"
            accessibilityLabel="More options"
          >
            <Text style={styles.moreChipText}>More</Text>
            <AppIcon name="chevronRight" size={13} color={theme.colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      <ActionSheet
        visible={moreOpen}
        title={label}
        onClose={closeMore}
        items={sheetItems}
      />
    </View>
  );
}
