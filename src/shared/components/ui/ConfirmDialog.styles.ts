import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/theme';

export function createStyles(t: AppTheme) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: t.spacing.xl,
      backgroundColor: t.colors.overlay,
    },
    cardWrap: {
      width: '100%',
      maxWidth: 420,
    },
    card: {
      width: '100%',
      maxWidth: 420,
      padding: t.spacing.xl,
      borderWidth: 1,
      backgroundColor: t.colors.surface,
      borderRadius: t.radii.xl,
      borderColor: t.colors.borderSubtle,
      ...t.shadows.lg,
    },
    title: { ...t.typography.titleSm, color: t.colors.text },
    message: {
      ...t.typography.bodyMedium,
      color: t.colors.textSecondary,
      marginTop: t.spacing.md,
      marginBottom: t.spacing.lg,
    },
    actions: { gap: t.spacing.sm },
  });
}
