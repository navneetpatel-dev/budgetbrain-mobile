import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(
  t: ReturnType<typeof useTheme>,
  horizontalPadding: number,
  footerBottom: number,
) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: t.colors.background,
    },
    flex: { flex: 1 },
    newChatBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: t.isDark ? 'rgba(14, 165, 233, 0.12)' : t.colors.primarySoft,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: t.colors.primary + '33',
    },
    newChatText: {
      fontSize: 12,
      fontWeight: '700',
      color: t.colors.primary,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: horizontalPadding,
      paddingTop: t.spacing.md,
      paddingBottom: footerBottom + 80,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      paddingVertical: t.spacing.xl,
    },
    heroAuraCard: {
      position: 'relative',
      backgroundColor: t.colors.surfaceContainer ?? t.colors.surface,
      borderRadius: t.radii.card ?? 20,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
      overflow: 'hidden',
    },
    brandMarkWrapper: {
      marginBottom: 16,
    },
    heroTitle: {
      ...t.typography.titleSm,
      fontSize: 18,
      fontWeight: '800',
      color: t.colors.text,
      textAlign: 'center',
      letterSpacing: -0.3,
      marginBottom: 8,
    },
    heroSubtitle: {
      ...t.typography.bodyMedium,
      color: t.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 21,
      fontSize: 13,
      maxWidth: 300,
      marginBottom: 20,
    },
    capabilityRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 8,
    },
    capabilityPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.06)' : 'transparent',
    },
    capabilityText: {
      fontSize: 11,
      fontWeight: '600',
      color: t.colors.textSecondary,
    },
    messages: {
      gap: t.spacing.md,
      paddingVertical: t.spacing.sm,
    },
    insightsSection: {
      gap: t.spacing.sm,
      marginTop: t.spacing.lg,
    },
    sectionLabel: {
      ...t.typography.caption,
      fontWeight: '700',
      color: t.colors.textTertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      marginBottom: 2,
    },
  });
}
