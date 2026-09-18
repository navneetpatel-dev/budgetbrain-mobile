import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ActionSheet, FormFieldLabel } from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { FILTER_PICKER_PREVIEW_COUNT } from '../utils/transactionFilters';
import { createStyles } from './FilterEntityPicker.styles';

export type FilterEntityOption = { id: string; label: string };

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
  const [moreOpen, setMoreOpen] = useState(false);

  const preview = options.slice(0, previewCount);
  const hasMore = options.length > previewCount;

  return (
    <View style={styles.block}>
      <FormFieldLabel>{label}</FormFieldLabel>

      <View style={styles.chipWrap}>
        <Pressable
          onPress={() => onChange(undefined)}
          style={[styles.chip, !value && styles.chipSelected]}
        >
          <Text style={[styles.chipText, !value && styles.chipTextSelected]}>{allLabel}</Text>
        </Pressable>
        {preview.map((opt) => {
          const selectedOpt = value === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => onChange(opt.id)}
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
            onPress={() => setMoreOpen(true)}
            style={({ pressed }) => [styles.moreChip, pressed && { opacity: 0.85 }]}
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
        onClose={() => setMoreOpen(false)}
        items={[
          {
            id: '__all__',
            label: allLabel,
            onPress: () => onChange(undefined),
          },
          ...options.map((opt) => ({
            id: opt.id,
            label: opt.label,
            onPress: () => onChange(opt.id),
          })),
        ]}
      />
    </View>
  );
}
