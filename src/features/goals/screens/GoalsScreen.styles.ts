import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    screenWrapper: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    headerAddBtn: {
      borderRadius: 12,
      overflow: 'hidden',
    },
    headerAddGradient: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    listContent: {
      paddingHorizontal: t.spacing.lg,
      paddingTop: t.spacing.md,
    },
    headerBlock: {
      marginBottom: t.spacing.md,
    },
    radialGaugeCard: {
      position: 'relative',
      backgroundColor: t.colors.surfaceContainer ?? t.colors.surface,
      borderRadius: t.radii.card ?? 20,
      padding: 18,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
      overflow: 'hidden',
      marginBottom: t.spacing.md,
    },
    glowTopRight: {
      position: 'absolute',
      top: -30,
      right: -30,
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: 'rgba(78, 222, 163, 0.08)',
    },
    glowBottomLeft: {
      position: 'absolute',
      bottom: -30,
      left: -30,
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: 'rgba(14, 165, 233, 0.06)',
    },
    gaugeHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    gaugeTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    gaugeTitle: {
      ...t.typography.bodySemibold,
      color: t.colors.text,
      fontSize: 15,
      fontWeight: '700',
    },
    statusTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: t.isDark ? 'rgba(78, 222, 163, 0.12)' : t.colors.secondaryContainer,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(78, 222, 163, 0.3)' : 'transparent',
    },
    pulseDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusTagText: {
      fontSize: 11,
      fontWeight: '700',
      color: t.colors.secondary,
    },
    gaugeBodyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    metricsCol: {
      flex: 1,
      justifyContent: 'center',
    },
    savedLabel: {
      ...t.typography.label,
      color: t.colors.textTertiary,
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    savedAmount: {
      ...t.typography.amount,
      fontSize: 26,
      fontWeight: '800',
      color: t.colors.text,
      letterSpacing: -0.6,
      marginVertical: 2,
    },
    targetLabel: {
      ...t.typography.caption,
      color: t.colors.textTertiary,
      fontWeight: '500',
      marginBottom: 10,
    },
    ratePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: t.isDark ? 'rgba(78, 222, 163, 0.08)' : 'rgba(78, 222, 163, 0.15)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    rateText: {
      fontSize: 12,
      fontWeight: '500',
      color: t.colors.textSecondary,
    },
    rateHighlight: {
      fontWeight: '700',
      color: t.colors.secondary,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: t.spacing.md,
      marginBottom: t.spacing.xs,
    },
    sectionTitle: {
      ...t.typography.titleSm,
      fontSize: 17,
      fontWeight: '700',
      color: t.colors.text,
    },
    sectionCount: {
      ...t.typography.caption,
      color: t.colors.textTertiary,
      fontWeight: '600',
    },
    footerWrap: {
      marginTop: t.spacing.md,
    },
    createBtnWrap: {
      borderRadius: 14,
      overflow: 'hidden',
    },
    createBtnGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      paddingHorizontal: 20,
    },
    createBtnText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: -0.2,
    },
  });
}
