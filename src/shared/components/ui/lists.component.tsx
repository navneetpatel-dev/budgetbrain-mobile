import { memo, useEffect, useMemo, useState } from 'react';
import { Animated, View, Text, Pressable, ViewStyle } from 'react-native';
import { AppIcon, type AppIconName } from '@/features/navigation/components/AppIcon.component';
import { useTheme } from '@/shared/theme';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion.hook';
import { createGroupedStyles, createRowStyles } from './lists.styles';

export function GroupedCard({
  children,
  title,
  style,
  padded = false,
}: {
  children: React.ReactNode;
  title?: string;
  style?: ViewStyle;
  padded?: boolean;
}) {
  const theme = useTheme();
  const styles = useMemo(() => createGroupedStyles(theme), [theme]);

  return (
    <View style={[styles.wrapper, style]}>
      {title ? <Text style={styles.groupTitle}>{title}</Text> : null}
      <View style={[styles.card, padded && styles.cardPadded]}>{children}</View>
    </View>
  );
}

export const ListRow = memo(function ListRow({
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
        accessibilityRole="button"
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.row, !isLast && styles.rowBorder]}>{content}</View>;
});

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
  const reducedMotion = useReducedMotion();
  const [width] = useState(() => new Animated.Value(reducedMotion ? pct : 0));

  useEffect(() => {
    if (reducedMotion) {
      width.setValue(pct);
      return;
    }
    Animated.timing(width, {
      toValue: pct,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [pct, reducedMotion, width]);

  return (
    <View
      style={[{ height, borderRadius: height / 2, backgroundColor: theme.colors.borderSubtle, overflow: 'hidden' }, style]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: pct }}
    >
      <Animated.View
        style={{
          width: width.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
          height: '100%',
          backgroundColor: fill,
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}
