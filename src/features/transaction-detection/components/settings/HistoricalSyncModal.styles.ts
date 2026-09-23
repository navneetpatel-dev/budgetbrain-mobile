import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/theme';

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    modalContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      padding: theme.spacing.xl,
      width: '100%',
      maxWidth: 400,
    },
    title: {
      ...theme.typography.title,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    rangeOptions: {
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    rangeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
      borderRadius: theme.radii.lg,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
      backgroundColor: theme.colors.surfaceContainerLow,
    },
    rangeOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryContainer || '#EEF2FF',
    },
    rangeOptionText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.text,
    },
    rangeOptionSubtext: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
    },
    progressSection: {
      marginVertical: theme.spacing.lg,
      alignItems: 'center',
    },
    progressBarTrack: {
      width: '100%',
      height: 8,
      backgroundColor: theme.colors.surfaceContainerHighest,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: theme.spacing.sm,
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 4,
    },
    progressText: {
      ...theme.typography.bodySemibold,
      color: theme.colors.text,
      marginTop: theme.spacing.xs,
    },
    progressDetail: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    buttonContainer: {
      gap: theme.spacing.sm,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.lg,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
    },
    primaryButtonText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.onPrimary,
      fontWeight: '600',
    },
    secondaryButton: {
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
    },
    secondaryButtonText: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
    },
  });
}
