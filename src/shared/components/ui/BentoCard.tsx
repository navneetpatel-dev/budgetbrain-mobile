import { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { AppIcon, type AppIconName } from '@/features/navigation/components/AppIcon';
import { useTheme } from '@/shared/theme';
import { useSpringPress } from '@/shared/hooks/useSpringPress';

export interface BentoCardProps {
  title: string;
  amount: string;
  badgeText?: string;
  badgeColor?: string;
  icon: AppIconName;
  iconColor?: string;
  onPress?: () => void;
}

export function BentoCard({
  title,
  amount,
  badgeText,
  badgeColor,
  icon,
  iconColor,
  onPress,
}: BentoCardProps) {
  const theme = useTheme();
  const spring = useSpringPress();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const tint = iconColor ?? theme.colors.primary;
  const tagColor = badgeColor ?? tint;

  const content = (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.iconPod, { backgroundColor: tint + '1C' }]}>
          <AppIcon name={icon} size={16} color={tint} />
        </View>
        {badgeText ? (
          <Text style={[styles.badgeText, { color: tagColor }]}>{badgeText}</Text>
        ) : null}
      </View>

      <View style={styles.bottomBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.amount} numberOfLines={1}>
          {amount}
        </Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={spring.onPressIn}
        onPressOut={spring.onPressOut}
        style={styles.pressable}
        accessibilityRole="button"
        accessibilityLabel={`${title}: ${amount}`}
      >
        <Animated.View style={spring.style}>{content}</Animated.View>
      </Pressable>
    );
  }

  return content;
}

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    pressable: {
      flex: 1,
      minWidth: '47%',
    },
    card: {
      flex: 1,
      backgroundColor: t.colors.surface,
      borderRadius: t.radii.card,
      padding: t.spacing.md,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      ...t.shadows.sm,
      minHeight: 116,
      justifyContent: 'space-between',
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    iconPod: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '600',
    },
    bottomBlock: {
      marginTop: 8,
      gap: 2,
    },
    title: {
      fontSize: 12,
      fontWeight: '500',
      color: t.colors.textTertiary,
    },
    amount: {
      fontSize: 20,
      fontWeight: '700',
      letterSpacing: -0.4,
      color: t.colors.text,
      fontVariant: ['tabular-nums'],
    },
  });
}
