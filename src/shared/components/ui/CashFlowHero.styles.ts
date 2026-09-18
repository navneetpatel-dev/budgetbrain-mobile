import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: {
      backgroundColor: t.colors.surfaceContainerLow,
      borderRadius: t.radii.card,
      padding: t.spacing.lg,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      ...t.shadows.md,
      overflow: 'hidden',
      position: 'relative',
    },
    glowTopRight: {
      position: 'absolute',
      top: -30,
      right: -30,
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: t.colors.primary + '14',
    },
    glowBottomLeft: {
      position: 'absolute',
      bottom: -30,
      left: -30,
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: t.colors.secondary + '14',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: t.spacing.md,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    livePulseWrap: {
      width: 8,
      height: 8,
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    livePulseDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    title: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: t.colors.textSecondary,
    },
    netRateChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: t.radii.full,
      backgroundColor: t.colors.surfaceHover,
    },
    netRateText: {
      fontSize: 11,
      fontWeight: '700',
      color: t.colors.secondary,
    },
    metricsGrid: {
      flexDirection: 'row',
      gap: t.spacing.sm,
      marginBottom: t.spacing.md,
    },
    metricModule: {
      flex: 1,
      padding: t.spacing.sm,
      borderRadius: t.radii.md,
      backgroundColor: t.colors.surfaceContainerHigh,
      gap: 4,
    },
    metricModuleTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    moduleIconWrap: {
      width: 18,
      height: 18,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
    },
    moduleLabel: {
      fontSize: 11,
      fontWeight: '500',
      color: t.colors.textTertiary,
    },
    moduleAmount: {
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: -0.3,
      fontVariant: ['tabular-nums'],
    },
    progressContainer: {
      gap: 6,
    },
    progressBar: {
      height: 8,
      borderRadius: 4,
      backgroundColor: t.colors.surfaceHover,
      flexDirection: 'row',
      overflow: 'hidden',
    },
    progressSegmentSpent: {
      height: '100%',
    },
    progressSegmentEarned: {
      height: '100%',
    },
    progressFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    footerText: {
      fontSize: 11,
      color: t.colors.textTertiary,
    },
    boldText: {
      fontWeight: '700',
      color: t.colors.text,
    },
  });
}
