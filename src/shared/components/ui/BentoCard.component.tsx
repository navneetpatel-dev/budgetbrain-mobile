import { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { AppIcon, type AppIconName } from '@/features/navigation/components/AppIcon.component';
import { useTheme } from '@/shared/theme';
import { useSpringPress } from '@/shared/hooks/useSpringPress.hook';
import { createStyles } from './BentoCard.styles';

export interface BentoCardProps {
  title: string;
  amount?: string;
  value?: string;
  subtitle?: string;
  badgeText?: string;
  badgeColor?: string;
  icon: AppIconName;
  iconColor?: string;
  accentColor?: string;
  onPress?: () => void;
  style?: any;
}

export function BentoCard({
  title,
  amount,
  value,
  subtitle,
  badgeText,
  badgeColor,
  icon,
  iconColor,
  accentColor,
  onPress,
  style,
}: BentoCardProps) {
  const theme = useTheme();
  const spring = useSpringPress();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const displayAmount = amount ?? value ?? '';
  const tint = iconColor ?? accentColor ?? theme.colors.primary;
  const tagColor = badgeColor ?? tint;

  const content = (
    <View style={[styles.card, style]}>
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
        {displayAmount ? (
          <Text style={styles.amount} numberOfLines={1}>
            {displayAmount}
          </Text>
        ) : null}
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
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
