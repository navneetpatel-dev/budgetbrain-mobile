import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/theme';

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.lg,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    titleContainer: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
    title: {
      ...theme.typography.titleSm,
      color: theme.colors.text,
    },
    subtitle: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    privacyPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceContainerHighest,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.sm,
      marginTop: theme.spacing.md,
      gap: 6,
    },
    privacyText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.borderSubtle,
      marginVertical: theme.spacing.md,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.xs,
    },
    settingLabelContainer: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
    settingLabel: {
      ...theme.typography.bodyMedium,
      color: theme.colors.text,
    },
    settingDesc: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
  });
}
