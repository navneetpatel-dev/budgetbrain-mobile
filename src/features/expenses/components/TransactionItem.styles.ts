import { StyleSheet } from 'react-native';
import type { useTheme } from '@/shared/theme';

export function createGroupStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    group: {
      backgroundColor: t.colors.surface,
      borderRadius: t.radii.card,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      overflow: 'hidden',
      ...t.shadows.sm,
    },
  });
}

export function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: t.spacing.md,
      gap: 12,
      backgroundColor: t.colors.surface,
      minHeight: 72,
      position: 'relative',
      overflow: 'hidden',
    },
    incomeAccentStrip: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      backgroundColor: t.colors.secondary,
      borderTopRightRadius: 2,
      borderBottomRightRadius: 2,
    },
    first: {},
    last: {
      borderBottomWidth: 0,
    },
    rowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.colors.borderSubtle,
    },
    pressed: {
      backgroundColor: t.colors.surfaceHover,
    },
    iconPod: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    cornerBadge: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: t.colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
    },
    content: {
      flex: 1,
      minWidth: 0,
      gap: 4,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    merchant: {
      fontSize: 15,
      fontWeight: '600',
      letterSpacing: -0.2,
      color: t.colors.text,
      flexShrink: 1,
    },
    entityTag: {
      paddingHorizontal: 6,
      paddingVertical: 1.5,
      borderRadius: 6,
    },
    entityTagText: {
      fontSize: 10,
      fontWeight: '600',
      color: t.colors.textSecondary,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    paymentMethod: {
      fontSize: 12,
      fontWeight: '500',
      color: t.colors.textTertiary,
    },
    metaDivider: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: t.colors.textTertiary,
    },
    date: {
      fontSize: 12,
      fontWeight: '500',
      color: t.colors.textTertiary,
    },
    trailing: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: 3,
    },
    amount: {
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: -0.2,
      fontVariant: ['tabular-nums'],
    },
    expense: {
      color: t.colors.text,
    },
    income: {
      color: t.colors.secondary,
    },
    statusSub: {
      fontSize: 11,
      color: t.colors.textTertiary,
      fontWeight: '500',
    },
  });
}
