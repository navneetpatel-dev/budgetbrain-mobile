import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export const markStyles = StyleSheet.create({
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  g: { fontSize: 13, fontWeight: '700', color: '#4285F4' },
});

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: { marginTop: 0 },
    row: { flexDirection: 'row', gap: t.spacing.sm },
  });
}

export function createBtnStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    btn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingVertical: 14,
      borderRadius: t.radii.lg,
      backgroundColor: t.colors.surface,
      borderWidth: 1,
      borderColor: t.colors.border,
    },
    btnDisabled: { opacity: 0.5 },
    btnPressed: { opacity: 0.88 },
    label: { ...t.typography.bodySemibold, fontSize: 15, color: t.colors.text },
  });
}
