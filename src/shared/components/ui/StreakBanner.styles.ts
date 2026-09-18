import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: {
      borderRadius: t.radii.card,
      padding: t.spacing.md,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      ...t.shadows.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.md,
    },
    flameBox: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: t.colors.warning + '24',
      alignItems: 'center',
      justifyContent: 'center',
    },
    flameEmoji: {
      fontSize: 22,
    },
    content: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 6,
    },
    title: {
      fontSize: 14,
      fontWeight: '700',
      color: t.colors.text,
      flex: 1,
    },
    tierPill: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: t.radii.full,
      backgroundColor: t.colors.warning + '20',
    },
    tierText: {
      fontSize: 10,
      fontWeight: '700',
      color: t.colors.warning,
      textTransform: 'uppercase',
    },
    subtitle: {
      fontSize: 12,
      color: t.colors.textSecondary,
      fontWeight: '400',
    },
  });
}
