import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    scrollContent: {
      paddingHorizontal: t.spacing.lg,
      paddingTop: t.spacing.md,
    },
    heroCard: {
      position: 'relative',
      backgroundColor: t.colors.surfaceContainer ?? t.colors.surface,
      borderRadius: t.radii.card ?? 20,
      padding: 22,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
      overflow: 'hidden',
      marginBottom: t.spacing.md,
    },
    heroGlowCircle: {
      position: 'absolute',
      top: -40,
      right: -40,
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: 'rgba(14, 165, 233, 0.08)',
    },
    heroHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    heroTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    heroIconPod: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: t.isDark ? 'rgba(14, 165, 233, 0.15)' : 'rgba(14, 165, 233, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroLabel: {
      ...t.typography.label,
      color: t.colors.textSecondary,
      fontSize: 13,
      fontWeight: '600',
    },
    equityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: t.isDark ? 'rgba(78, 222, 163, 0.12)' : t.colors.secondaryContainer,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(78, 222, 163, 0.25)' : 'transparent',
    },
    equityDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: t.colors.secondary,
    },
    equityBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: t.colors.secondary,
    },
    heroValue: {
      fontSize: 34,
      fontWeight: '800',
      color: t.colors.text,
      letterSpacing: -1,
      lineHeight: 42,
      marginVertical: 6,
    },
    macroWrap: {
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
    },
    macroHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    macroLabel: {
      ...t.typography.caption,
      color: t.colors.textTertiary,
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    macroDetail: {
      ...t.typography.caption,
      color: t.colors.textSecondary,
      fontSize: 11,
      fontWeight: '500',
    },
    gridRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
    },
    gridCol: {
      flex: 1,
    },
    metricBento: {
      marginBottom: 0,
    },
    holdingsSection: {
      marginTop: t.spacing.sm,
      gap: t.spacing.md,
    },
  });
}
