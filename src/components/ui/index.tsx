import { useMemo } from 'react';
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
import { useTheme } from '@/src/theme';
import type { AppTheme } from '@/src/theme';
import { AppIcon, type AppIconName } from '@/src/components/AppIcon';

export { Screen, ScreenContainer, ScreenLoader, ResponsiveGrid, RefreshControl } from './layout';
export { GroupedCard, ListRow, ProgressBar } from './lists';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  size?: 'md' | 'lg';
  icon?: AppIconName;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
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

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        size === 'lg' && styles.buttonLg,
        isPrimary && styles.primary,
        isSecondary && styles.secondary,
        isOutline && styles.outline,
        variant === 'danger' && styles.danger,
        isGhost && styles.ghost,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline || isGhost ? theme.colors.primary : theme.colors.onPrimary} />
      ) : (
        <View style={styles.buttonInner}>
          {icon && (
            <AppIcon
              name={icon}
              size={18}
              color={isPrimary || variant === 'danger' ? theme.colors.onPrimary : theme.colors.primary}
            />
          )}
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
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  const theme = useTheme();
  const styles = useMemo(() => createInputStyles(theme), [theme]);

  return (
    <View style={styles.inputContainer}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <TextInput
          placeholderTextColor={theme.colors.textTertiary}
          style={[styles.input, style]}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
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
        <Pressable onPress={onAction} style={styles.actionBtn}>
          <Text style={styles.actionText}>{action}</Text>
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
    label: { ...t.typography.caption, color: t.colors.textSecondary, marginBottom: t.spacing.sm },
    inputWrapper: {
      borderWidth: 1,
      borderColor: t.colors.border,
      borderRadius: t.radii.md,
      backgroundColor: t.colors.inputBg,
    },
    inputError: { borderColor: t.colors.danger },
    input: {
      paddingHorizontal: t.spacing.lg,
      paddingVertical: 14,
      fontSize: 16,
      color: t.colors.text,
    },
    errorText: { color: t.colors.danger, fontSize: 12, marginTop: t.spacing.xs },
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
    summaryPressable: { flex: 1, minWidth: '46%' },
    summaryCard: { flex: 1, minWidth: '46%' },
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
    },
    emptyTitle: { ...t.typography.titleSm, color: t.colors.text, textAlign: 'center' },
    emptySubtitle: {
      ...t.typography.caption,
      color: t.colors.textSecondary,
      marginTop: t.spacing.sm,
      textAlign: 'center',
      lineHeight: 20,
      maxWidth: 280,
    },
    actionBtn: {
      marginTop: t.spacing.lg,
      paddingHorizontal: t.spacing.xl,
      paddingVertical: t.spacing.md,
      borderRadius: t.radii.full,
      backgroundColor: t.colors.primarySoft,
    },
    actionText: { ...t.typography.bodySemibold, color: t.colors.primary },
  });
}

function createSectionStyles(t: AppTheme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: t.spacing.md,
      marginTop: t.spacing.sm,
    },
    title: { ...t.typography.titleSm, color: t.colors.text },
    action: { ...t.typography.bodySemibold, color: t.colors.primary, fontSize: 14 },
  });
}
