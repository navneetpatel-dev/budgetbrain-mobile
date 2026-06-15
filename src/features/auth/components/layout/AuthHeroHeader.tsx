import { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon } from '@/features/navigation/components/AppIcon';
import { AuthFeatureTickerRail } from '@/features/auth/components/ui/AuthFeatureTicker';
import { useTheme } from '@/shared/theme';

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
              <View style={styles.logoRing}>
                <View style={styles.logoBadge}>
                  <AppIcon name="wallet" size={compact ? 20 : 26} color="#fff" />
                </View>
              </View>

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
            <View style={styles.logoRing}>
              <View style={styles.logoBadge}>
                <AppIcon name="wallet" size={compact ? 22 : 28} color="#fff" />
              </View>
            </View>
            <Text style={styles.title}>
              Budget<Text style={styles.titleAccent}>Brain</Text>
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

function createStyles(
  t: ReturnType<typeof useTheme>,
  compact: boolean,
  branded: boolean,
) {
  const logoSize = branded ? (compact ? 40 : 52) : 44;
  const logoRadius = branded ? (compact ? 12 : 15) : 14;

  return StyleSheet.create({
    wrap: {
      overflow: 'hidden',
    },
    glow: {
      position: 'absolute',
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.07)',
    },
    glowAccent: { width: 140, height: 140, top: -50, right: -40, backgroundColor: 'rgba(255,255,255,0.06)' },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: branded ? 'stretch' : 'center',
      paddingBottom: branded ? (compact ? t.spacing.lg : t.spacing.xl) : t.spacing.xxl + 8,
    },
    brandCluster: {
      alignSelf: 'center',
      alignItems: 'center',
      width: '100%',
      maxWidth: branded && !compact ? 320 : undefined,
      gap: compact ? 6 : 8,
    },
    logoRing: {
      padding: 2,
      borderRadius: branded ? (compact ? 16 : 20) : 18,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.22)',
    },
    logoBadge: {
      width: logoSize,
      height: logoSize,
      borderRadius: logoRadius,
      backgroundColor: 'rgba(255,255,255,0.16)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: branded ? (compact ? 22 : 28) : 26,
      fontWeight: '800',
      color: '#fff',
      letterSpacing: -0.5,
      textAlign: 'center',
      lineHeight: branded ? (compact ? 24 : 30) : undefined,
    },
    titleAccent: {
      fontWeight: '800',
      color: 'rgba(255,255,255,0.92)',
    },
    tagline: {
      fontSize: compact ? 11 : 13,
      fontWeight: '500',
      color: 'rgba(255,255,255,0.75)',
      textAlign: 'center',
      letterSpacing: 0.15,
      lineHeight: compact ? 15 : 18,
    },
  });
}
