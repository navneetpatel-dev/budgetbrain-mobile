import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    screenWrapper: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    bentoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: t.spacing.sm,
      justifyContent: 'space-between',
    },
    budgetsList: {
      gap: t.spacing.sm,
    },
    budgetWatchCard: {
      backgroundColor: t.colors.surface,
      borderRadius: t.radii.card,
      padding: t.spacing.md,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      ...t.shadows.sm,
      gap: 10,
    },
    budgetWatchTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    budgetWatchLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
      minWidth: 0,
    },
    budgetIconPod: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    budgetWatchMeta: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    budgetWatchName: {
      fontSize: 14,
      fontWeight: '600',
      color: t.colors.text,
    },
    budgetWatchSub: {
      fontSize: 12,
      color: t.colors.textTertiary,
    },
    budgetWatchRight: {
      alignItems: 'flex-end',
    },
    budgetWatchSpent: {
      fontSize: 15,
      fontWeight: '700',
      color: t.colors.text,
      fontVariant: ['tabular-nums'],
    },
    budgetWatchLimit: {
      fontSize: 12,
      color: t.colors.textTertiary,
    },
    breakdownCard: {
      padding: 0,
      overflow: 'hidden',
      backgroundColor: t.colors.surface,
      borderRadius: t.radii.xl,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
    },
    listCard: {
      padding: 0,
      overflow: 'hidden',
      backgroundColor: t.colors.surface,
      borderRadius: t.radii.card,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
    },
    widgetRow: {
      paddingHorizontal: t.spacing.lg,
      paddingVertical: 14,
    },
    widgetRowFirst: { paddingTop: t.spacing.md },
    widgetRowLast: { paddingBottom: t.spacing.md },
    widgetDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.colors.borderSubtle,
    },
    widgetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    widgetName: {
      fontSize: 14,
      fontWeight: '600',
      color: t.colors.text,
      flex: 1,
      paddingRight: 8,
    },
    widgetPct: {
      fontSize: 12,
      fontWeight: '700',
      color: t.colors.textSecondary,
      fontVariant: ['tabular-nums'],
    },
    widgetMeta: {
      fontSize: 11,
      fontWeight: '500',
      color: t.colors.textTertiary,
      marginTop: 6,
      fontVariant: ['tabular-nums'],
    },
  });
}
