import { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  TextInput,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/shared/theme';
import type { AppTheme } from '@/shared/theme';
import { AppIcon, type AppIconName } from '@/features/navigation/components/AppIcon';
import { getLoadingLabel } from '@/shared/utils/buttonLoadingLabel';

export { Screen, ScreenContainer, ScreenLoader, ScreenSkeleton, ResponsiveGrid, SummaryMetricsGrid, StickyHeaderScreen, ScreenWrapper } from './layout';
export {
  SkeletonBlock, SkeletonLine, SkeletonCircle, SkeletonCard,
  DashboardSkeleton, DashboardContentSkeleton, ListSkeleton, ListRowsSkeleton, DetailSkeleton, SettingsSkeleton,
  NetWorthSkeleton, FamilySkeleton, SupportSkeleton,
  OnboardingSkeleton, ColdStartSkeleton, AiChatSkeleton,
} from './skeleton';
export type { ListSkeletonVariant } from './skeleton';
export type { ScreenInset } from './layout';
export {
  FeatureHeader,
  SearchField,
  HeaderIconButton,
  FormFieldLabel,
  OptionChips,
  OptionChipList,
  MultiOptionChips,
  BackButton,
  StackNavHeader,
  useStackBack,
  useProfileBack,
  ActionFab,
  ScreenIntro,
  FormStackScreen,
  StackScrollScreen,
  StickyHeaderFlatScreen,
} from './feature-screen';
export {
  ScreenSection,
  useScreenInsets,
  useScrollContentStyle,
  useScreenHeaderStyle,
  useScreenListStyle,
} from '@/shared/hooks/useLayout';
export { GroupedCard, ListRow, ProgressBar } from './lists';
export { DateInput } from './DateInput';
export { DashedBorder } from './DashedBorder';
export { FormModal } from './FormModal';
export { ActionSheet } from './ActionSheet';
export type { ActionSheetItem } from './ActionSheet';
export { FormErrorBanner } from './FormErrorBanner';
export { FormSuccessBanner } from './FormSuccessBanner';
export { FormInfoBanner } from './FormInfoBanner';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'dangerGhost' | 'ghost';
  loading?: boolean;
  loadingTitle?: string;
  disabled?: boolean;
  size?: 'md' | 'lg';
  icon?: AppIconName | React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  loadingTitle,
  disabled,
  size = 'md',
  icon,
}: ButtonProps) {
  const theme = useTheme();
  const styles = useMemo(() => createButtonStyles(theme), [theme]);
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  const isDangerGhost = variant === 'dangerGhost';
  const isSecondary = variant === 'secondary';
  const isDisabled = disabled || loading;
  const busyLabel = loading ? (loadingTitle ?? getLoadingLabel(title)) : title;

  const spinnerColor =
    isOutline || isGhost
      ? theme.colors.primary
      : isDangerGhost
        ? theme.colors.danger
        : theme.colors.onPrimary;

  const iconColor =
    isPrimary || variant === 'danger'
      ? theme.colors.onPrimary
      : isDangerGhost
        ? theme.colors.danger
        : theme.colors.primary;

  const inner = (
    <View style={styles.buttonInner}>
      {loading ? <ActivityIndicator color={spinnerColor} size="small" /> : null}
      {!loading && icon != null ? (
        typeof icon === 'string' ? (
          <AppIcon
            name={icon as AppIconName}
            size={18}
            color={iconColor}
          />
        ) : (
          icon
        )
      ) : null}
      <Text
        style={[
          styles.text,
          isPrimary && styles.primaryText,
          isSecondary && styles.secondaryText,
          isOutline && styles.outlineText,
          isGhost && styles.ghostText,
          isDangerGhost && styles.dangerGhostText,
          variant === 'danger' && styles.primaryText,
        ]}
      >
        {busyLabel}
      </Text>
    </View>
  );

  const pressableStyle = ({ pressed }: { pressed: boolean }) => [
    styles.button,
    size === 'lg' && styles.buttonLg,
    !isPrimary && isSecondary && styles.secondary,
    !isPrimary && isOutline && styles.outline,
    variant === 'danger' && styles.danger,
    !isPrimary && isGhost && styles.ghost,
    isDangerGhost && styles.dangerGhost,
    disabled && !loading && styles.disabled,
    pressed && !isDisabled && styles.pressed,
  ];

  if (isPrimary) {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={busyLabel}
        accessibilityState={{ disabled: isDisabled, busy: !!loading }}
        style={({ pressed }) => [
          styles.gradientWrap,
          size === 'lg' && styles.buttonLgWrap,
          pressed && !isDisabled && styles.pressed,
          disabled && !loading && styles.disabled,
        ]}
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.button, styles.primaryGradient, size === 'lg' && styles.buttonLg, size === 'lg' && styles.buttonLgInner]}
        >
          {inner}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={busyLabel}
      accessibilityState={{ disabled: isDisabled, busy: !!loading }}
      style={({ pressed }) => [
        ...pressableStyle({ pressed }),
        size === 'lg' && styles.buttonLgWrap,
      ]}
    >
      {inner}
    </Pressable>
  );
}

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  secureToggle?: boolean;
  leftIcon?: AppIconName;
  variant?: 'default' | 'soft';
  disabled?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  style,
  secureTextEntry,
  secureToggle,
  leftIcon,
  variant = 'default',
  multiline,
  onFocus,
  onBlur,
  disabled,
  editable,
  ...props
}: InputProps) {
  const theme = useTheme();
  const styles = useMemo(() => createInputStyles(theme), [theme]);
  const [hidden, setHidden] = useState(!!secureTextEntry);
  const [focused, setFocused] = useState(false);
  const isSecure = secureTextEntry && (secureToggle ? hidden : true);
  const isSoft = variant === 'soft';
  const isMultiline = !!multiline;
  const isFieldDisabled = disabled || editable === false;

  return (
    <View style={styles.inputContainer}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrapper,
          isSoft && styles.inputWrapperSoft,
          isMultiline && styles.inputWrapperMultiline,
          focused && !isFieldDisabled && styles.inputFocused,
          error && styles.inputError,
          isFieldDisabled && styles.inputDisabled,
        ]}
      >
        {leftIcon ? (
          <View style={[styles.leftIcon, isMultiline && styles.leftIconMultiline]}>
            <AppIcon name={leftIcon} size={18} color={focused ? theme.colors.primary : theme.colors.textTertiary} />
          </View>
        ) : null}
        <TextInput
          placeholderTextColor={theme.colors.textTertiary}
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            secureToggle && styles.inputWithToggle,
            isMultiline && styles.inputMultiline,
            style,
          ]}
          secureTextEntry={isSecure}
          accessibilityLabel={label}
          multiline={multiline}
          textAlignVertical={isMultiline ? 'top' : 'auto'}
          editable={editable ?? !disabled}
          onFocus={(e) => {
            if (isFieldDisabled) return;
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {secureTextEntry && secureToggle ? (
          <Pressable
            onPress={() => setHidden((v) => !v)}
            style={styles.toggleBtn}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            hitSlop={8}
          >
            <AppIcon
              name={hidden ? 'eye' : 'eyeSlash'}
              size={20}
              color={theme.colors.textTertiary}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

/** Surface hierarchy (mobile + web):
 *  - default: list items / dense rows (border, no shadow)
 *  - elevated: SummaryCard metrics + primary panels (shadow, no border)
 *  - outline / glass: specialty accents
 *  GroupedCard always uses the default surface. */
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outline' | 'glass';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  const theme = useTheme();
  const styles = useMemo(() => createCardStyles(theme), [theme]);
  return (
    <View
      style={[
        styles.card,
        variant === 'elevated' && styles.elevated,
        variant === 'outline' && styles.outline,
        variant === 'glass' && styles.glass,
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface SummaryCardProps {
  title: string;
  amount: string;
  color?: string;
  subtitle?: string;
  icon?: AppIconName;
  onPress?: () => void;
}

export function SummaryCard({ title, amount, color, subtitle, icon, onPress }: SummaryCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSummaryStyles(theme), [theme]);
  const tint = color ?? theme.colors.text;

  const content = (
    <View style={styles.summaryBody}>
      <View style={styles.summaryTop}>
        {icon && (
          <View style={[styles.iconWrap, { backgroundColor: tint + '18' }]}>
            <AppIcon name={icon} size={16} color={tint} />
          </View>
        )}
        <Text style={styles.summaryTitle}>{title}</Text>
      </View>
      <Text style={[styles.summaryAmount, { color: tint }]} numberOfLines={1}>{amount}</Text>
      {/* Always reserve subtitle space so metric cards share one height in a row. */}
      <Text style={styles.summarySubtitle} numberOfLines={1}>{subtitle ?? ' '}</Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.summaryPressable, pressed && { opacity: 0.9 }]}>
        <Card variant="elevated" style={styles.summaryCard}>{content}</Card>
      </Pressable>
    );
  }

  return <Card variant="elevated" style={styles.summaryCard}>{content}</Card>;
}

export function EmptyState({
  title,
  subtitle,
  icon,
  action,
  onAction,
  secondaryAction,
  onSecondaryAction,
}: {
  title: string;
  subtitle?: string;
  icon?: AppIconName;
  action?: string;
  onAction?: () => void;
  secondaryAction?: string;
  onSecondaryAction?: () => void;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createEmptyStyles(theme), [theme]);
  return (
    <View style={styles.emptyState}>
      {icon && (
        <View style={styles.iconCircle}>
          <AppIcon name={icon} size={28} color={theme.colors.primary} />
        </View>
      )}
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
      {action && onAction && (
        <Pressable onPress={onAction} style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.actionBtn}
          >
            <Text style={styles.actionText}>{action}</Text>
          </LinearGradient>
        </Pressable>
      )}
      {secondaryAction && onSecondaryAction && (
        <Pressable
          onPress={onSecondaryAction}
          style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
          accessibilityLabel={secondaryAction}
        >
          <Text style={styles.secondaryText}>{secondaryAction}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createSectionStyles(theme), [theme]);
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action && onAction && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.action}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

/** Stacked primary + optional secondary actions for forms */
export function FormActions({
  primaryTitle,
  onPrimary,
  primaryLoading,
  primaryLoadingTitle,
  secondaryTitle,
  onSecondary,
  style,
}: {
  primaryTitle: string;
  onPrimary: () => void;
  primaryLoading?: boolean;
  primaryLoadingTitle?: string;
  secondaryTitle?: string;
  onSecondary?: () => void;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const styles = useMemo(
    () => StyleSheet.create({ wrap: { gap: theme.spacing.sm, marginTop: theme.spacing.sm } }),
    [theme],
  );

  return (
    <View style={[styles.wrap, style]}>
      <Button
        title={primaryTitle}
        loadingTitle={primaryLoadingTitle}
        onPress={onPrimary}
        loading={primaryLoading}
        disabled={primaryLoading}
        size="lg"
      />
      {secondaryTitle && onSecondary ? (
        <Button title={secondaryTitle} onPress={onSecondary} variant="outline" disabled={primaryLoading} />
      ) : null}
    </View>
  );
}

/** Detail hero: amount + title context */
export function DetailHero({
  amount,
  amountColor,
  title,
  subtitle,
}: {
  amount: string;
  amountColor?: string;
  title?: string;
  subtitle?: string;
}) {
  const theme = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          alignItems: 'center',
          paddingVertical: theme.spacing.xl,
          paddingHorizontal: theme.spacing.md,
        },
        amount: {
          fontSize: 36,
          fontWeight: '800',
          letterSpacing: -1,
          color: amountColor ?? theme.colors.text,
        },
        title: {
          fontSize: 17,
          fontWeight: '600',
          color: theme.colors.text,
          marginTop: theme.spacing.sm,
          letterSpacing: -0.2,
          textAlign: 'center',
        },
        subtitle: {
          fontSize: 13,
          fontWeight: '500',
          color: theme.colors.textTertiary,
          marginTop: 4,
          textAlign: 'center',
        },
      }),
    [theme, amountColor],
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.amount}>{amount}</Text>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

/** Clean key/value rows — no heavy card chrome */
export function DetailMetaList({
  rows,
}: {
  rows: Array<{ label: string; value: string }>;
}) {
  const theme = useTheme();
  const visible = rows.filter((r) => r.value && r.value !== '-');
  const styles = useMemo(() => {
    const hairline = theme.isDark ? 'rgba(255,255,255,0.08)' : theme.colors.borderSubtle;
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
        gap: theme.spacing.lg,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: hairline,
      },
      rowLast: { borderBottomWidth: 0 },
      label: { fontSize: 13, fontWeight: '500', color: theme.colors.textTertiary },
      value: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
        textAlign: 'right',
        flex: 1,
        textTransform: 'capitalize',
      },
    });
  }, [theme]);

  if (!visible.length) return null;

  return (
    <View style={styles.wrap}>
      {visible.map((row, i) => (
        <View key={row.label} style={[styles.row, i === visible.length - 1 && styles.rowLast]}>
          <Text style={styles.label}>{row.label}</Text>
          <Text style={styles.value}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

/** Compact detail actions: primary + secondary in a row, quiet delete */
export function DetailActions({
  primaryTitle = 'Edit',
  onPrimary,
  primaryLoading,
  secondaryTitle,
  onSecondary,
  secondaryLoading,
  destructiveTitle = 'Delete',
  onDestructive,
  destructiveLoading,
  style,
}: {
  primaryTitle?: string;
  onPrimary: () => void;
  primaryLoading?: boolean;
  secondaryTitle?: string;
  onSecondary?: () => void;
  secondaryLoading?: boolean;
  destructiveTitle?: string;
  onDestructive?: () => void;
  destructiveLoading?: boolean;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const styles = useMemo(
    () => StyleSheet.create({
      wrap: {
        gap: theme.spacing.md,
        marginTop: theme.spacing.lg,
        alignItems: 'center',
      },
      row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        width: '100%',
      },
      rowBtn: { flexGrow: 1, flexBasis: 140, maxWidth: 220 },
    }),
    [theme],
  );
  const busy = primaryLoading || secondaryLoading || destructiveLoading;

  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.row}>
        <View style={styles.rowBtn}>
          <Button
            title={primaryTitle}
            onPress={onPrimary}
            loading={primaryLoading}
            disabled={busy && !primaryLoading}
            size="lg"
          />
        </View>
        {secondaryTitle && onSecondary ? (
          <View style={styles.rowBtn}>
            <Button
              title={secondaryTitle}
              onPress={onSecondary}
              variant="outline"
              loading={secondaryLoading}
              disabled={busy && !secondaryLoading}
              size="lg"
            />
          </View>
        ) : null}
      </View>
      {onDestructive ? (
        <Button
          title={destructiveTitle}
          onPress={onDestructive}
          variant="dangerGhost"
          loading={destructiveLoading}
          disabled={busy && !destructiveLoading}
        />
      ) : null}
    </View>
  );
}

export { FormSection, ImageUploadField, ColorPicker } from './forms';

function createButtonStyles(t: AppTheme) {
  return StyleSheet.create({
    button: {
      borderRadius: t.radii.md,
      paddingVertical: 14,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonLg: { paddingVertical: 16, borderRadius: t.radii.lg },
    buttonLgWrap: { width: '100%', borderRadius: t.radii.lg },
    buttonLgInner: { width: '100%' },
    gradientWrap: { borderRadius: t.radii.md, overflow: 'hidden', alignSelf: 'stretch' },
    primaryGradient: { backgroundColor: 'transparent' },
    buttonInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
    pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
    text: { ...t.typography.bodySemibold, color: t.colors.text },
    primaryText: { color: t.colors.onPrimary },
    secondaryText: { color: t.colors.text },
    outlineText: { color: t.colors.primary },
    ghostText: { color: t.colors.primary },
    dangerGhostText: { color: t.colors.danger, fontWeight: '600' },
  });
}

function createInputStyles(t: AppTheme) {
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

function createCardStyles(t: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: t.colors.surface,
      borderRadius: t.radii.lg,
      padding: t.spacing.lg,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
    },
    elevated: { ...t.shadows.md, borderColor: 'transparent' },
    outline: { backgroundColor: 'transparent', borderColor: t.colors.border },
    glass: {
      backgroundColor: t.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.72)',
      borderColor: t.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
    },
  });
}

function createSummaryStyles(t: AppTheme) {
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

function createEmptyStyles(t: AppTheme) {
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

function createSectionStyles(t: AppTheme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: t.spacing.sm,
    },
    title: { ...t.typography.titleSm, color: t.colors.text },
    action: { ...t.typography.bodySemibold, color: t.colors.primary, fontSize: 14 },
  });
}
