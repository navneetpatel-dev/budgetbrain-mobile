import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    scrollContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: t.spacing.lg,
      paddingVertical: 4,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: t.radii.full,
      minHeight: 34,
    },
    chipSelected: {
      backgroundColor: t.colors.primary,
      ...t.shadows.sm,
    },
    chipUnselected: {
      backgroundColor: t.colors.surfaceContainerLow,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
    },
    chipLabel: {
      fontSize: 13,
      fontWeight: '600',
    },
    chipLabelSelected: {
      color: t.colors.onPrimary,
    },
    chipLabelUnselected: {
      color: t.colors.textSecondary,
    },
    dot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
  });
}
