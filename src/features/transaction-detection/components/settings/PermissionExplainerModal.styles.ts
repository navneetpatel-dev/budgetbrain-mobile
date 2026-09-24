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
      maxHeight: '90%',
    },
    iconHeader: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primaryContainer || '#EEF2FF',
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginBottom: theme.spacing.md,
    },
    iconText: {
      fontSize: 28,
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
    bulletScroll: {
      flexGrow: 0,
      flexShrink: 1,
    },
    bulletList: {
      gap: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    bulletItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
    },
    bulletIcon: {
      fontSize: 16,
      marginTop: 2,
    },
    bulletTextContainer: {
      flex: 1,
    },
    bulletTitle: {
      ...theme.typography.bodySemibold,
      color: theme.colors.text,
    },
    bulletDesc: {
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
