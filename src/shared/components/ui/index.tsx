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
  Platform,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/shared/theme';
import { AppIcon, type AppIconName } from '@/features/navigation/components/AppIcon';
import { getLoadingLabel } from '@/shared/utils/buttonLoadingLabel';
import { useSpringPress } from '@/shared/hooks/useSpringPress';
import {
  createButtonStyles,
  createInputStyles,
  createCardStyles,
  createSummaryStyles,
  createEmptyStyles,
  createSectionStyles,
  createFormActionsStyles,
  createDetailHeroStyles,
  createDetailMetaListStyles,
  createDetailActionsStyles,
} from './index.styles';

export { Screen, ScreenContainer, ScreenLoader, ScreenSkeleton, ResponsiveGrid, SummaryMetricsGrid, StickyHeaderScreen, ScreenWrapper } from './layout';
export {
  SkeletonBlock, SkeletonLine, SkeletonCircle, SkeletonCard,
  DashboardSkeleton, DashboardContentSkeleton, ListSkeleton, ListRowsSkeleton, DetailSkeleton, SettingsSkeleton,
  NetWorthSkeleton, FamilySkeleton, SupportSkeleton,
  OnboardingSkeleton, ColdStartSkeleton, AiChatSkeleton,
} from './skeleton';
export { AppLoadingScreen } from '@/shared/components/brand/AppLoadingScreen';
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
  SortableStickyHeaderFlatScreen,
} from './feature-screen';
export {
  ScreenSection,
  useScreenInsets,
  useBottomSafeInset,
  useScrollContentStyle,
  useScreenHeaderStyle,
  useScreenListStyle,
} from '@/shared/hooks/useLayout';
export { GroupedCard, ListRow, ProgressBar } from './lists';
export { DateInput } from './DateInput';
export { OtpInput } from './OtpInput';
export { DashedBorder } from './DashedBorder';
export { FormModal } from './FormModal';
export { ActionSheet } from './ActionSheet';
export type { ActionSheetItem } from './ActionSheet';
export { FormErrorBanner } from './FormErrorBanner';
export { FormSuccessBanner } from './FormSuccessBanner';
export { FormInfoBanner } from './FormInfoBanner';
export { AppHeaderBar } from './AppHeaderBar';
export { RingGauge } from './RingGauge';
export { SegmentedMacroBar } from './SegmentedMacroBar';
export type { MacroCategoryItem } from './SegmentedMacroBar';
export { FilterChipsRail } from './FilterChipsRail';
export type { FilterChipItem } from './FilterChipsRail';
export { CashFlowHero } from './CashFlowHero';
export { BentoCard } from './BentoCard';
export { StreakBanner } from './StreakBanner';
export { ToggleSwitch } from './ToggleSwitch';

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
  const spring = useSpringPress();
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

  const pressableStyle = [
    styles.button,
    size === 'lg' && styles.buttonLg,
    !isPrimary && isSecondary && styles.secondary,
    !isPrimary && isOutline && styles.outline,
    variant === 'danger' && styles.danger,
    !isPrimary && isGhost && styles.ghost,
    isDangerGhost && styles.dangerGhost,
    disabled && !loading && styles.disabled,
  ];

  if (isPrimary) {
    const webGradientStyle =
      Platform.OS === 'web'
        ? ({
          backgroundImage: `linear-gradient(135deg, ${theme.colors.gradientStart}, ${theme.colors.gradientEnd})`,
        } as unknown as ViewStyle)
        : undefined;

    return (
      <Pressable
        onPress={onPress}
        onPressIn={spring.onPressIn}
        onPressOut={spring.onPressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={busyLabel}
        accessibilityState={{ disabled: isDisabled, busy: !!loading }}
        style={[
          styles.button,
          styles.primary,
          styles.gradientWrap,
          size === 'lg' && styles.buttonLg,
          size === 'lg' && styles.buttonLgWrap,
          webGradientStyle,
          disabled && !loading && styles.disabled,
        ]}
      >
        {Platform.OS !== 'web' ? (
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        ) : null}
        <Animated.View
          style={[
            spring.style,
            {
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
              position: 'relative',
            },
          ]}
        >
          {inner}
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={spring.onPressIn}
      onPressOut={spring.onPressOut}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={busyLabel}
      accessibilityState={{ disabled: isDisabled, busy: !!loading }}
      style={[...pressableStyle, size === 'lg' && styles.buttonLgWrap]}
    >
      <Animated.View style={[spring.style, { width: '100%', alignItems: 'center', justifyContent: 'center' }]}>
        {inner}
      </Animated.View>
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
  const spring = useSpringPress();
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
      <Pressable
        onPress={onPress}
        onPressIn={spring.onPressIn}
        onPressOut={spring.onPressOut}
        style={styles.summaryPressable}
        accessibilityRole="button"
      >
        <Animated.View style={spring.style}>
          <Card variant="elevated" style={styles.summaryCard}>{content}</Card>
        </Animated.View>
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
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [pressed && { opacity: 0.9 }]}
          accessibilityRole="button"
          accessibilityLabel={action}
        >
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
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button" accessibilityLabel={action}>
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
  const styles = useMemo(() => createFormActionsStyles(theme), [theme]);

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
  const styles = useMemo(() => createDetailHeroStyles(theme, amountColor), [theme, amountColor]);

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
  const styles = useMemo(() => createDetailMetaListStyles(theme), [theme]);

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
  const styles = useMemo(() => createDetailActionsStyles(theme), [theme]);
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
          variant="danger"
          size="lg"
          loading={destructiveLoading}
          disabled={busy && !destructiveLoading}
        />
      ) : null}
    </View>
  );
}

export { FormSection, ImageUploadField, ColorPicker } from './forms';
