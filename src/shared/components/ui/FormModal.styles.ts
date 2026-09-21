import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>, bottomInset: number) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: t.colors.overlay,
      justifyContent: 'flex-end',
    },
    container: {
      flex: 1,
      marginTop: 48,
      backgroundColor: t.colors.background,
      borderRadius: t.radii.xl,
      overflow: 'hidden',
    },
    handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.18)' : t.colors.border,
    },
    headerGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 120,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingHorizontal: t.spacing.lg,
      paddingTop: t.spacing.sm,
      paddingBottom: t.spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.isDark ? 'rgba(255,255,255,0.08)' : t.colors.borderSubtle,
    },
    headerText: { flex: 1, paddingRight: t.spacing.md },
    title: { ...t.typography.titleSm, color: t.colors.text, fontWeight: '800' },
    subtitle: { ...t.typography.caption, color: t.colors.textSecondary, marginTop: 4 },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.surface,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.1)' : t.colors.borderSubtle,
    },
    content: {
      paddingHorizontal: t.spacing.lg,
      paddingTop: t.spacing.lg,
      paddingBottom: bottomInset + t.spacing.xl,
    },
    footer: {
      paddingHorizontal: t.spacing.lg,
      paddingTop: t.spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.isDark ? 'rgba(255,255,255,0.08)' : t.colors.borderSubtle,
      backgroundColor: t.colors.background,
    },
  });
}
