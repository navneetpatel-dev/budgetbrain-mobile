import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { marginBottom: t.spacing.lg },
    disabled: { opacity: 0.55 },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: t.colors.textSecondary,
      marginBottom: t.spacing.sm,
    },
    row: {
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'space-between',
    },
    box: {
      flex: 1,
      minWidth: 40,
      maxWidth: 52,
      height: 52,
      borderRadius: t.radii.lg,
      borderWidth: 1.5,
      borderColor: t.isDark ? 'rgba(255,255,255,0.1)' : t.colors.borderSubtle,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.04)' : t.colors.inputBg,
      textAlign: 'center',
      fontSize: 20,
      fontWeight: '700',
      color: t.colors.text,
      padding: 0,
    },
    boxFilled: {
      borderColor: t.colors.primary + '66',
      backgroundColor: t.colors.primarySoft,
    },
    boxError: {
      borderColor: t.colors.danger,
      backgroundColor: t.colors.dangerSoft,
    },
    errorText: {
      color: t.colors.danger,
      fontSize: 12,
      marginTop: t.spacing.xs,
      fontWeight: '500',
    },
  });
}
