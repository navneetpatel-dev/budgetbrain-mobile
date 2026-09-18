import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    chipWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8,
      borderWidth: 1.5,
      borderColor: t.isDark ? 'rgba(255,255,255,0.1)' : t.colors.borderSubtle,
      borderRadius: t.radii.lg,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.04)' : t.colors.inputBg,
      paddingHorizontal: t.spacing.md,
      paddingVertical: 10,
      marginBottom: t.spacing.sm,
    },
    tagChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: t.radii.full,
      backgroundColor: t.colors.primarySoft,
    },
    tagChipText: { fontSize: 13, fontWeight: '600', color: t.colors.primary, maxWidth: 140 },
    input: { flexGrow: 1, minWidth: 100, fontSize: 14, color: t.colors.text, paddingVertical: 4 },
    suggestionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: t.spacing.lg },
    suggestionChip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: t.radii.full,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
    },
    suggestionChipText: { fontSize: 12, fontWeight: '600', color: t.colors.textSecondary },
  });
}
