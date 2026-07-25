import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionSheet, FormFieldLabel } from '@/shared/components/ui';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { FILTER_PICKER_PREVIEW_COUNT } from '../utils/transactionFilters';

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

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    block: { gap: 8 },
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: t.radii.lg,
      borderWidth: 1.5,
      borderColor: t.isDark ? 'rgba(255,255,255,0.12)' : t.colors.borderSubtle,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.05)' : t.colors.surface,
      maxWidth: '100%',
    },
    chipSelected: {
      borderColor: t.colors.primary,
      backgroundColor: t.colors.primary + '22',
    },
    chipText: { fontSize: 13, fontWeight: '600', color: t.colors.text },
    // Keep weight constant — boldening selected text shifts wrap layout.
    chipTextSelected: { color: t.colors.primary },
    // Neutral action — not a selected filter chip.
    moreChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: t.radii.lg,
      borderWidth: 0,
      backgroundColor: 'transparent',
    },
    moreChipText: {
      fontSize: 13,
      fontWeight: '600',
      color: t.colors.textSecondary,
    },
  });
}
