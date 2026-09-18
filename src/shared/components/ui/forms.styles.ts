import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/theme';

export function createSectionStyles(t: AppTheme) {
  return StyleSheet.create({
    wrap: {
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.03)' : t.colors.surface,
      borderRadius: t.radii.lg,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
      padding: t.spacing.md,
      marginBottom: t.spacing.md,
    },
    title: {
      fontSize: 13,
      fontWeight: '700',
      color: t.colors.text,
      letterSpacing: -0.1,
      marginBottom: 2,
    },
    subtitle: {
      ...t.typography.caption,
      color: t.colors.textSecondary,
      marginBottom: t.spacing.sm,
    },
    body: { gap: 2 },
  });
}

export function createUploadStyles(t: AppTheme, height: number) {
  return StyleSheet.create({
    container: { marginBottom: t.spacing.lg },
    containerDisabled: { opacity: 0.55 },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: t.colors.textSecondary,
      marginBottom: t.spacing.sm,
    },
    zone: {
      height,
      borderRadius: t.radii.lg,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: t.isDark ? 'rgba(255,255,255,0.14)' : t.colors.border,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.03)' : t.colors.surface,
      overflow: 'hidden',
    },
    zoneError: { borderColor: t.colors.danger },
    zoneDisabled: { opacity: 0.7 },
    zonePressed: {
      borderColor: t.colors.primary + '66',
      backgroundColor: t.colors.primarySoft,
    },
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: t.spacing.lg,
      gap: t.spacing.sm,
    },
    emptyIconRing: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 2,
    },
    emptyTitle: { ...t.typography.bodySemibold, color: t.colors.text, fontSize: 15 },
    emptyHint: { ...t.typography.caption, color: t.colors.textTertiary, textAlign: 'center' },
    preview: { width: '100%', height: '100%' },
    previewOverlay: {
      ...StyleSheet.absoluteFill,
    },
    previewActions: {
      position: 'absolute',
      bottom: t.spacing.sm,
      right: t.spacing.sm,
      flexDirection: 'row',
      gap: t.spacing.sm,
    },
    previewBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: t.radii.full,
      backgroundColor: 'rgba(0,0,0,0.45)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    removeBtn: { paddingHorizontal: 10 },
    previewBtnText: { color: t.colors.onPrimary, fontSize: 12, fontWeight: '600' },
    errorText: { color: t.colors.danger, fontSize: 12, marginTop: t.spacing.xs },
  });
}

export function createColorStyles(t: AppTheme) {
  return StyleSheet.create({
    container: { marginBottom: t.spacing.lg },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: t.colors.textSecondary,
      marginBottom: t.spacing.sm,
    },
    row: { flexDirection: 'row', gap: 10, paddingVertical: 4 },
    swatchOuter: {
      padding: 3,
      borderRadius: 999,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    swatchDisabled: { opacity: 0.5 },
    swatch: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      ...t.shadows.sm,
    },
    errorText: { color: t.colors.danger, fontSize: 12, marginTop: t.spacing.xs },
  });
}
