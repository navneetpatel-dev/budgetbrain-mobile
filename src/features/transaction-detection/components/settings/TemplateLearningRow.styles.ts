import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/theme';

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderSubtle,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      ...theme.typography.bodyMedium,
      color: theme.colors.text,
    },
    subtitle: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
  });
}
