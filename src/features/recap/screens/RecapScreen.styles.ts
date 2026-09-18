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
      paddingBottom: 80,
    },
    heroCard: {
      position: 'relative',
      backgroundColor: t.colors.surfaceContainer ?? t.colors.surface,
      borderRadius: t.radii.card ?? 20,
      alignItems: 'center',
      paddingVertical: 28,
      paddingHorizontal: 20,
      marginBottom: t.spacing.lg,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
      overflow: 'hidden',
    },
    heroIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.isDark ? 'rgba(14, 165, 233, 0.15)' : 'rgba(14, 165, 233, 0.2)',
      marginBottom: 12,
    },
    heroLabel: {
      ...t.typography.caption,
      fontWeight: '600',
      color: t.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      fontSize: 11,
    },
    heroAmount: {
      ...t.typography.amountLg,
      color: t.colors.text,
      fontSize: 34,
      fontWeight: '800',
      marginTop: 6,
      marginBottom: 12,
    },
    streakPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: t.isDark ? 'rgba(78, 222, 163, 0.12)' : t.colors.secondaryContainer,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(78, 222, 163, 0.25)' : 'transparent',
    },
    streakText: {
      fontSize: 12,
      color: t.colors.textSecondary,
      fontWeight: '500',
    },
    sectionHeader: {
      marginBottom: 10,
    },
    sectionTitle: {
      ...t.typography.titleSm,
      fontSize: 17,
      fontWeight: '700',
      color: t.colors.text,
    },
    grid: {
      gap: 12,
      marginBottom: t.spacing.xl,
    },
    cardItem: {
      marginBottom: 0,
    },
    ctaWrap: {
      marginTop: t.spacing.sm,
    },
    shareBtnWrap: {
      borderRadius: 14,
      overflow: 'hidden',
    },
    shareBtnGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      paddingHorizontal: 20,
    },
    shareBtnText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: -0.2,
    },
  });
}
