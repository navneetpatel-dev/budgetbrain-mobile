import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    pressable: {
      flex: 1,
      minWidth: '47%',
    },
    card: {
      flex: 1,
      backgroundColor: t.colors.surface,
      borderRadius: t.radii.card,
      padding: t.spacing.md,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      ...t.shadows.sm,
      minHeight: 116,
      justifyContent: 'space-between',
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    iconPod: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    bottomBlock: {
      marginTop: 8,
      gap: 2,
    },
    title: {
      fontSize: 12,
      fontWeight: '500',
      color: t.colors.textTertiary,
    },
    amount: {
      fontSize: 20,
      fontWeight: '700',
      letterSpacing: -0.4,
      color: t.colors.text,
      fontVariant: ['tabular-nums'],
    },
    subtitle: {
      fontSize: 11,
      fontWeight: '500',
      color: t.colors.textSecondary,
      marginTop: 1,
    },
  });
}
