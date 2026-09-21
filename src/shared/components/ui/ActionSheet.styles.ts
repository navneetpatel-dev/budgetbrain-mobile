import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/theme';

export function createStyles(t: AppTheme) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: t.colors.overlay,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: t.colors.surface,
      borderRadius: t.radii.xl,
      paddingHorizontal: t.spacing.lg,
      paddingTop: t.spacing.sm,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
    },
    handle: {
      alignSelf: 'center',
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: t.colors.border,
      marginBottom: t.spacing.md,
    },
    title: {
      ...t.typography.titleSm,
      color: t.colors.text,
      marginBottom: t.spacing.sm,
    },
    list: {
      borderRadius: t.radii.lg,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      overflow: 'hidden',
      backgroundColor: t.colors.backgroundElevated,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.md,
      paddingVertical: 14,
      paddingHorizontal: t.spacing.lg,
      minHeight: 56,
    },
    rowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.colors.borderSubtle,
    },
    rowPressed: { backgroundColor: t.colors.surfaceHover },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textCol: { flex: 1 },
    label: { ...t.typography.bodyMedium, color: t.colors.text, fontWeight: '600' },
    subtitle: { ...t.typography.caption, color: t.colors.textTertiary, marginTop: 2 },
    cancel: {
      marginTop: t.spacing.md,
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: t.radii.lg,
      backgroundColor: t.colors.surfaceHover,
    },
    cancelText: { ...t.typography.bodySemibold, color: t.colors.textSecondary },
  });
}
