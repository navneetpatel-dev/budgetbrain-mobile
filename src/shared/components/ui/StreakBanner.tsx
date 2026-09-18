import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/shared/theme';
import { createStyles } from './StreakBanner.styles';

export interface StreakBannerProps {
  streakDays: number;
  tier?: string;
  message?: string;
}

export function StreakBanner({
  streakDays,
  tier = 'Tier 2',
  message,
}: StreakBannerProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const defaultMessage = `You are on a roll! Keep zero-spend habits going strong.`;

  return (
    <LinearGradient
      colors={[theme.colors.surface, theme.colors.surfaceContainerHigh]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.flameBox}>
        <Text style={styles.flameEmoji}>🔥</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {streakDays} Days Zero-Spend Streak!
          </Text>
          <View style={styles.tierPill}>
            <Text style={styles.tierText}>{tier}</Text>
          </View>
        </View>
        <Text style={styles.subtitle} numberOfLines={1}>
          {message ?? defaultMessage}
        </Text>
      </View>
    </LinearGradient>
  );
}
