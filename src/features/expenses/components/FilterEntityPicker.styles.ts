import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
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
    moreChipPressed: { opacity: 0.85 },
    moreChipText: {
      fontSize: 13,
      fontWeight: '600',
      color: t.colors.textSecondary,
    },
  });
}
