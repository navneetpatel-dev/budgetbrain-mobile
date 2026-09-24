import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/theme';

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    fileName: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    hint: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
    },
  });
}
