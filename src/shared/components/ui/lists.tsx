import { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, ViewStyle } from 'react-native';
import { AppIcon, type AppIconName } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import type { AppTheme } from '@/shared/theme';

export function GroupedCard({
  children,
  title,
  style,
}: {
  children: React.ReactNode;
  title?: string;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createGroupedStyles(theme), [theme]);

  return (
    <View style={[styles.wrapper, style]}>
      {title && <Text style={styles.groupTitle}>{title}</Text>}
      <View style={styles.card}>{children}</View>
    </View>
  );
}

export function ListRow({
  icon,
  iconColor,
  iconBg,
  label,
  subtitle,
  value,
  onPress,
  showChevron = !!onPress,
  destructive,
  isLast,
}: {
  icon?: AppIconName;
  iconColor?: string;
  iconBg?: string;
  label: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
  isLast?: boolean;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createRowStyles(theme), [theme]);
  const tint = iconColor ?? theme.colors.primary;
  const bg = iconBg ?? theme.colors.primarySoft;

  const content = (
    <>
      {icon && (
        <View style={[styles.iconWrap, { backgroundColor: bg }]}>
          <AppIcon name={icon} size={18} color={tint} />
        </View>
      )}
      <View style={styles.textCol}>
        <Text style={[styles.label, destructive && { color: theme.colors.danger }]} numberOfLines={1}>
          {label}
        </Text>
        {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
      </View>
      {value && <Text style={styles.value}>{value}</Text>}
      {showChevron && onPress && (
        <AppIcon name="chevronRight" size={14} color={theme.colors.textTertiary} />
      )}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.row, !isLast && styles.rowBorder, pressed && styles.rowPressed]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.row, !isLast && styles.rowBorder]}>{content}</View>;
}

export function ProgressBar({
  progress,
  color,
  height = 8,
  style,
}: {
  progress: number;
  color?: string;
  height?: number;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const fill = color ?? theme.colors.primary;
  const pct = Math.min(100, Math.max(0, progress));

  return (
    <View
      style={[{ height, borderRadius: height / 2, backgroundColor: theme.colors.borderSubtle, overflow: 'hidden' }, style]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: pct }}
    >
      <View style={{ width: `${pct}%`, height: '100%', backgroundColor: fill, borderRadius: height / 2 }} />
    </View>
  );
}

function createGroupedStyles(t: AppTheme) {
  return StyleSheet.create({
    wrapper: { marginBottom: t.spacing.section },
    groupTitle: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.9,
      textTransform: 'uppercase',
      color: t.colors.textTertiary,
      marginBottom: t.spacing.sm,
      marginLeft: t.spacing.xs,
    },
    card: {
      backgroundColor: t.colors.surface,
      borderRadius: t.radii.lg,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      overflow: 'hidden',
      ...t.shadows.sm,
    },
  });
}

function createRowStyles(t: AppTheme) {
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
      borderBottomColor: t.colors.borderSubtle,
    },
    rowPressed: { backgroundColor: t.colors.surfaceHover },
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
    value: { ...t.typography.caption, color: t.colors.textSecondary, fontWeight: '600' },
  });
}
