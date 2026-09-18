import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { marginBottom: t.spacing.lg },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: t.colors.textSecondary,
      marginBottom: t.spacing.sm,
    },
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: t.isDark ? 'rgba(255,255,255,0.1)' : t.colors.borderSubtle,
      borderRadius: t.radii.lg,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.04)' : t.colors.inputBg,
      paddingHorizontal: t.spacing.sm,
      paddingVertical: 12,
      gap: t.spacing.sm,
    },
    fieldFocused: {
      borderColor: t.colors.primary + '88',
      backgroundColor: t.colors.primarySoft,
    },
    fieldError: { borderColor: t.colors.danger },
    fieldDisabled: { opacity: 0.55 },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.primarySoft,
    },
    value: { flex: 1, fontSize: 16, fontWeight: '500', color: t.colors.text },
    placeholder: { color: t.colors.textTertiary, fontWeight: '400' },
    errorText: { color: t.colors.danger, fontSize: 12, marginTop: t.spacing.xs },
    sheetBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    sheet: {
      backgroundColor: t.colors.surface,
      borderTopLeftRadius: t.radii.xl,
      borderTopRightRadius: t.radii.xl,
      paddingTop: t.spacing.sm,
    },
    sheetHandle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.2)' : t.colors.border,
      alignSelf: 'center',
      marginBottom: t.spacing.sm,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: t.spacing.lg,
      paddingBottom: t.spacing.sm,
    },
    sheetTitle: { ...t.typography.bodySemibold, color: t.colors.text },
    sheetDone: { ...t.typography.bodySemibold, color: t.colors.primary, fontSize: 16 },
  });
}
