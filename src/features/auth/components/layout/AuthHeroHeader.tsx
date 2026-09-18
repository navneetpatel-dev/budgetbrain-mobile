import { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandLogoBadge } from '@/shared/components/brand/BrandLogoBadge';
import { AuthFeatureTickerRail } from '@/features/auth/components/ui/AuthFeatureTicker';
import { useTheme } from '@/shared/theme';
import { createStyles } from './AuthHeroHeader.styles';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function AuthHeroHeader({
  topInset,
  compact = false,
  branded = true,
  tagline,
  style,
}: {
  topInset: number;
  compact?: boolean;
  branded?: boolean;
  tagline?: string;
  style?: object;
}) {
  const theme = useTheme();
  const greeting = useMemo(() => getGreeting(), []);
  const heroTagline = tagline ?? `${greeting} · Welcome back`;
  const padX = branded ? (compact ? theme.spacing.lg : theme.spacing.xxl) : theme.spacing.xl;
  const styles = useMemo(() => createStyles(theme, compact, branded), [theme, compact, branded]);

  return (
    <View style={[styles.wrap, style]}>
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.14)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.65 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {branded && (
        <View style={[styles.glow, styles.glowAccent]} pointerEvents="none" />
      )}

      <View style={[styles.content, { paddingTop: topInset + 10, paddingHorizontal: padX }]}>
        {branded ? (
          <>
            <View style={styles.brandCluster}>
              <BrandLogoBadge compact={compact} branded={branded} />

              <Text style={styles.title}>
                Budget<Text style={styles.titleAccent}>Brain</Text>
              </Text>

              <Text style={styles.tagline}>{heroTagline}</Text>
            </View>

            <View style={{ marginTop: compact ? theme.spacing.md : theme.spacing.lg }}>
              <AuthFeatureTickerRail padX={padX} compact={compact} />
            </View>
          </>
        ) : (
          <>
            <BrandLogoBadge compact={compact} branded={branded} />
            <Text style={styles.title}>
              Budget<Text style={styles.titleAccent}>Brain</Text>
            </Text>
          </>
        )}
      </View>
    </View>
  );
}
