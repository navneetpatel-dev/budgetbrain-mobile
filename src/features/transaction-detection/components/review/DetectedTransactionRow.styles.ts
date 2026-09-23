import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/theme';

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    merchantInfo: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    merchantName: {
      ...theme.typography.titleSm,
      color: theme.colors.text,
    },
    accountInfo: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    amountContainer: {
      alignItems: 'flex-end',
    },
    amountText: {
      ...theme.typography.amount,
    },
    debitAmount: {
      color: theme.colors.text,
    },
    creditAmount: {
      color: theme.colors.success,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing.sm,
      paddingTop: theme.spacing.xs,
      borderTopWidth: 1,
      borderTopColor: theme.colors.borderSubtle,
    },
    tagGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      flexWrap: 'wrap',
    },
    categoryPill: {
      backgroundColor: theme.colors.surfaceContainerHighest,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: theme.radii.sm,
    },
    categoryText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    confidencePill: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: theme.radii.sm,
    },
    confidenceHigh: {
      backgroundColor: theme.colors.successSoft,
    },
    confidenceHighText: {
      color: theme.colors.success,
      fontSize: 10,
      fontWeight: '600',
    },
    confidenceMedium: {
      backgroundColor: theme.colors.warningSoft,
    },
    confidenceMediumText: {
      color: theme.colors.warning,
      fontSize: 10,
      fontWeight: '600',
    },
    confidenceLow: {
      backgroundColor: theme.colors.dangerSoft,
    },
    confidenceLowText: {
      color: theme.colors.danger,
      fontSize: 10,
      fontWeight: '600',
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    dismissButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.full,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
    },
    dismissText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    confirmButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.primary,
    },
    confirmText: {
      ...theme.typography.caption,
      color: theme.colors.onPrimary,
      fontWeight: '600',
    },
  });
}
