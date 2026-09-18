import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/theme';

export function createGroupedStyles(t: AppTheme) {
  return StyleSheet.create({
    wrapper: { marginBottom: 0 },
    groupTitle: {
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.2,
      color: t.colors.textTertiary,
      marginBottom: t.spacing.sm,
      marginLeft: t.spacing.xs,
    },
    card: {
      backgroundColor: t.colors.surfaceContainer ?? t.colors.surface,
      borderRadius: t.radii.card ?? 20,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
      overflow: 'hidden',
    },
    cardPadded: {
      padding: t.spacing.lg,
      gap: t.spacing.md,
    },
  });
}

export function createRowStyles(t: AppTheme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: t.spacing.lg,
      gap: t.spacing.md,
      minHeight: 52,
    },
    rowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
    },
    rowPressed: { backgroundColor: t.colors.surfaceHover ?? (t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.surfaceHover) },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textCol: { flex: 1 },
    label: { ...t.typography.bodyMedium, color: t.colors.text },
    subtitle: { ...t.typography.caption, color: t.colors.textTertiary, marginTop: 2 },
    value: {
      ...t.typography.caption,
      color: t.colors.textSecondary,
      fontWeight: '600',
      fontVariant: ['tabular-nums'],
    },
  });
}
