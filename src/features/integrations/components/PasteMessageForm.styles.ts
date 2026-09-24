import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/theme';

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    privacy: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
    },
  });
}
