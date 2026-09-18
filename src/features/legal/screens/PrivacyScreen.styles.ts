import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    section: { ...t.typography.titleSm, color: t.colors.text, marginTop: t.spacing.sm, marginBottom: t.spacing.sm },
    body: { ...t.typography.bodyMedium, color: t.colors.textSecondary },
  });
}
