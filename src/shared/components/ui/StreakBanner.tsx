import { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/shared/theme';

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

function createStyles(t: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: {
      borderRadius: t.radii.card,
      padding: t.spacing.md,
      borderWidth: 1,
      borderColor: t.colors.borderSubtle,
      ...t.shadows.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.spacing.md,
    },
    flameBox: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: t.colors.warning + '24',
      alignItems: 'center',
      justifyContent: 'center',
    },
    flameEmoji: {
      fontSize: 22,
    },
    content: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 6,
    },
    title: {
      fontSize: 14,
      fontWeight: '700',
      color: t.colors.text,
      flex: 1,
    },
    tierPill: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: t.radii.full,
      backgroundColor: t.colors.warning + '20',
    },
    tierText: {
      fontSize: 10,
      fontWeight: '700',
      color: t.colors.warning,
      textTransform: 'uppercase',
    },
    subtitle: {
      fontSize: 12,
      color: t.colors.textSecondary,
      fontWeight: '400',
    },
  });
}
