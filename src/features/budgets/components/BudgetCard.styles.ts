import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    budgetCard: {
      backgroundColor: t.colors.surface,
      borderRadius: t.radii.card,
      padding: t.spacing.lg,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      ...t.shadows.sm,
      marginBottom: 0,
    },
    content: {
      gap: t.spacing.md,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    topLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
      minWidth: 0,
    },
    iconPod: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleMeta: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    budgetName: {
      fontSize: 15,
      fontWeight: '600',
      color: t.colors.text,
      letterSpacing: -0.2,
    },
    budgetSub: {
      fontSize: 12,
      color: t.colors.textTertiary,
      fontWeight: '500',
    },
    topRight: {
      alignItems: 'flex-end',
      gap: 2,
    },
    remainingAmount: {
      fontSize: 16,
      fontWeight: '700',
      color: t.colors.secondaryFixed,
      fontVariant: ['tabular-nums'],
    },
    remainingLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: t.colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.2,
    },
    progressSection: {
      gap: 6,
    },
    progressInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    progressPctText: {
      fontSize: 12,
      fontWeight: '500',
      color: t.colors.textTertiary,
    },
    thresholdText: {
      fontSize: 12,
      color: t.colors.textTertiary,
    },
    warningAlertRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: t.radii.md,
      backgroundColor: t.colors.danger + '14',
      gap: 8,
    },
    warningAlertLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flex: 1,
      minWidth: 0,
    },
    warningAlertText: {
      fontSize: 12,
      color: t.colors.danger,
      fontWeight: '500',
      flex: 1,
    },
    adjustBtn: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: t.colors.danger + '24',
    },
    adjustBtnText: {
      fontSize: 11,
      fontWeight: '700',
      color: t.colors.danger,
    },
    rolloverRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: t.radii.md,
      backgroundColor: t.colors.surfaceHover,
    },
    rolloverText: {
      fontSize: 12,
      color: t.colors.textSecondary,
      flex: 1,
    },
    rolloverAmount: {
      fontWeight: '700',
      color: t.colors.secondaryFixed,
    },
    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 4,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.colors.borderSubtle,
    },
    budgetType: {
      fontSize: 12,
      fontWeight: '500',
      color: t.colors.textTertiary,
      textTransform: 'capitalize',
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    actionIconBtn: {
      padding: 4,
    },
  });
}
