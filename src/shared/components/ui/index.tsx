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
  DashboardSkeleton, ListSkeleton, DetailSkeleton, SettingsSkeleton,
  OnboardingSkeleton, ColdStartSkeleton,
} from './skeleton';
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
export { FormErrorBanner } from './FormErrorBanner';
export { FormSuccessBanner } from './FormSuccessBanner';
export { FormInfoBanner } from './FormInfoBanner';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
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
  const isSecondary = variant === 'secondary';
  const isDisabled = disabled || loading;
  const busyLabel = loading ? (loadingTitle ?? getLoadingLabel(title)) : title;

  const spinnerColor =
    isOutline || isGhost ? theme.colors.primary : theme.colors.onPrimary;

  const inner = (
    <View style={styles.buttonInner}>
      {loading ? <ActivityIndicator color={spinnerColor} size="small" /> : null}
      {!loading && icon != null ? (
        typeof icon === 'string' ? (
          <AppIcon
            name={icon as AppIconName}
            size={18}
            color={isPrimary || variant === 'danger' ? theme.colors.onPrimary : theme.colors.primary}
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
      style={pressableStyle}
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
    <>
      <View style={styles.summaryTop}>
        {icon && (
          <View style={[styles.iconWrap, { backgroundColor: tint + '18' }]}>
            <AppIcon name={icon} size={16} color={tint} />
          </View>
        )}
        <Text style={styles.summaryTitle}>{title}</Text>
      </View>
      <Text style={[styles.summaryAmount, { color: tint }]}>{amount}</Text>
      {subtitle && <Text style={styles.summarySubtitle}>{subtitle}</Text>}
    </>
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
}: {
  title: string;
  subtitle?: string;
  icon?: AppIconName;
  action?: string;
  onAction?: () => void;
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
    ghost: { backgroundColor: t.colors.primarySoft },
    disabled: { opacity: 0.5 },
    pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
    text: { ...t.typography.bodySemibold, color: t.colors.text },
    primaryText: { color: t.colors.onPrimary },
    secondaryText: { color: t.colors.text },
    outlineText: { color: t.colors.primary },
    ghostText: { color: t.colors.primary },
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
    summaryPressable: { width: '100%', alignSelf: 'stretch' },
    summaryCard: { width: '100%' },
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
    summarySubtitle: { ...t.typography.caption, color: t.colors.textTertiary, marginTop: 4 },
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
