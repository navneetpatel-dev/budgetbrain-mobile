import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    pendingRow: { gap: 8, paddingBottom: 4 },
    pendingChip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: t.radii.full,
      borderWidth: 1.5,
      borderColor: t.colors.borderSubtle,
      backgroundColor: t.colors.surface,
    },
    pendingChipSelected: {
      borderColor: t.colors.primary,
      backgroundColor: t.colors.primarySoft,
    },
    pendingChipText: { ...t.typography.caption, fontWeight: '600', color: t.colors.textSecondary },
    pendingChipTextSelected: { color: t.colors.primary },
    confirmDetail: { ...t.typography.titleSm, color: t.colors.text },
    confirmMeta: { ...t.typography.caption, color: t.colors.textSecondary, marginBottom: t.spacing.sm },
  });
}
