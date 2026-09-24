import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/theme';

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    chip: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.warningSoft,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.full,
      marginTop: theme.spacing.sm,
    },
    text: {
      ...theme.typography.caption,
      color: theme.colors.warning,
      fontWeight: '600',
    },
  });
}
