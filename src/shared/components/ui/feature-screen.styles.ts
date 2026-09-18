import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/theme';

export const formStackStyles = StyleSheet.create({ body: { gap: 2 } });

export function createHeaderStyles(t: AppTheme) {
  return StyleSheet.create({
    wrap: {
      paddingBottom: t.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
      backgroundColor: t.colors.surfaceContainerLow ?? t.colors.background,
    },
    mainRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.md,
    },
    headerIconRing: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: t.colors.primary + '33',
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.surface,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.1)' : t.colors.borderSubtle,
    },
    backBtnCompact: {
      width: 36,
      height: 36,
      borderRadius: 10,
    },
    textCol: { flex: 1, minWidth: 0 },
    eyebrow: {
      ...t.typography.label,
      color: t.colors.textTertiary,
      marginBottom: 3,
      textTransform: 'capitalize',
    },
    title: {
      ...t.typography.titleSm,
      fontSize: 22,
      fontWeight: '800',
      color: t.colors.text,
      letterSpacing: -0.3,
    },
    subtitle: {
      ...t.typography.caption,
      color: t.colors.textSecondary,
      marginTop: 3,
      lineHeight: 18,
    },
    actionBtn: { borderRadius: 14, overflow: 'hidden' },
    actionGradient: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: t.colors.primary + '33',
    },
    footer: { marginTop: 6 },
  });
}

export function createStackNavStyles(t: AppTheme) {
  return StyleSheet.create({
    wrap: {
      paddingBottom: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.isDark ? 'rgba(255,255,255,0.08)' : t.colors.borderSubtle,
      backgroundColor: t.colors.surfaceContainerLow ?? t.colors.background,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      minHeight: 36,
    },
    textCol: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
    },
    title: {
      fontSize: 17,
      fontWeight: '700',
      color: t.colors.text,
      letterSpacing: -0.2,
    },
    subtitle: {
      fontSize: 12,
      fontWeight: '500',
      color: t.colors.textSecondary,
      marginTop: 1,
      lineHeight: 16,
    },
    actionBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.surface,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.1)' : t.colors.borderSubtle,
    },
    footer: { marginTop: t.spacing.sm },
  });
}

export function createSearchStyles(t: AppTheme) {
  return StyleSheet.create({
    row: { flexDirection: 'row', gap: t.spacing.sm, alignItems: 'center' },
    field: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.sm,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.04)' : t.colors.surface,
      borderRadius: t.radii.lg,
      paddingHorizontal: t.spacing.md,
      paddingVertical: 11,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.08)' : t.colors.borderSubtle,
    },
    placeholder: { ...t.typography.bodyMedium, color: t.colors.textTertiary, fontSize: 15 },
  });
}

export function createIconBtnStyles(t: AppTheme, variant: 'soft' | 'solid') {
  return StyleSheet.create({
    btn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: variant === 'solid' ? t.colors.primary : t.colors.primarySoft,
      borderWidth: variant === 'soft' ? 1 : 0,
      borderColor: t.colors.primary + '33',
    },
    btnActive: {
      borderColor: t.colors.primary,
      borderWidth: 1.5,
      backgroundColor: t.colors.primary + '28',
    },
    badge: {
      position: 'absolute',
      top: 6,
      right: 6,
      minWidth: 14,
      height: 14,
      borderRadius: 7,
      paddingHorizontal: 3,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colors.primary,
      borderWidth: 1.5,
      borderColor: t.colors.surface,
    },
    badgeText: {
      color: t.colors.onPrimary,
      fontSize: 9,
      fontWeight: '700',
      lineHeight: 11,
    },
  });
}

export function createChipStyles(t: AppTheme) {
  return StyleSheet.create({
    /** Match Input field spacing so labels below chips are not cramped. */
    container: { marginBottom: t.spacing.lg },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    scrollRow: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
    segmented: {
      flexDirection: 'row',
      borderRadius: t.radii.lg,
      borderWidth: 1.5,
      borderColor: t.isDark ? 'rgba(255,255,255,0.1)' : t.colors.borderSubtle,
      overflow: 'hidden',
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.04)' : t.colors.surface,
    },
    segment: {
      flex: 1,
      minWidth: 0,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 4,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: t.isDark ? 'rgba(255,255,255,0.1)' : t.colors.borderSubtle,
      borderWidth: 0,
    },
    segmentText: {
      ...t.typography.label,
      color: t.colors.text,
      textAlign: 'center',
    },
    selectControl: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderRadius: t.radii.lg,
      borderWidth: 1.5,
      borderColor: t.isDark ? 'rgba(255,255,255,0.1)' : t.colors.borderSubtle,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.04)' : t.colors.surface,
    },
    selectValue: {
      ...t.typography.bodySemibold,
      color: t.colors.text,
      textTransform: 'capitalize',
      flex: 1,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: t.radii.lg,
      borderWidth: 1.5,
      borderColor: t.isDark ? 'rgba(255,255,255,0.1)' : t.colors.borderSubtle,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.04)' : t.colors.surface,
    },
    chipDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    colorDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    chipText: { fontSize: 13, fontWeight: '600', color: t.colors.text, textTransform: 'capitalize' },
    chipDisabled: { opacity: 0.5 },
    errorText: { color: t.colors.danger, fontSize: 12, marginTop: t.spacing.xs, fontWeight: '500' },
  });
}

export function createFormLabelStyles(t: AppTheme) {
  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: t.spacing.sm,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: t.colors.textSecondary,
    },
    error: { fontSize: 12, fontWeight: '500', color: t.colors.danger },
  });
}

export function createFabStyles(t: AppTheme, bottom: number) {
  return StyleSheet.create({
    wrap: {
      position: 'absolute',
      bottom,
      right: 24,
      borderRadius: 28,
      ...t.shadows.lg,
    },
    gradient: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}

export function createIntroStyles(t: AppTheme) {
  return StyleSheet.create({
    wrap: { marginBottom: t.spacing.md },
    eyebrow: {
      ...t.typography.label,
      color: t.colors.textTertiary,
      marginBottom: 4,
      textTransform: 'capitalize',
    },
    subtitle: {
      ...t.typography.bodyMedium,
      color: t.colors.textSecondary,
      lineHeight: 20,
    },
  });
}
