import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/shared/theme';

export function createButtonStyles(t: AppTheme) {
  return StyleSheet.create({
    button: {
      borderRadius: t.radii.md,
      paddingVertical: 14,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonLg: { paddingVertical: 16, borderRadius: t.radii.lg },
    buttonLgWrap: { width: '100%', alignSelf: 'stretch', borderRadius: t.radii.lg },
    buttonLgInner: { width: '100%', alignSelf: 'stretch' },
    gradientWrap: {
      borderRadius: t.radii.md,
      overflow: 'hidden',
      position: 'relative',
      alignSelf: 'stretch',
      width: '100%',
      backgroundColor: t.colors.primary,
    },
    primaryGradient: { backgroundColor: 'transparent', width: '100%', alignSelf: 'stretch' },
    buttonInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%' },
    primary: { backgroundColor: t.colors.primary },
    secondary: { backgroundColor: t.colors.surfaceHover },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: t.colors.border,
    },
    danger: { backgroundColor: t.colors.danger },
    dangerGhost: { backgroundColor: 'transparent' },
    ghost: { backgroundColor: t.colors.primarySoft },
    disabled: { opacity: 0.5 },
    text: { ...t.typography.bodySemibold, color: t.colors.text },
    primaryText: { color: t.colors.onPrimary },
    secondaryText: { color: t.colors.text },
    outlineText: { color: t.colors.primary },
    ghostText: { color: t.colors.primary },
    dangerGhostText: { color: t.colors.danger, fontWeight: '600' },
  });
}

export function createInputStyles(t: AppTheme) {
  return StyleSheet.create({
    inputContainer: { marginBottom: t.spacing.lg },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: t.colors.textSecondary,
      marginBottom: t.spacing.sm,
    },
    inputWrapper: {
      borderWidth: 1.5,
      borderColor: t.isDark ? 'rgba(255,255,255,0.1)' : t.colors.borderSubtle,
      borderRadius: t.radii.lg,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.04)' : t.colors.inputBg,
      flexDirection: 'row',
      alignItems: 'center',
    },
    inputWrapperMultiline: {
      alignItems: 'flex-start',
      minHeight: 112,
    },
    inputWrapperSoft: {
      borderRadius: t.radii.lg,
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.04)' : t.colors.inputBg,
      borderColor: t.isDark ? 'rgba(255,255,255,0.08)' : t.colors.borderSubtle,
    },
    inputFocused: {
      borderColor: t.colors.primary + '88',
      backgroundColor: t.colors.primarySoft,
    },
    inputError: { borderColor: t.colors.danger, backgroundColor: t.colors.dangerSoft },
    inputDisabled: { opacity: 0.55 },
    input: {
      flex: 1,
      paddingHorizontal: t.spacing.md,
      paddingVertical: 14,
      fontSize: 16,
      color: t.colors.text,
    },
    inputMultiline: {
      minHeight: 96,
      paddingTop: 14,
      lineHeight: 22,
    },
    inputWithLeftIcon: { paddingLeft: t.spacing.xs },
    leftIcon: {
      width: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: t.spacing.sm,
    },
    leftIconMultiline: { marginTop: 12 },
    inputWithToggle: { paddingRight: t.spacing.sm },
    toggleBtn: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: t.spacing.xs,
    },
    errorText: { color: t.colors.danger, fontSize: 12, marginTop: t.spacing.xs, fontWeight: '500' },
    helperText: { color: t.colors.textTertiary, fontSize: 12, marginTop: t.spacing.xs },
  });
}

export function createCardStyles(t: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: t.colors.surfaceContainer ?? t.colors.surface,
      borderRadius: t.radii.card ?? 20,
      padding: t.spacing.lg,
      borderWidth: 1,
      borderColor: t.isDark ? 'rgba(255,255,255,0.06)' : t.colors.borderSubtle,
    },
    elevated: { ...t.shadows.md, borderColor: 'transparent' },
    outline: { backgroundColor: 'transparent', borderColor: t.colors.border },
    glass: {
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.72)',
      borderColor: t.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
    },
  });
}

export function createSummaryStyles(t: AppTheme) {
  return StyleSheet.create({
    summaryPressable: { flex: 1, width: '100%', alignSelf: 'stretch' },
    summaryCard: { flex: 1, width: '100%' },
    summaryBody: { flex: 1 },
    summaryTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: t.spacing.sm },
    iconWrap: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    summaryTitle: { ...t.typography.caption, color: t.colors.textSecondary, flex: 1 },
    summaryAmount: { ...t.typography.amount, color: t.colors.text },
    summarySubtitle: {
      ...t.typography.caption,
      color: t.colors.textTertiary,
      marginTop: 4,
      minHeight: 18,
      lineHeight: 18,
    },
  });
}

export function createEmptyStyles(t: AppTheme) {
  return StyleSheet.create({
    emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: t.spacing.xl },
    iconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: t.colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: t.spacing.lg,
      borderWidth: 1,
      borderColor: t.colors.primary + '28',
    },
    emptyTitle: { ...t.typography.titleSm, color: t.colors.text, textAlign: 'center' },
    emptySubtitle: {
      ...t.typography.bodyMedium,
      color: t.colors.textSecondary,
      marginTop: t.spacing.sm,
      textAlign: 'center',
      lineHeight: 22,
      maxWidth: 280,
    },
    actionBtn: {
      marginTop: t.spacing.lg,
      paddingHorizontal: t.spacing.xl,
      paddingVertical: 12,
      borderRadius: t.radii.full,
    },
    actionText: { ...t.typography.bodySemibold, color: t.colors.onPrimary, fontSize: 14 },
    secondaryBtn: {
      marginTop: t.spacing.md,
      paddingHorizontal: t.spacing.lg,
      paddingVertical: 10,
    },
    secondaryText: { ...t.typography.bodySemibold, color: t.colors.primary, fontSize: 14 },
  });
}

export function createSectionStyles(t: AppTheme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: t.spacing.sm,
      minHeight: 28,
    },
    title: {
      fontSize: 15,
      fontWeight: '600',
      letterSpacing: -0.2,
      color: t.colors.text,
      fontFamily: t.typography.titleSm.fontFamily,
    },
    action: {
      fontSize: 13,
      fontWeight: '600',
      color: t.colors.primary,
      fontFamily: t.typography.bodySemibold.fontFamily,
    },
  });
}

export function createFormActionsStyles(t: AppTheme) {
  return StyleSheet.create({ wrap: { gap: t.spacing.sm, marginTop: t.spacing.sm } });
}

export function createDetailHeroStyles(t: AppTheme, amountColor?: string) {
  return StyleSheet.create({
    wrap: {
      alignItems: 'center',
      paddingVertical: t.spacing.xl,
      paddingHorizontal: t.spacing.md,
    },
    amount: {
      ...t.typography.amountLg,
      color: amountColor ?? t.colors.text,
    },
    title: {
      fontSize: 17,
      fontWeight: '600',
      color: t.colors.text,
      marginTop: t.spacing.sm,
      letterSpacing: -0.2,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 13,
      fontWeight: '500',
      color: t.colors.textTertiary,
      marginTop: 4,
      textAlign: 'center',
    },
  });
}

export function createDetailMetaListStyles(t: AppTheme) {
  const hairline = t.isDark ? 'rgba(255,255,255,0.08)' : t.colors.borderSubtle;
  return StyleSheet.create({
    wrap: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: hairline,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: t.spacing.lg,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: hairline,
    },
    rowLast: { borderBottomWidth: 0 },
    label: { fontSize: 13, fontWeight: '500', color: t.colors.textTertiary },
    value: {
      fontSize: 14,
      fontWeight: '600',
      color: t.colors.text,
      textAlign: 'right',
      flex: 1,
      textTransform: 'capitalize',
    },
  });
}

export function createDetailActionsStyles(t: AppTheme) {
  return StyleSheet.create({
    wrap: {
      gap: t.spacing.md,
      marginTop: t.spacing.lg,
    },
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: t.spacing.sm,
      width: '100%',
    },
    rowBtn: { flexGrow: 1, flexBasis: 140, maxWidth: 220 },
  });
}
