import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/theme';

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      paddingBottom: theme.spacing.xxl,
    },
    section: {
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    sectionTitle: {
      ...theme.typography.titleSm,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
      marginLeft: theme.spacing.xs,
      textTransform: 'uppercase',
      fontSize: 12,
      letterSpacing: 0.5,
    },
    cardGroup: {
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.radii.lg,
      borderWidth: 1,
      borderColor: theme.colors.borderSubtle,
      overflow: 'hidden',
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
    },
    actionRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderSubtle,
    },
    actionTextContainer: {
      flex: 1,
    },
    actionTitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.text,
    },
    actionSubtitle: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      marginTop: 2,
    },
    actionBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: theme.radii.full,
      marginRight: theme.spacing.xs,
    },
    actionBadgeText: {
      color: theme.colors.onPrimary,
      fontSize: 11,
      fontWeight: '700',
    },
    actionDanger: {
      ...theme.typography.caption,
      color: theme.colors.danger,
      marginTop: 2,
    },
    chevron: {
      ...theme.typography.body,
      color: theme.colors.textTertiary,
    },
  });
}
