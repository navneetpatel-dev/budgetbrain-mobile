import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: {
      backgroundColor: t.colors.surfaceContainer ?? t.colors.surface,
      borderRadius: t.radii.card ?? 20,
      padding: t.spacing.lg,
      marginBottom: t.spacing.md,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
      overflow: 'hidden',
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: t.spacing.md,
    },
    iconAndTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 12,
    },
    iconPod: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.08)' : t.colors.borderSubtle,
    },
    titleCol: {
      flex: 1,
    },
    goalName: {
      ...t.typography.titleSm,
      fontWeight: '700',
      color: t.colors.text,
      letterSpacing: -0.2,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
      gap: 6,
    },
    goalType: {
      ...t.typography.caption,
      color: t.colors.textSecondary,
      textTransform: 'capitalize',
      fontSize: 12,
    },
    dotSeparator: {
      color: t.colors.textTertiary,
      fontSize: 10,
    },
    targetDateText: {
      ...t.typography.caption,
      color: t.colors.textTertiary,
      fontSize: 12,
    },
    actions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionBtn: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.05)' : t.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
    },
    metricRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: 10,
    },
    amountsCol: {
      flex: 1,
    },
    amountLabel: {
      ...t.typography.label,
      color: t.colors.textTertiary,
      fontSize: 11,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      marginBottom: 2,
    },
    currentAmount: {
      ...t.typography.amount,
      fontSize: 24,
      fontWeight: '800',
      color: t.colors.text,
      letterSpacing: -0.5,
    },
    targetAmount: {
      ...t.typography.caption,
      color: t.colors.textTertiary,
      marginTop: 2,
      fontWeight: '500',
    },
    progressBadge: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 999,
      borderWidth: 1,
    },
    progressBadgeText: {
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    trackBackground: {
      height: 7,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
      borderRadius: 999,
      overflow: 'hidden',
      marginBottom: 12,
    },
    trackFill: {
      height: '100%',
      borderRadius: 999,
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    remainingText: {
      ...t.typography.caption,
      color: t.colors.textSecondary,
      fontWeight: '500',
    },
    contributeBtn: {
      borderRadius: 10,
      overflow: 'hidden',
    },
    contributeGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: t.colors.primary + '40',
    },
    contributeText: {
      fontSize: 12,
      fontWeight: '700',
      color: t.colors.primary,
    },
  });
}
