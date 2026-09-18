import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      gap: 12,
      padding: t.spacing.lg,
      borderRadius: t.radii.lg,
      backgroundColor: t.colors.warningSoft,
      borderWidth: 1,
      borderColor: t.colors.warning + '33',
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.warning + '22',
    },
    body: { flex: 1 },
    reason: { ...t.typography.bodyMedium, fontWeight: '600', color: t.colors.text },
    meta: { ...t.typography.caption, color: t.colors.textSecondary, marginTop: 4 },
  });
}

export function createClearStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: t.spacing.lg,
      borderRadius: t.radii.lg,
      backgroundColor: t.colors.successSoft,
      borderWidth: 1,
      borderColor: t.colors.success + '33',
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.success + '22',
    },
    title: { ...t.typography.bodySemibold, color: t.colors.text },
    subtitle: { ...t.typography.caption, color: t.colors.textSecondary, marginTop: 2 },
  });
}
