import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/theme';

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.card,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
    },
    title: {
      ...theme.typography.titleSm,
      color: theme.colors.text,
    },
    body: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
    },
    option: {
      gap: 2,
    },
    optionTitle: {
      ...theme.typography.bodySemibold,
      color: theme.colors.text,
    },
    optionDesc: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.full,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
    },
    buttonText: {
      ...theme.typography.bodySemibold,
      color: theme.colors.onPrimary,
    },
  });
}
