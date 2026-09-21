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
      gap: t.spacing.md,
    },
    infoCard: {
      position: 'relative',
      backgroundColor: t.colors.surfaceContainer ?? t.colors.surface,
      borderRadius: t.radii.card ?? 20,
      padding: 18,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
      overflow: 'hidden',
    },
    infoIconPod: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: t.isDark ? 'rgba(14, 165, 233, 0.15)' : 'rgba(14, 165, 233, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoTextCol: {
      flex: 1,
    },
    infoTitle: {
      ...t.typography.bodySemibold,
      fontSize: 15,
      fontWeight: '700',
      color: t.colors.text,
      marginBottom: 3,
    },
    infoSubtitle: {
      ...t.typography.caption,
      color: t.colors.textSecondary,
      lineHeight: 18,
      fontSize: 12,
    },
    configCard: {
      backgroundColor: t.colors.surfaceContainer ?? t.colors.surface,
      borderRadius: t.radii.card ?? 20,
      padding: 18,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
    },
    sectionHeader: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.8,
      color: t.colors.textTertiary,
      marginBottom: 2,
    },
    sectionHint: {
      ...t.typography.caption,
      color: t.colors.textSecondary,
      fontSize: 12,
      marginBottom: 16,
    },
    inputsRow: {
      gap: 12,
    },
    actionsBlock: {
      gap: 10,
    },
    actionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: t.colors.surfaceContainer ?? t.colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
    },
    formatIconPod: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    formatTextCol: {
      flex: 1,
    },
    formatTitle: {
      ...t.typography.bodySemibold,
      fontSize: 14,
      fontWeight: '700',
      color: t.colors.text,
    },
    formatDesc: {
      ...t.typography.caption,
      color: t.colors.textSecondary,
      fontSize: 11,
      marginTop: 2,
    },
  });
}
