import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/theme';

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      backgroundColor: theme.colors.surfaceContainerHighest,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.radii.full,
    },
    chipLinked: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
    },
    label: {
      ...theme.typography.caption,
      color: theme.colors.text,
    },
    remove: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textTertiary,
    },
  });
}
